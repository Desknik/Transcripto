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
  saveFileDialog: (options?: { filters?: { name: string; extensions: string[] }[]; defaultPath?: string }) => ipcRenderer.invoke('save-file-dialog', options),
  saveFileToDisk: (fileBuffer: ArrayBuffer, fileName: string) => 
    ipcRenderer.invoke('save-file-to-disk', Buffer.from(fileBuffer), fileName),
  copyFile: (sourcePath: string, targetPath: string) => 
    ipcRenderer.invoke('copy-file', sourcePath, targetPath),
  
  // Audio splitting
  splitAudio: (filePath: string, chunkDurationSeconds: number) =>
    ipcRenderer.invoke('split-audio', filePath, chunkDurationSeconds),

  // Transcription APIs
  getTranscriptionProviders: () => ipcRenderer.invoke('get-transcription-providers'),
  transcribeAudio: (request: any) => ipcRenderer.invoke('transcribe-audio', request),
  
  // Local Whisper server
  getLocalWhisperStatus: () => ipcRenderer.invoke('local-whisper-status'),
  startLocalWhisper: () => ipcRenderer.invoke('local-whisper-start'),
  stopLocalWhisper: () => ipcRenderer.invoke('local-whisper-stop'),

  // Settings, local engine and models
  getSettings: () => ipcRenderer.invoke('settings-get'),
  updateSettings: (patch: unknown) => ipcRenderer.invoke('settings-update', patch),
  setOpenAIKey: (key: string | null) => ipcRenderer.invoke('openai-key-set', key),
  testOpenAIKey: (key?: string) => ipcRenderer.invoke('openai-key-test', key),
  getEngineStatus: () => ipcRenderer.invoke('engine-status'),
  setupEngine: () => ipcRenderer.invoke('engine-setup'),
  downloadModel: (id: string) => ipcRenderer.invoke('model-download', id),
  removeModel: (id: string) => ipcRenderer.invoke('model-remove', id),
  onEngineSetupProgress: (cb: (p: unknown) => void) => {
    const listener = (_: unknown, p: unknown) => cb(p)
    ipcRenderer.on('engine-setup-progress', listener)
    return () => ipcRenderer.off('engine-setup-progress', listener)
  },
  onModelDownloadProgress: (cb: (p: unknown) => void) => {
    const listener = (_: unknown, p: unknown) => cb(p)
    ipcRenderer.on('model-download-progress', listener)
    return () => ipcRenderer.off('model-download-progress', listener)
  },

  // Store APIs
  storeGet: (key: string) => ipcRenderer.invoke('store-get', key),
  storeSet: (key: string, value: any) => ipcRenderer.invoke('store-set', key, value),
  storeDelete: (key: string) => ipcRenderer.invoke('store-delete', key),
  storeClear: () => ipcRenderer.invoke('store-clear'),
})
