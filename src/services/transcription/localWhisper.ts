import { spawn, ChildProcess } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import readline from 'node:readline';
import { BaseTranscriptionService } from './base';
import {
  TranscriptionProvider,
  TranscriptionRequest,
  TranscriptionResponse,
  OutputFormat,
  LOCAL_WHISPER_PROVIDER_ID,
} from '../../types/transcription';
import { AppSettings } from '../../types/settings';

export const LOCAL_SERVER_PORT = 8765;

export interface LocalWhisperServerStatus {
  running: boolean;
  busy?: boolean;
  model?: string;
  startedByApp: boolean;
}

interface LocalSegment {
  start: number;
  end: number;
  text: string;
  speaker?: string;
}

interface LocalResult {
  segments: LocalSegment[];
  duration: number;
  language?: string;
  mode: string;
}

export interface LocalWhisperConfig {
  /** python.exe do runtime gerenciado */
  python: string;
  /** Pasta com transcriber.py e whisper_server.py */
  scriptsDir: string;
  modelsDir: string;
  ffmpegPath: string;
  /** Lido a cada uso: o usuário pode mudar modelo/idioma/dispositivo nas Configurações */
  getSettings: () => AppSettings;
}

export class LocalWhisperTranscriptionService extends BaseTranscriptionService {
  private ownedServer: ChildProcess | null = null;
  private starting: Promise<void> | null = null;
  // O provedor local processa um arquivo por vez (GPU/VRAM compartilhada)
  private queueTail: Promise<unknown> = Promise.resolve();

  constructor(private readonly cfg: LocalWhisperConfig) {
    super();
  }

  /** Variáveis lidas pelo vlk_whisper.py */
  private get scriptEnv(): NodeJS.ProcessEnv {
    const s = this.cfg.getSettings();
    return {
      ...process.env,
      PYTHONIOENCODING: 'utf-8',
      VLK_MODEL: s.whisperModel,
      VLK_MODELS_DIR: this.cfg.modelsDir,
      VLK_DEVICE: s.device,
      VLK_LANGUAGE: s.language,
      VLK_FFMPEG: this.cfg.ffmpegPath,
      VLK_SERVER_PORT: String(LOCAL_SERVER_PORT),
      VLK_IDLE_MINUTES: String(s.idleMinutes),
      HF_HUB_OFFLINE: '1', // modelos são baixados pelas Configurações, nunca em silêncio durante o uso
    };
  }

  getProvider(): TranscriptionProvider {
    const model = this.cfg.getSettings().whisperModel;
    return {
      id: LOCAL_WHISPER_PROVIDER_ID,
      name: 'Local',
      local: true,
      models: [
        { id: 'transcricao', name: `Transcrição (${model})`, description: 'faster-whisper local, sem divisão de arquivo' },
        {
          id: 'diarizado',
          name: `Diarizada por canal (${model})`,
          description: 'Identifica locutores em áudio estéreo; mono usa a transcrição normal',
        },
      ],
    };
  }

  // ------------------------------------------------------------------ servidor

  async getServerStatus(): Promise<LocalWhisperServerStatus> {
    try {
      const res = await fetch(`http://127.0.0.1:${LOCAL_SERVER_PORT}/health`, { signal: AbortSignal.timeout(1500) });
      const data = await res.json();
      if (data?.ok) {
        return { running: true, busy: !!data.busy, model: data.model, startedByApp: this.ownedServer !== null };
      }
    } catch {
      // servidor fora do ar
    }
    return { running: false, startedByApp: false };
  }

  /** Inicia o servidor (carrega o modelo) e aguarda ficar pronto. Reinicia se estiver com outro modelo. */
  startServer(): Promise<void> {
    if (this.starting) return this.starting;
    this.starting = (async () => {
      const wanted = this.cfg.getSettings().whisperModel;
      const status = await this.getServerStatus();
      if (status.running) {
        if (status.model === wanted) return;
        if (!status.startedByApp) return; // servidor de terceiros: não mexe (o script cai no modo sem servidor)
        await this.stopServer();
      }

      const child = spawn(this.cfg.python, ['whisper_server.py'], {
        cwd: this.cfg.scriptsDir,
        stdio: ['ignore', 'pipe', 'pipe'],
        windowsHide: true,
        env: this.scriptEnv,
      });
      this.ownedServer = child;
      let output = '';
      const collect = (d: Buffer) => { output = (output + d.toString()).slice(-2000); };
      child.stdout?.on('data', collect);
      child.stderr?.on('data', collect);
      let exited = false;
      child.on('exit', () => {
        exited = true;
        if (this.ownedServer === child) this.ownedServer = null;
      });

      const deadline = Date.now() + 180_000; // carregar o modelo pode levar vários segundos
      while (Date.now() < deadline) {
        if ((await this.getServerStatus()).running) return;
        if (exited) throw new Error(`Servidor local encerrou ao iniciar: ${output.trim() || 'sem saída'}`);
        await new Promise(r => setTimeout(r, 1000));
      }
      child.kill();
      throw new Error('Tempo esgotado aguardando o servidor local iniciar');
    })().finally(() => { this.starting = null; });
    return this.starting;
  }

  async stopServer(): Promise<void> {
    try {
      await fetch(`http://127.0.0.1:${LOCAL_SERVER_PORT}/shutdown`, { method: 'POST', signal: AbortSignal.timeout(3000) });
    } catch {
      this.ownedServer?.kill();
    }
    this.ownedServer = null;
  }

  /** Ao fechar o app, encerra apenas o servidor que o próprio app iniciou. */
  async dispose(): Promise<void> {
    if (this.ownedServer) await this.stopServer();
  }

  // ------------------------------------------------------------------ transcrição

  transcribe(request: TranscriptionRequest): Promise<TranscriptionResponse> {
    const job = this.queueTail.then(() => this.run(request));
    this.queueTail = job.catch(() => undefined);
    return job;
  }

  private async run(request: TranscriptionRequest): Promise<TranscriptionResponse> {
    try {
      this.validateRequest(request);
      const diarize = request.model === 'diarizado';

      // Sobe o servidor só quando há de fato algo para transcrever.
      // Se falhar, o próprio script cai no modo "carrega, processa e descarrega".
      try {
        await this.startServer();
      } catch (e) {
        console.warn('Local Whisper: servidor não iniciou, usando modo sem servidor:', e);
      }

      const outFile = path.join(os.tmpdir(), `transcripto_local_${Date.now()}_${Math.random().toString(36).slice(2)}.json`);
      try {
        const args = ['-a', request.filePath, '-o', outFile];
        if (diarize) args.push('--diarize');
        await this.runScript(args);
        const result: LocalResult = JSON.parse(fs.readFileSync(outFile, 'utf-8'));
        return {
          success: true,
          text: this.format(result, request.outputFormat || 'text'),
          language: result.language || request.language,
          duration: result.duration,
        };
      } finally {
        fs.rm(outFile, { force: true }, () => undefined);
      }
    } catch (error) {
      console.error('Local Whisper transcription error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido na transcrição local' };
    }
  }

  private runScript(args: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      const child = spawn(this.cfg.python, ['transcriber.py', ...args], {
        cwd: this.cfg.scriptsDir,
        windowsHide: true,
        env: this.scriptEnv,
      });
      let stderr = '';
      child.stderr.on('data', d => { stderr = (stderr + d.toString()).slice(-4000); });
      readline.createInterface({ input: child.stdout }).on('line', () => undefined); // eventos de progresso: ignorados por ora
      child.on('error', err => reject(new Error(`Falha ao executar o Python: ${err.message}`)));
      child.on('close', code => {
        if (code === 0) resolve();
        else reject(new Error(this.lastMessage(stderr) || `O script terminou com código ${code}`));
      });
    });
  }

  private lastMessage(stderr: string): string {
    const lines = stderr.trim().split(/\r?\n/).filter(Boolean);
    const erro = [...lines].reverse().find(l => l.startsWith('ERRO:'));
    return (erro ?? lines[lines.length - 1] ?? '').replace(/^ERRO:\s*/, '');
  }

  // ------------------------------------------------------------------ formatos de saída

  private label(s: LocalSegment): string {
    return s.speaker ? `${s.speaker}: ${s.text}` : s.text;
  }

  private timestamp(seconds: number, sep: ',' | '.'): string {
    const ms = Math.round(seconds * 1000);
    const pad = (n: number, w = 2) => String(n).padStart(w, '0');
    return `${pad(Math.floor(ms / 3_600_000))}:${pad(Math.floor(ms / 60_000) % 60)}:${pad(Math.floor(ms / 1000) % 60)}${sep}${pad(ms % 1000, 3)}`;
  }

  private format(result: LocalResult, format: OutputFormat): string {
    const segs = result.segments;
    const text = segs.map(s => this.label(s)).join('\n');

    switch (format) {
      case 'srt':
        return segs
          .map((s, i) => `${i + 1}\n${this.timestamp(s.start, ',')} --> ${this.timestamp(s.end, ',')}\n${this.label(s)}\n`)
          .join('\n');
      case 'vtt':
        return 'WEBVTT\n\n' + segs
          .map(s => `${this.timestamp(s.start, '.')} --> ${this.timestamp(s.end, '.')}\n${this.label(s)}\n`)
          .join('\n');
      case 'json':
        return JSON.stringify({ text }, null, 2);
      case 'verbose_json':
        return JSON.stringify({
          task: 'transcribe',
          language: result.language ?? this.cfg.getSettings().language,
          duration: result.duration,
          text,
          segments: segs.map((s, i) => ({ id: i, ...s })),
        }, null, 2);
      default:
        return text;
    }
  }

  async testConnection(): Promise<{ success: boolean; error?: string }> {
    if (!fs.existsSync(this.cfg.python)) return { success: false, error: 'Motor local não instalado' };
    return { success: true };
  }
}
