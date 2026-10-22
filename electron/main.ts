import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'node:fs'
import os from 'node:os'
import ffmpeg from 'fluent-ffmpeg'
import OpenAI from 'openai'
import Store from 'electron-store'
import { TranscriptionServiceManager } from '../src/services/transcription'
import { RuntimeManager } from './runtime/runtimeManager'
import { ModelManager } from './runtime/modelManager'
import { getDataDirs, getScriptsDir, getFfmpegPath } from './paths'
import { getSettings, updateSettings, languageOrUndefined, setOpenAIKey, getOpenAIKey, hasOpenAIKey } from './settings'
import { AppSettings, EngineStatus } from '../src/types/settings'

// Initialize electron-store
const store = new Store({
  name: 'transcripto-data',
  defaults: {
    groups: [],
    selectedFileId: null,
    selectedGroupId: null,
    expandedGroups: []
  }
})

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Configure FFmpeg path
const ffmpegPath = getFfmpegPath()
if (ffmpegPath) {
  ffmpeg.setFfmpegPath(ffmpegPath)
}

// Local engine (embedded Python + faster-whisper), installed on first run into userData
const dataDirs = getDataDirs()
const scriptsDir = getScriptsDir()
const runtime = new RuntimeManager({ ...dataDirs, scriptsDir })
const models = new ModelManager(runtime, dataDirs.modelsDir, scriptsDir)

const transcriptionManager = new TranscriptionServiceManager({
  localConfig: {
    python: runtime.pythonExe,
    scriptsDir,
    modelsDir: dataDirs.modelsDir,
    ffmpegPath: ffmpegPath ?? 'ffmpeg',
    getSettings,
  },
  isLocalReady: async () => runtime.isInstalled() && models.isInstalled(getSettings().whisperModel),
  getOpenAIKey,
  getLanguage: () => languageOrUndefined(),
})

// Audio conversion service
async function convertToMp3(inputPath: string, outputDir: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const outputFileName = `${path.parse(inputPath).name}_converted.mp3`
    const outputPath = path.join(outputDir, outputFileName)

    ffmpeg(inputPath)
      .toFormat('mp3')
      .audioBitrate(93) // 93k bitrate as requested
      .on('end', () => {
        console.log('Conversion finished successfully')
        resolve(outputPath)
      })      .on('error', (err) => {
        console.error('Error during conversion:', err)
        reject(err)
      })
      .save(outputPath)
  })
}

// Split audio into fixed-duration MP3 chunks using ffmpeg segment muxer.
// Returns sorted list of chunk file paths. Single-element array means no splitting occurred.
// MP3 inputs use stream copy (-c copy) to avoid unnecessary re-encoding.
// Video and other audio formats strip the video stream and encode audio to MP3.
async function splitAudioIntoChunks(
  inputPath: string,
  chunkDurationSeconds: number,
  outputDir: string
): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const prefix = `split_${Date.now()}`
    const pattern = path.join(outputDir, `${prefix}_%03d.mp3`)
    const isMp3 = path.extname(inputPath).toLowerCase() === '.mp3'

    const outputOptions = isMp3
      ? [
          '-c copy',
          '-f segment',
          `-segment_time ${chunkDurationSeconds}`,
        ]
      : [
          '-vn',
          '-c:a libmp3lame',
          '-b:a 93k',
          '-f segment',
          `-segment_time ${chunkDurationSeconds}`,
          '-reset_timestamps 1',
        ]

    ffmpeg(inputPath)
      .outputOptions(outputOptions)
      .output(pattern)
      .on('end', () => {
        const chunks = fs.readdirSync(outputDir)
          .filter(f => f.startsWith(`${prefix}_`) && f.endsWith('.mp3'))
          .sort()
          .map(f => path.join(outputDir, f))
        console.log(`Split into ${chunks.length} chunk(s)`)
        resolve(chunks)
      })
      .on('error', (err) => {
        console.error('Error splitting audio:', err)
        reject(err)
      })
      .run()
  })
}

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  })

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// IPC handlers for file conversion
ipcMain.handle('convert-audio', async (_, filePath: string) => {
  try {
    const tempDir = os.tmpdir()
    let inputPath = filePath

    // Always copy to temp directory to avoid processing files in the project directory
    if (path.isAbsolute(filePath)) {
      const fileName = path.basename(filePath)
      const tempFilePath = path.join(tempDir, `${Date.now()}_${fileName}`)
      await fs.promises.copyFile(filePath, tempFilePath)
      inputPath = tempFilePath
    } else {
      // If path is relative, try to resolve it
      const resolvedPath = path.resolve(filePath)
      const fileName = path.basename(resolvedPath)
      const tempFilePath = path.join(tempDir, `${Date.now()}_${fileName}`)
      await fs.promises.copyFile(resolvedPath, tempFilePath)
      inputPath = tempFilePath
    }

    const outputPath = await convertToMp3(inputPath, tempDir)
    return { success: true, outputPath }
  } catch (error) {
    console.error('Conversion error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
})

ipcMain.handle('save-file-dialog', async (_, options?: { filters?: { name: string; extensions: string[] }[]; defaultPath?: string }) => {
  const result = await dialog.showSaveDialog(win!, {
    filters: options?.filters || [{ name: 'All Files', extensions: ['*'] }],
    defaultPath: options?.defaultPath || 'transcription.txt'
  })
  return result
})

ipcMain.handle('save-file-to-disk', async (_, fileBuffer: Buffer, fileName: string) => {
  try {
    // Always save to temp directory to avoid creating files in project directory
    const tempDir = os.tmpdir()
    const tempFilePath = path.join(tempDir, `${Date.now()}_${fileName}`)
    await fs.promises.writeFile(tempFilePath, fileBuffer)
    return { success: true, filePath: tempFilePath }
  } catch (error) {
    console.error('Error saving file to disk:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
})

ipcMain.handle('copy-file', async (_, sourcePath: string, targetPath: string) => {
  try {
    await fs.promises.copyFile(sourcePath, targetPath)
    return { success: true }
  } catch (error) {
    console.error('Error copying file:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
})

ipcMain.handle('split-audio', async (_, filePath: string, chunkDurationSeconds: number) => {
  try {
    const tempDir = os.tmpdir()
    const chunks = await splitAudioIntoChunks(filePath, chunkDurationSeconds, tempDir)
    return { success: true, chunks }
  } catch (error) {
    console.error('Split audio error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      chunks: [] as string[]
    }
  }
})

// Transcription handlers
ipcMain.handle('get-transcription-providers', async () => {
  try {
    const providers = await transcriptionManager.getAvailableProviders()
    return { success: true, providers }
  } catch (error) {
    console.error('Error getting transcription providers:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
})

ipcMain.handle('transcribe-audio', async (_, request: any) => {
  try {
    const result = await transcriptionManager.transcribe(request)
    return result
  } catch (error) {
    console.error('Error transcribing audio:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
})

// Local Whisper server controls (status / start / stop)
ipcMain.handle('local-whisper-status', async () => {
  const ready = runtime.isInstalled() && models.isInstalled(getSettings().whisperModel)
  if (!ready) return { success: true, available: false, running: false, startedByApp: false }
  return { success: true, available: true, ...(await transcriptionManager.getLocalWhisper().getServerStatus()) }
})

ipcMain.handle('local-whisper-start', async () => {
  try {
    await transcriptionManager.getLocalWhisper().startServer()
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
})

ipcMain.handle('local-whisper-stop', async () => {
  await transcriptionManager.getLocalWhisper().stopServer()
  return { success: true }
})

// Stop the local server on quit, but only if this app started it
let quitting = false
app.on('before-quit', (event) => {
  if (quitting) return
  event.preventDefault()
  quitting = true
  transcriptionManager.getLocalWhisper().dispose().finally(() => app.quit())
})

// ---------------------------------------------------------------- settings / engine / models

const errorMessage = (e: unknown) => (e instanceof Error ? e.message : 'Unknown error')

ipcMain.handle('settings-get', () => ({ success: true, settings: getSettings(), hasOpenAIKey: hasOpenAIKey() }))

ipcMain.handle('settings-update', async (_, patch: Partial<AppSettings>) => {
  try {
    const before = getSettings()
    const settings = updateSettings(patch)
    // Servidor em execução com configuração antiga: para, e o próximo uso o reinicia com a nova
    if (before.device !== settings.device || before.idleMinutes !== settings.idleMinutes) {
      await transcriptionManager.getLocalWhisper().stopServer()
    }
    return { success: true, settings }
  } catch (e) {
    return { success: false, error: errorMessage(e) }
  }
})

ipcMain.handle('openai-key-set', (_, key: string | null) => {
  try {
    setOpenAIKey(key)
    if (!hasOpenAIKey()) updateSettings({ fallbackToOpenAI: false })
    return { success: true, hasOpenAIKey: hasOpenAIKey() }
  } catch (e) {
    return { success: false, error: errorMessage(e) }
  }
})

// Testa uma chave digitada (ainda não salva) ou, sem argumento, a chave salva
ipcMain.handle('openai-key-test', async (_, key?: string) => {
  const apiKey = key?.trim() || getOpenAIKey()
  if (!apiKey) return { success: false, error: 'Nenhuma chave informada' }
  try {
    await new OpenAI({ apiKey }).models.list()
    return { success: true }
  } catch (e) {
    return { success: false, error: errorMessage(e) }
  }
})

ipcMain.handle('engine-status', async () => {
  try {
    const installedModels = runtime.isInstalled() ? await models.list() : []
    const modelOk = installedModels.some(m => m.id === getSettings().whisperModel)
    const status = await runtime.getStatus(modelOk)
    return { success: true, status: { ...status, installedModels } satisfies EngineStatus }
  } catch (e) {
    return { success: false, error: errorMessage(e) }
  }
})

// Primeiro uso: instala Python + dependências e baixa o modelo escolhido; progresso em 'engine-setup-progress'
let settingUp = false
ipcMain.handle('engine-setup', async () => {
  if (settingUp) return { success: false, error: 'A instalação já está em andamento' }
  settingUp = true
  const emit = (p: { stage: string; message: string; percent?: number }) => win?.webContents.send('engine-setup-progress', p)
  try {
    await runtime.setup(emit)
    const model = getSettings().whisperModel
    if (!models.isInstalled(model)) {
      const message = `Baixando modelo ${model}…`
      emit({ stage: 'model', message, percent: 0 })
      await models.download(model, (done, total) => emit({ stage: 'model', message, percent: total ? (done / total) * 100 : undefined }))
    }
    return { success: true }
  } catch (e) {
    return { success: false, error: errorMessage(e) }
  } finally {
    settingUp = false
  }
})

ipcMain.handle('model-download', async (_, id: string) => {
  try {
    await models.download(id, (done, total) => win?.webContents.send('model-download-progress', { id, done, total }))
    return { success: true }
  } catch (e) {
    return { success: false, error: errorMessage(e) }
  }
})

ipcMain.handle('model-remove', async (_, id: string) => {
  try {
    if (getSettings().whisperModel === id) throw new Error('Este é o modelo em uso; escolha outro antes de removê-lo')
    await models.remove(id)
    return { success: true }
  } catch (e) {
    return { success: false, error: errorMessage(e) }
  }
})

// Store handlers
ipcMain.handle('store-get', async (_, key: string) => {
  try {
    return { success: true, data: store.get(key) }
  } catch (error) {
    console.error('Error getting store data:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
})

ipcMain.handle('store-set', async (_, key: string, value: any) => {
  try {
    store.set(key, value)
    return { success: true }
  } catch (error) {
    console.error('Error setting store data:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
})

ipcMain.handle('store-delete', async (_, key: string) => {
  try {
    store.delete(key)
    return { success: true }
  } catch (error) {
    console.error('Error deleting store data:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
})

ipcMain.handle('store-clear', async () => {
  try {
    store.clear()
    return { success: true }
  } catch (error) {
    console.error('Error clearing store:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
})

app.whenReady().then(createWindow)
