"""Gerência dos modelos Whisper no disco (usada pelo app; saída em linhas JSON).

  python model_manager.py download <modelo> --dir <pasta>    baixa; emite {"event":"progress","done":B,"total":B}
  python model_manager.py list --dir <pasta>                  lista {"installed": [{"id","bytes"}]}
  python model_manager.py remove <modelo> --dir <pasta>       apaga o modelo do disco

<modelo> é um nome do faster-whisper (tiny, small, large-v3, large-v3-turbo, ...) ou um repo HF "org/nome".
Os arquivos ficam no layout de cache do huggingface dentro de --dir, o mesmo que o WhisperModel lê.
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))  # Python embarcado (._pth) não inclui a pasta do script
import json, argparse, shutil


def repo_de(modelo):
    from faster_whisper.utils import _MODELS
    return _MODELS.get(modelo, modelo)


def pasta_do_repo(pasta, repo):
    return Path(pasta) / ("models--" + repo.replace("/", "--"))


def emitir(**dados):
    print(json.dumps(dados, ensure_ascii=False), flush=True)


def baixar(modelo, pasta):
    from huggingface_hub import HfApi, snapshot_download
    from tqdm.auto import tqdm

    repo = repo_de(modelo)
    padroes = ["config.json", "preprocessor_config.json", "model.bin", "tokenizer.json", "vocabulary.*"]
    info = HfApi().model_info(repo, files_metadata=True)
    total = sum((f.size or 0) for f in info.siblings
                if any(Path(f.rfilename).match(p) for p in padroes))
    estado = {"done": 0}

    class Barra(tqdm):
        def __init__(self, *a, **kw):
            kw.pop("name", None)
            super().__init__(*a, **kw)

        def update(self, n=1):
            r = super().update(n)
            if self.unit == "B" and n:
                estado["done"] += n
                emitir(event="progress", done=estado["done"], total=total)
            return r

    snapshot_download(repo, cache_dir=str(pasta), allow_patterns=padroes, tqdm_class=Barra)
    emitir(event="done", model=modelo, bytes=tamanho(pasta_do_repo(pasta, repo)))


def tamanho(caminho):
    return sum(f.stat().st_size for f in Path(caminho).rglob("*") if f.is_file() and not f.is_symlink())


def listar(pasta):
    instalados = []
    for d in sorted(Path(pasta).glob("models--*")):
        if any(d.glob("snapshots/*/model.bin")):
            instalados.append({"repo": d.name[len("models--"):].replace("--", "/"), "bytes": tamanho(d)})
    emitir(event="list", installed=instalados)


def remover(modelo, pasta):
    alvo = pasta_do_repo(pasta, repo_de(modelo))
    shutil.rmtree(alvo, ignore_errors=True)
    emitir(event="done", model=modelo)


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("comando", choices=["download", "list", "remove"])
    p.add_argument("modelo", nargs="?")
    p.add_argument("--dir", required=True)
    a = p.parse_args()
    try:
        if a.comando == "list":
            listar(a.dir)
        elif not a.modelo:
            raise ValueError("informe o modelo")
        elif a.comando == "download":
            baixar(a.modelo, a.dir)
        else:
            remover(a.modelo, a.dir)
    except Exception as e:  # noqa: BLE001
        print(f"ERRO: {e}", file=sys.stderr)
        sys.exit(1)
