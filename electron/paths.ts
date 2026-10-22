import { app } from 'electron'
import path from 'node:path'
import ffmpegStatic from 'ffmpeg-static'

/** Dados do usuário (runtime Python e modelos): graváveis, preservados entre atualizações. */
export function getDataDirs() {
  const base = app.getPath('userData')
  return {
    runtimeDir: path.join(base, 'runtime'),
    modelsDir: path.join(base, 'models'),
  }
}

/** Scripts Python: em resources/ quando empacotado (fora do asar); no repo em desenvolvimento. */
export function getScriptsDir(): string {
  return app.isPackaged
    ? path.join(process.resourcesPath, 'python')
    : path.join(process.env.APP_ROOT ?? app.getAppPath(), 'resources', 'python')
}

/** ffmpeg do ffmpeg-static; empacotado, o binário fica em app.asar.unpacked (não executa de dentro do asar). */
export function getFfmpegPath(): string | null {
  if (!ffmpegStatic) return null
  return ffmpegStatic.replace('app.asar', 'app.asar.unpacked')
}
