import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import readline from 'node:readline'
import { InstalledModel } from '../../src/types/settings'
import { RuntimeManager } from './runtimeManager'

/** Repos HF → id curto do catálogo (model_manager.py devolve o repo) */
const REPO_TO_ID: Record<string, string> = {
  'mobiuslabsgmbh/faster-whisper-large-v3-turbo': 'large-v3-turbo',
}

interface ModelEvent {
  event: string
  done?: number
  total?: number
  installed?: { repo: string; bytes: number }[]
}

function repoFromId(id: string): string {
  const found = Object.entries(REPO_TO_ID).find(([, v]) => v === id)
  return found ? found[0] : `Systran/faster-whisper-${id}`
}

function idFromRepo(repo: string): string {
  return REPO_TO_ID[repo] ?? repo.replace(/^Systran\/faster-whisper-/, '')
}

export class ModelManager {
  private downloading = new Set<string>()

  constructor(private readonly runtime: RuntimeManager, private readonly modelsDir: string, private readonly scriptsDir: string) {}

  /** Verificação barata (só disco) usada antes de cada transcrição */
  isInstalled(id: string): boolean {
    const dir = path.join(this.modelsDir, 'models--' + repoFromId(id).replace('/', '--'), 'snapshots')
    try {
      return fs.readdirSync(dir).some(snap => fs.existsSync(path.join(dir, snap, 'model.bin')))
    } catch { return false }
  }

  isDownloading(id: string) { return this.downloading.has(id) }

  async list(): Promise<InstalledModel[]> {
    const events = await this.call(['list', '--dir', this.modelsDir])
    const list = events.find(e => e.event === 'list')
    return (list?.installed ?? []).map(m => ({ id: idFromRepo(m.repo), bytes: m.bytes }))
  }

  async download(id: string, onProgress: (done: number, total: number) => void): Promise<void> {
    if (this.downloading.has(id)) throw new Error('Este modelo já está sendo baixado')
    this.downloading.add(id)
    try {
      await this.call(['download', id, '--dir', this.modelsDir], e => {
        if (e.event === 'progress') onProgress(e.done ?? 0, e.total ?? 0)
      })
    } finally {
      this.downloading.delete(id)
    }
  }

  async remove(id: string): Promise<void> {
    await this.call(['remove', id, '--dir', this.modelsDir])
  }

  private call(args: string[], onEvent?: (e: ModelEvent) => void): Promise<ModelEvent[]> {
    return new Promise((resolve, reject) => {
      const child = spawn(this.runtime.pythonExe, ['model_manager.py', ...args], {
        cwd: this.scriptsDir,
        windowsHide: true,
        env: { ...process.env, PYTHONIOENCODING: 'utf-8', HF_HUB_DISABLE_TELEMETRY: '1' },
      })
      const events: ModelEvent[] = []
      let stderr = ''
      readline.createInterface({ input: child.stdout }).on('line', line => {
        try { const e = JSON.parse(line); events.push(e); onEvent?.(e) } catch { /* linha que não é evento */ }
      })
      child.stderr.on('data', d => { stderr = (stderr + d.toString()).slice(-3000) })
      child.on('error', err => reject(new Error(`Falha ao executar o Python: ${err.message}`)))
      child.on('close', code => {
        if (code === 0) return resolve(events)
        const erro = stderr.split(/\r?\n/).reverse().find(l => l.startsWith('ERRO:'))
        reject(new Error(erro?.replace(/^ERRO:\s*/, '') || `model_manager terminou com código ${code}`))
      })
    })
  }
}
