import { ipcRenderer, contextBridge } from 'electron'

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('ipcRenderer', {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args
    return ipcRenderer.off(channel, ...omit)
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args
    return ipcRenderer.send(channel, ...omit)
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args
    return ipcRenderer.invoke(channel, ...omit)
  },
})

// Expose audio conversion APIs
contextBridge.exposeInMainWorld('electronAPI', {
  convertAudio: (filePath: string) => ipcRenderer.invoke('convert-audio', filePath),
  saveFileDialog: () => ipcRenderer.invoke('save-file-dialog'),
  saveFileToDisk: (fileBuffer: ArrayBuffer, fileName: string) => 
    ipcRenderer.invoke('save-file-to-disk', Buffer.from(fileBuffer), fileName),
  copyFile: (sourcePath: string, targetPath: string) => 
    ipcRenderer.invoke('copy-file', sourcePath, targetPath),
  
  // Transcription APIs
  getTranscriptionProviders: () => ipcRenderer.invoke('get-transcription-providers'),
  transcribeAudio: (request: any) => ipcRenderer.invoke('transcribe-audio', request),
})
