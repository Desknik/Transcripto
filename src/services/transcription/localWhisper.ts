import { spawn, ChildProcess } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { BaseTranscriptionService } from './base';
import {
  TranscriptionProvider,
  TranscriptionRequest,
  TranscriptionResponse,
  OutputFormat,
  LOCAL_WHISPER_PROVIDER_ID,
} from '../../types/transcription';

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
  mode: string;
}

export interface LocalWhisperConfig {
  python: string;
  transcribeScript: string;
  diarizeScript?: string;
  serverScript: string;
  autostart: boolean;
}

/** Lê KEY=VALUE do .env que fica ao lado dos scripts Python (fonte única de porta/modelo/ociosidade). */
function readScriptEnv(scriptDir: string): Record<string, string> {
  const values: Record<string, string> = {};
  try {
    const file = fs.readFileSync(path.join(scriptDir, '.env'), 'utf-8');
    const content = file.charCodeAt(0) === 0xfeff ? file.slice(1) : file;
    for (const raw of content.split(/\r?\n/)) {
      const line = raw.trim();
      if (!line || line.startsWith('#') || !line.includes('=')) continue;
      const idx = line.indexOf('=');
      values[line.slice(0, idx).trim()] = line.slice(idx + 1).split(' #')[0].trim().replace(/^["']|["']$/g, '');
    }
  } catch {
    // .env é opcional: valem os padrões dos scripts
  }
  return values;
}

/** Retorna a configuração se o .env do Transcripto estiver preenchido e os arquivos existirem. */
export function resolveLocalWhisperConfig(): LocalWhisperConfig | null {
  const python = process.env.LOCAL_WHISPER_PYTHON?.trim();
  const transcribeScript = process.env.LOCAL_WHISPER_TRANSCRIBE_SCRIPT?.trim();
  if (!python || !transcribeScript) return null;
  if (!fs.existsSync(python) || !fs.existsSync(transcribeScript)) {
    console.warn('Local Whisper: caminho do Python ou do script não encontrado; provedor desativado');
    return null;
  }

  const diarizeScript = process.env.LOCAL_WHISPER_DIARIZE_SCRIPT?.trim();
  const serverScript =
    process.env.LOCAL_WHISPER_SERVER_SCRIPT?.trim() ||
    path.join(path.dirname(transcribeScript), 'whisper_server.py');

  return {
    python,
    transcribeScript,
    diarizeScript: diarizeScript && fs.existsSync(diarizeScript) ? diarizeScript : undefined,
    serverScript,
    autostart: (process.env.LOCAL_WHISPER_AUTOSTART ?? 'true').toLowerCase() !== 'false',
  };
}

export class LocalWhisperTranscriptionService extends BaseTranscriptionService {
  private ownedServer: ChildProcess | null = null;
  private starting: Promise<void> | null = null;
  // O provedor local processa um arquivo por vez (GPU/VRAM compartilhada)
  private queueTail: Promise<unknown> = Promise.resolve();

  constructor(private readonly cfg: LocalWhisperConfig) {
    super();
  }

  private get scriptEnv() {
    return readScriptEnv(path.dirname(this.cfg.transcribeScript));
  }

  private get port(): number {
    const p = parseInt(this.scriptEnv.WHISPER_SERVER_PORT ?? '', 10);
    return Number.isFinite(p) ? p : 8765;
  }

  private get modelName(): string {
    return this.scriptEnv.WHISPER_MODEL || 'large-v3-turbo';
  }

  getProvider(): TranscriptionProvider {
    const models = [
      {
        id: 'transcricao',
        name: `Transcrição (${this.modelName})`,
        description: 'faster-whisper local na GPU, sem divisão de arquivo',
      },
    ];
    if (this.cfg.diarizeScript) {
      models.push({
        id: 'diarizado',
        name: `Diarizada por canal (${this.modelName})`,
        description: 'Identifica locutores em áudio estéreo; mono usa a transcrição normal',
      });
    }
    return { id: LOCAL_WHISPER_PROVIDER_ID, name: 'Local', local: true, models };
  }

  // ------------------------------------------------------------------ servidor

  async getServerStatus(): Promise<LocalWhisperServerStatus> {
    try {
      const res = await fetch(`http://127.0.0.1:${this.port}/health`, { signal: AbortSignal.timeout(1500) });
      const data = await res.json();
      if (data?.ok) {
        return { running: true, busy: !!data.busy, model: data.model, startedByApp: this.ownedServer !== null };
      }
    } catch {
      // servidor fora do ar
    }
    return { running: false, startedByApp: false };
  }

  /** Inicia o servidor (carrega o modelo) e aguarda ficar pronto. Não faz nada se já estiver no ar. */
  startServer(): Promise<void> {
    if (this.starting) return this.starting;
    this.starting = (async () => {
      if ((await this.getServerStatus()).running) return;
      if (!fs.existsSync(this.cfg.serverScript)) {
        throw new Error(`Script do servidor não encontrado: ${this.cfg.serverScript}`);
      }

      const child = spawn(this.cfg.python, [this.cfg.serverScript], {
        cwd: path.dirname(this.cfg.serverScript),
        stdio: ['ignore', 'pipe', 'pipe'],
        windowsHide: true,
        env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
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
      await fetch(`http://127.0.0.1:${this.port}/shutdown`, { method: 'POST', signal: AbortSignal.timeout(3000) });
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
      const script = diarize ? this.cfg.diarizeScript : this.cfg.transcribeScript;
      if (!script) return { success: false, error: 'Script de diarização não configurado (LOCAL_WHISPER_DIARIZE_SCRIPT)' };

      // Opção C: sobe o servidor só quando há de fato algo para transcrever.
      // Se falhar, o próprio script cai no modo "carrega, processa e descarrega".
      if (this.cfg.autostart) {
        try {
          await this.startServer();
        } catch (e) {
          console.warn('Local Whisper: servidor não iniciou, usando modo sem servidor:', e);
        }
      }

      const outFile = path.join(os.tmpdir(), `transcripto_local_${Date.now()}_${Math.random().toString(36).slice(2)}.json`);
      try {
        await this.runScript(script, ['-a', request.filePath, '--json', '-o', outFile]);
        const result: LocalResult = JSON.parse(fs.readFileSync(outFile, 'utf-8'));
        return {
          success: true,
          text: this.format(result, request.outputFormat || 'text'),
          language: request.language || 'pt',
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

  private runScript(script: string, args: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      const child = spawn(this.cfg.python, [script, ...args], {
        cwd: path.dirname(script),
        windowsHide: true,
        env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
      });
      let stderr = '';
      child.stderr.on('data', d => { stderr = (stderr + d.toString()).slice(-4000); });
      child.stdout.resume();
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
          language: 'portuguese',
          duration: result.duration,
          text,
          segments: segs.map((s, i) => ({ id: i, ...s })),
        }, null, 2);
      default:
        return text;
    }
  }

  async testConnection(): Promise<{ success: boolean; error?: string }> {
    if (!fs.existsSync(this.cfg.python)) return { success: false, error: 'Python não encontrado' };
    if (!fs.existsSync(this.cfg.transcribeScript)) return { success: false, error: 'Script não encontrado' };
    return { success: true };
  }
}
