"""Núcleo de transcrição do Transcripto (faster-whisper), compartilhado pela CLI e pelo servidor local.

Toda a configuração vem de variáveis de ambiente definidas pelo app (nada de .env):
  VLK_MODEL          nome do modelo ou repo HF         (padrão: large-v3-turbo)
  VLK_MODELS_DIR     pasta onde os modelos ficam       (padrão: cache do huggingface)
  VLK_DEVICE         auto | cuda | cpu                 (padrão: auto)
  VLK_LANGUAGE       código do idioma (pt, en, ...) ou "auto" para detectar   (padrão: pt)
  VLK_FFMPEG         caminho do ffmpeg                 (padrão: "ffmpeg" no PATH)
  VLK_SERVER_PORT    porta do servidor local           (padrão: 8765)
  VLK_IDLE_MINUTES   ociosidade do servidor, 0 = nunca (padrão: 0)
"""
import os, sys, json, shutil, subprocess, tempfile, time, urllib.request, urllib.error
from pathlib import Path


# Windows: registra as DLLs de CUDA (cublas, cudnn, cuda_nvrtc, cuda_runtime) instaladas via pip,
# tanto por add_dll_directory quanto no PATH (alguns carregadores de DLL só respeitam um dos dois)
def registrar_dlls_cuda():
    if os.name != "nt":
        return
    py_dir = Path(sys.executable).resolve().parent
    candidatos = [py_dir / "Lib" / "site-packages", py_dir.parent / "Lib" / "site-packages"]  # embarcado | venv
    pastas = ["cuda_runtime", "cublas", "cudnn", "cuda_nvrtc"]
    dll_dirs = [base / "nvidia" / p / "bin" for base in candidatos for p in pastas
                if (base / "nvidia" / p / "bin").is_dir()]
    for d in dll_dirs:
        os.add_dll_directory(str(d))
    os.environ["PATH"] = os.pathsep.join([str(d) for d in dll_dirs] + [os.environ.get("PATH", "")])


registrar_dlls_cuda()


# ---------------------------------------------------------------- configuração

def config():
    def inteiro(chave, padrao):
        try:
            return int(os.environ.get(chave, padrao))
        except ValueError:
            return padrao

    idioma = os.environ.get("VLK_LANGUAGE", "pt").strip().lower() or "pt"
    return {
        "modelo": os.environ.get("VLK_MODEL", "large-v3-turbo").strip() or "large-v3-turbo",
        "pasta_modelos": os.environ.get("VLK_MODELS_DIR") or None,
        "dispositivo": os.environ.get("VLK_DEVICE", "auto").strip().lower(),
        "idioma": None if idioma == "auto" else idioma,
        "ffmpeg": os.environ.get("VLK_FFMPEG") or "ffmpeg",
        "porta": inteiro("VLK_SERVER_PORT", 8765),
        # 0 = nunca desliga; > 0 = minutos sem jobs até o servidor se encerrar
        "ociosidade_min": inteiro("VLK_IDLE_MINUTES", 0),
    }


def escolher_dispositivo(preferido="auto"):
    """Retorna (device, compute_type). 'auto' usa CUDA se houver GPU compatível, senão CPU int8."""
    if preferido != "cpu":
        try:
            import ctranslate2
            if ctranslate2.get_cuda_device_count() > 0:
                return "cuda", "float16"
        except Exception:  # noqa: BLE001 - DLLs ausentes etc. equivalem a "sem GPU"
            pass
        if preferido == "cuda":
            raise RuntimeError("GPU NVIDIA/CUDA não disponível (verifique driver e dependências do motor local)")
    return "cpu", "int8"


# ---------------------------------------------------------------- áudio (PyAV + ffmpeg)

def _abrir(audio_path):
    import av
    return av.open(str(audio_path))


def contar_canais(audio_path):
    with _abrir(audio_path) as c:
        return c.streams.audio[0].channels if c.streams.audio else 1


def separar_canais(audio_path, pasta_tmp, ffmpeg="ffmpeg"):
    esquerdo = Path(pasta_tmp) / "_canal_esquerdo.wav"
    direito = Path(pasta_tmp) / "_canal_direito.wav"
    # channelsplit numa chamada só - mais confiável no Windows do que -map_channel
    cmd = [
        ffmpeg, "-y", "-i", str(audio_path),
        "-filter_complex", "channelsplit=channel_layout=stereo[left][right]",
        "-map", "[left]", str(esquerdo),
        "-map", "[right]", str(direito),
    ]
    flags = subprocess.CREATE_NO_WINDOW if os.name == "nt" else 0
    r = subprocess.run(cmd, capture_output=True, text=True, creationflags=flags)
    if r.returncode != 0:
        raise RuntimeError("Falha ao separar canais (ffmpeg): " + r.stderr[-1500:])
    return esquerdo, direito


# ---------------------------------------------------------------- transcrição

def carregar_modelo(nome, cfg=None):
    from faster_whisper import WhisperModel
    cfg = cfg or config()
    device, compute = escolher_dispositivo(cfg["dispositivo"])
    return WhisperModel(nome, device=device, compute_type=compute, download_root=cfg["pasta_modelos"])


def _transcrever_arquivo(model, audio_path, cfg, locutor=None, ao_segmento=None):
    segments, info = model.transcribe(
        str(audio_path), beam_size=5, language=cfg["idioma"], vad_filter=True, word_timestamps=True,
        hallucination_silence_threshold=2, repetition_penalty=1.1,
    )
    out = []
    for s in segments:
        seg = {"start": round(s.start, 2), "end": round(s.end, 2), "text": s.text.strip()}
        if locutor:
            seg["speaker"] = locutor
        out.append(seg)
        if ao_segmento:
            ao_segmento(s.end, info.duration)
    return out, info.duration, info.language


def transcrever(model, audio_path, diarizar=False, cfg=None, ao_segmento=None):
    """Retorna dict {segments, duration, mode, language}.

    diarizar=True + áudio estéreo -> um locutor por canal.
    diarizar=True + mono -> fallback para a transcrição normal (sem locutor), mode='mono_fallback'.
    """
    cfg = cfg or config()
    if diarizar and contar_canais(audio_path) >= 2:
        tmp = tempfile.mkdtemp(prefix="vlk_canais_")
        try:
            esq, dir_ = separar_canais(audio_path, tmp, cfg["ffmpeg"])
            seg1, dur, lang = _transcrever_arquivo(model, esq, cfg, "Locutor 1", ao_segmento)
            seg2, _, _ = _transcrever_arquivo(model, dir_, cfg, "Locutor 2")
        finally:
            shutil.rmtree(tmp, ignore_errors=True)
        return {"segments": sorted(seg1 + seg2, key=lambda s: s["start"]),
                "duration": dur, "language": lang, "mode": "diarizado_por_canal"}

    segs, dur, lang = _transcrever_arquivo(model, audio_path, cfg, None, ao_segmento)
    return {"segments": segs, "duration": dur, "language": lang,
            "mode": "mono_fallback" if diarizar else "normal"}


# ---------------------------------------------------------------- cliente do servidor

def _url(cfg, caminho):
    return f"http://127.0.0.1:{cfg['porta']}{caminho}"


def servidor_status(cfg=None):
    """Retorna o dict de /health se o servidor estiver no ar, senão None."""
    cfg = cfg or config()
    try:
        with urllib.request.urlopen(_url(cfg, "/health"), timeout=1.5) as r:
            dados = json.loads(r.read().decode("utf-8"))
            return dados if dados.get("ok") else None
    except (urllib.error.URLError, OSError, ValueError):
        return None


def transcrever_via_servidor(audio_path, diarizar, cfg=None):
    cfg = cfg or config()
    corpo = json.dumps({"audio": str(Path(audio_path).resolve()), "diarizar": diarizar,
                        "idioma": cfg["idioma"]}).encode("utf-8")
    req = urllib.request.Request(_url(cfg, "/transcribe"), data=corpo,
                                 headers={"Content-Type": "application/json"}, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=None) as r:
            return json.loads(r.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        detalhe = e.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"Servidor retornou erro {e.code}: {detalhe}")


def executar(audio_path, diarizar=False, modelo=None, ao_segmento=None):
    """Transcreve usando o servidor se ele estiver no ar (com o mesmo modelo e idioma); senão carrega,
    processa e descarrega localmente. Retorna o dict de transcrever() + 'modelo', 'processamento', 'via'."""
    if not Path(audio_path).is_file():
        raise FileNotFoundError(f"Arquivo de áudio não encontrado: {audio_path}")
    cfg = config()
    modelo = modelo or cfg["modelo"]
    inicio = time.time()

    status = servidor_status(cfg)
    if status and status.get("model") == modelo:
        res = transcrever_via_servidor(audio_path, diarizar, cfg)
        res["via"] = "servidor"
    else:
        model = carregar_modelo(modelo, cfg)
        try:
            res = transcrever(model, audio_path, diarizar, cfg, ao_segmento)
        finally:
            del model
        res["via"] = "local"

    res["modelo"] = modelo
    res["processamento"] = round(time.time() - inicio, 1)
    return res
