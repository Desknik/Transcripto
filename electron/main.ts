import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'node:fs'
import os from 'node:os'
import ffmpeg from 'fluent-ffmpeg'
import ffmpegStatic from 'ffmpeg-static'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Configure FFmpeg path
if (ffmpegStatic) {
  ffmpeg.setFfmpegPath(ffmpegStatic)
}

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
      })
      .on('error', (err) => {
        console.error('Error during conversion:', err)
        reject(err)
      })      .on('progress', (progress) => {
        const percent = progress.percent ? Math.round(progress.percent) : 0;
        console.log(`Processing: ${percent}% done`);
      })
      .save(outputPath)
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
    const outputPath = await convertToMp3(filePath, tempDir)
    return { success: true, outputPath }
  } catch (error) {
    console.error('Conversion error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
})

ipcMain.handle('save-file-dialog', async () => {
  const result = await dialog.showSaveDialog(win!, {
    filters: [{ name: 'MP3 Files', extensions: ['mp3'] }],
    defaultPath: 'converted_audio.mp3'
  })
  return result
})

ipcMain.handle('save-file-to-disk', async (_, fileBuffer: Buffer, fileName: string) => {
  try {
    const tempDir = os.tmpdir()
    const tempFilePath = path.join(tempDir, fileName)
    
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

app.whenReady().then(createWindow)
