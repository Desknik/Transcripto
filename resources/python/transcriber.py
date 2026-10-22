"""CLI única de transcrição do Transcripto (substitui transcrever.py e transcrever_diarizado.py).

  python transcriber.py -a audio.mp3 -o saida.json            transcrição normal
  python transcriber.py -a audio.mp3 -o saida.json --diarize  locutor por canal (estéreo; mono cai no normal)

Grava em -o um JSON {segments, duration, language, mode, modelo, processamento, via}.
Em stdout emite linhas JSON de progresso: {"event": "progress", "done": <s>, "total": <s>}.
Erros vão para stderr no formato "ERRO: <mensagem>" com código de saída 1.
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))  # Python embarcado (._pth) não inclui a pasta do script
import json, argparse

import vlk_whisper as vw

parser = argparse.ArgumentParser(description="Transcrição local com faster-whisper")
parser.add_argument("-a", "--audio", required=True, help="Caminho do arquivo de áudio")
parser.add_argument("-o", "--output", required=True, help="Arquivo JSON de saída")
parser.add_argument("-m", "--modelo", default=None, help="Modelo Whisper (padrão: VLK_MODEL)")
parser.add_argument("--diarize", action="store_true", help="Identifica locutores por canal (estéreo)")
args = parser.parse_args()


def progresso(feito, total):
    print(json.dumps({"event": "progress", "done": round(feito, 1), "total": round(total, 1)}), flush=True)


try:
    res = vw.executar(args.audio, diarizar=args.diarize, modelo=args.modelo, ao_segmento=progresso)
    Path(args.output).parent.mkdir(parents=True, exist_ok=True)
    Path(args.output).write_text(json.dumps(res, indent=2, ensure_ascii=False), encoding="utf-8")
except Exception as e:  # noqa: BLE001 - o app lê a última linha "ERRO:" do stderr
    print(f"ERRO: {e}", file=sys.stderr)
    sys.exit(1)

print(json.dumps({"event": "done", "mode": res["mode"], "via": res["via"], "processamento": res["processamento"]}),
      flush=True)
