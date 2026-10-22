"""Servidor local do faster-whisper: carrega o modelo uma vez e atende jobs em fila (um por vez).

Uso:  python whisper_server.py   (configurado por VLK_MODEL, VLK_SERVER_PORT, VLK_IDLE_MINUTES, ...)
Rotas (somente 127.0.0.1):
  GET  /health      -> {"ok": true, "model": "...", "busy": false, "idle_minutes": 0, "device": "cuda"}
  POST /transcribe  -> body {"audio": "<caminho>", "diarizar": false, "idioma": "pt"}
  POST /shutdown    -> encerra o servidor e libera a memória do modelo
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))  # Python embarcado (._pth) não inclui a pasta do script
import json, threading, time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

import vlk_whisper as vw

cfg = vw.config()
gpu_lock = threading.Lock()
estado = {"ultimo_uso": time.time(), "ocupado": False}
model = None
httpd = None


class Handler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        print("[server]", fmt % args, flush=True)

    def _responder(self, codigo, dados):
        corpo = json.dumps(dados, ensure_ascii=False).encode("utf-8")
        self.send_response(codigo)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(corpo)))
        self.end_headers()
        self.wfile.write(corpo)

    def do_GET(self):
        if self.path == "/health":
            self._responder(200, {"ok": True, "model": cfg["modelo"], "busy": estado["ocupado"],
                                  "idle_minutes": cfg["ociosidade_min"], "device": estado.get("device")})
        else:
            self._responder(404, {"error": "not found"})

    def do_POST(self):
        if self.path == "/shutdown":
            self._responder(200, {"ok": True})
            threading.Thread(target=httpd.shutdown, daemon=True).start()
            return
        if self.path != "/transcribe":
            self._responder(404, {"error": "not found"})
            return
        try:
            tamanho = int(self.headers.get("Content-Length", 0))
            req = json.loads(self.rfile.read(tamanho).decode("utf-8"))
            job_cfg = {**cfg, "idioma": req.get("idioma", cfg["idioma"])}
            with gpu_lock:  # fila serial: um job por vez
                estado["ocupado"] = True
                inicio = time.time()
                try:
                    res = vw.transcrever(model, req["audio"], bool(req.get("diarizar")), job_cfg)
                finally:
                    estado["ocupado"] = False
                    estado["ultimo_uso"] = time.time()
            res["processamento"] = round(time.time() - inicio, 1)
            self._responder(200, res)
        except Exception as e:  # noqa: BLE001 - devolve o erro ao cliente em vez de derrubar o servidor
            self._responder(500, {"error": str(e)})


def vigia_ociosidade():
    limite = cfg["ociosidade_min"] * 60
    while True:
        time.sleep(15)
        if not estado["ocupado"] and time.time() - estado["ultimo_uso"] > limite:
            print(f"[server] {cfg['ociosidade_min']} min de ociosidade - encerrando.", flush=True)
            httpd.shutdown()
            return


if __name__ == "__main__":
    if vw.servidor_status(cfg):
        print(f"Servidor já está em execução na porta {cfg['porta']}.", flush=True)
        sys.exit(0)

    try:
        httpd = ThreadingHTTPServer(("127.0.0.1", cfg["porta"]), Handler)
    except OSError as e:
        print(f"Não foi possível abrir a porta {cfg['porta']}: {e}", flush=True)
        sys.exit(1)

    print(f"Carregando modelo {cfg['modelo']}...", flush=True)
    try:
        model = vw.carregar_modelo(cfg["modelo"], cfg)
    except Exception as e:  # noqa: BLE001
        print(f"ERRO: {e}", file=sys.stderr, flush=True)
        sys.exit(1)
    estado["device"] = vw.escolher_dispositivo(cfg["dispositivo"])[0]
    estado["ultimo_uso"] = time.time()
    print(f"Servidor pronto em http://127.0.0.1:{cfg['porta']} (ociosidade: "
          f"{cfg['ociosidade_min'] or 'desligada'} min)", flush=True)

    if cfg["ociosidade_min"] > 0:
        threading.Thread(target=vigia_ociosidade, daemon=True).start()

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        httpd.server_close()
        print("Servidor encerrado.", flush=True)
