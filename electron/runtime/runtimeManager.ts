import { spawn, execFile } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import readline from 'node:readline'
import { downloadFile } from './download'
import { HardwareInfo, recommendModel } from '../../src/types/settings'

const PYTHON_VERSION = '3.12.10'
const PYTHON_URL = `https://www.python.org/ftp/python/${PYTHON_VERSION}/python-${PYTHON_VERSION}-embed-amd64.zip`
const GET_PIP_URL = 'https://bootstrap.pypa.io/get-pip.py'
/** Incrementar quando requirements-*.txt mudarem, para reinstalar as dependências. */
const DEPS_REVISION = 1

export type SetupStage = 'gpu' | 'python' | 'pip' | 'deps' | 'cuda' | 'model' | 'verify'

export interface SetupProgress {
  stage: SetupStage
  message: string
  /** 0–100 da etapa atual, quando conhecido */
  percent?: number
}

export interface RuntimePaths {
  /** Pasta gravável do runtime: python/, state.json */
  runtimeDir: string
  /** Pasta dos modelos (layout de cache do huggingface) */
  modelsDir: string
  /** Pasta com transcriber.py, whisper_server.py, requirements-*.txt */
  scriptsDir: string
}

interface RuntimeState {
  depsRevision?: number
  cuda?: boolean
  pythonVersion?: string
}

export interface RuntimeStatus {
  ready: boolean
  hasGpu: boolean
  hardware: HardwareInfo
  recommendedModel: string
  cudaInstalled: boolean
  /** Etapas que ainda faltam: 'python' | 'deps' | 'model' */
  missing: string[]
}

export class RuntimeManager {
  constructor(private readonly paths: RuntimePaths) {}

  get pythonDir() { return path.join(this.paths.runtimeDir, 'python') }
  get pythonExe() { return path.join(this.pythonDir, 'python.exe') }
  private get stateFile() { return path.join(this.paths.runtimeDir, 'state.json') }

  private readState(): RuntimeState {
    try { return JSON.parse(fs.readFileSync(this.stateFile, 'utf-8')) } catch { return {} }
  }

  private writeState(patch: RuntimeState) {
    fs.mkdirSync(this.paths.runtimeDir, { recursive: true })
    fs.writeFileSync(this.stateFile, JSON.stringify({ ...this.readState(), ...patch }, null, 2))
  }

  // ------------------------------------------------------------------ detecção

  /** GPU NVIDIA presente? (nvidia-smi acompanha o driver) */
  async detectGpu(): Promise<boolean> {
    return (await this.detectHardware()).hasGpu
  }

  /** GPU (nome e VRAM da maior), RAM e núcleos de CPU, para recomendar o modelo. */
  detectHardware(): Promise<HardwareInfo> {
    const base = { ramMB: Math.round(os.totalmem() / 1048576), cpuCores: os.cpus().length }
    return new Promise(resolve => {
      execFile('nvidia-smi', ['--query-gpu=name,memory.total', '--format=csv,noheader,nounits'],
        { windowsHide: true, timeout: 8000 }, (err, stdout) => {
          const gpus = err ? [] : stdout.trim().split(/\r?\n/).map(line => {
            const [name, mem] = line.split(',').map(x => x.trim())
            return { name, vramMB: parseInt(mem, 10) }
          }).filter(g => g.name && Number.isFinite(g.vramMB))
          const best = gpus.sort((a, b) => b.vramMB - a.vramMB)[0]
          resolve(best ? { ...base, hasGpu: true, gpuName: best.name, vramMB: best.vramMB } : { ...base, hasGpu: false })
        })
    })
  }

  /** Verificação barata (só disco): python e dependências instalados. A GPU só é conferida em getStatus. */
  isInstalled(): boolean {
    return fs.existsSync(this.pythonExe) && this.readState().depsRevision === DEPS_REVISION
  }

  async getStatus(modelInstalled: boolean): Promise<RuntimeStatus> {
    const state = this.readState()
    const hardware = await this.detectHardware()
    const hasGpu = hardware.hasGpu
    const missing: string[] = []
    if (!fs.existsSync(this.pythonExe)) missing.push('python')
    else if (state.depsRevision !== DEPS_REVISION || (hasGpu && !state.cuda)) missing.push('deps')
    if (!modelInstalled) missing.push('model')
    return {
      ready: missing.length === 0, hasGpu, hardware, recommendedModel: recommendModel(hardware),
      cudaInstalled: !!state.cuda, missing,
    }
  }

  // ------------------------------------------------------------------ instalação

  /** Instala o que faltar (idempotente e retomável). O modelo é baixado por quem chama (ModelManager). */
  async setup(onProgress: (p: SetupProgress) => void): Promise<void> {
    const state = this.readState()

    onProgress({ stage: 'gpu', message: 'Detectando GPU NVIDIA…' })
    const hasGpu = await this.detectGpu()

    if (!fs.existsSync(path.join(this.pythonDir, 'Lib', 'site-packages', 'pip'))) {
      await this.installPython(onProgress)
    }

    const needDeps = state.depsRevision !== DEPS_REVISION
    if (needDeps) {
      await this.pip(['install', '-r', path.join(this.paths.scriptsDir, 'requirements-runtime.txt')], 'deps',
        'Instalando motor de transcrição…', onProgress)
      this.writeState({ depsRevision: DEPS_REVISION })
    }
    if (hasGpu && (needDeps || !state.cuda)) {
      await this.pip(['install', '-r', path.join(this.paths.scriptsDir, 'requirements-cuda.txt')], 'cuda',
        'Instalando bibliotecas CUDA para a GPU (download grande)…', onProgress)
      this.writeState({ cuda: true })
    }

    onProgress({ stage: 'verify', message: 'Verificando instalação…' })
    await this.verify()
  }

  private async installPython(onProgress: (p: SetupProgress) => void) {
    const zip = path.join(this.paths.runtimeDir, 'python-embed.zip')
    fs.rmSync(this.pythonDir, { recursive: true, force: true })
    fs.mkdirSync(this.pythonDir, { recursive: true })

    onProgress({ stage: 'python', message: `Baixando Python ${PYTHON_VERSION}…`, percent: 0 })
    await downloadFile(PYTHON_URL, zip, (d, t) =>
      onProgress({ stage: 'python', message: `Baixando Python ${PYTHON_VERSION}…`, percent: t ? (d / t) * 100 : undefined }))
    // bsdtar do Windows 10+ extrai .zip (caminho absoluto: um GNU tar no PATH não entende 'C:')
    const bsdtar = path.join(process.env.SystemRoot ?? 'C:\\Windows', 'System32', 'tar.exe')
    await run(bsdtar, ['-xf', zip, '-C', this.pythonDir])
    fs.rmSync(zip, { force: true })

    // O Python embarcado ignora site-packages até habilitar "import site" no ._pth
    const pth = fs.readdirSync(this.pythonDir).find(f => /^python\d+\._pth$/.test(f))
    if (!pth) throw new Error('Python embarcado inválido (arquivo ._pth não encontrado)')
    const pthFile = path.join(this.pythonDir, pth)
    fs.writeFileSync(pthFile, fs.readFileSync(pthFile, 'utf-8').replace(/^#\s*import site/m, 'import site'))

    onProgress({ stage: 'pip', message: 'Instalando o pip…' })
    const getPip = path.join(this.paths.runtimeDir, 'get-pip.py')
    await downloadFile(GET_PIP_URL, getPip)
    await run(this.pythonExe, [getPip, '--no-warn-script-location'], this.pythonDir)
    fs.rmSync(getPip, { force: true })
    this.writeState({ pythonVersion: PYTHON_VERSION, depsRevision: undefined, cuda: false })
  }

  /** Executa o pip repassando o progresso: etapa a etapa, com % aproximado pelos pacotes já baixados. */
  private pip(args: string[], stage: SetupStage, message: string, onProgress: (p: SetupProgress) => void) {
    return new Promise<void>((resolve, reject) => {
      const child = spawn(this.pythonExe, ['-m', 'pip', ...args, '--no-warn-script-location', '--progress-bar', 'off'], {
        cwd: this.pythonDir, windowsHide: true,
      })
      let tail = ''
      const onLine = (line: string) => {
        tail = (tail + '\n' + line).slice(-3000)
        const m = line.match(/^(Collecting|Downloading|Installing collected packages|Successfully installed)\s*(\S+)?/)
        if (m) onProgress({ stage, message: `${message} ${line.slice(0, 80)}` })
      }
      readline.createInterface({ input: child.stdout }).on('line', onLine)
      readline.createInterface({ input: child.stderr }).on('line', l => { tail = (tail + '\n' + l).slice(-3000) })
      child.on('error', reject)
      child.on('close', code => code === 0 ? resolve()
        : reject(new Error(`pip falhou (código ${code}): ${tail.trim().split('\n').slice(-3).join(' | ')}`)))
    })
  }

  /** Smoke test: importa o motor e informa se a GPU está utilizável. */
  async verify(): Promise<{ cuda: boolean }> {
    const code = 'import sys; sys.path.insert(0, sys.argv[1]); import vlk_whisper, ctranslate2, faster_whisper; print(ctranslate2.get_cuda_device_count())'
    const out = await run(this.pythonExe, ['-c', code, this.paths.scriptsDir], this.paths.scriptsDir)
    return { cuda: Number(out.trim().split('\n').pop()) > 0 }
  }
}

function run(cmd: string, args: string[], cwd?: string): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile(cmd, args, { cwd, windowsHide: true, maxBuffer: 10 * 1024 * 1024 }, (err, stdout, stderr) => {
      if (err) reject(new Error(`${path.basename(cmd)} falhou: ${(stderr || err.message).trim().split('\n').slice(-3).join(' | ')}`))
      else resolve(stdout)
    })
  })
}
