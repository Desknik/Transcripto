/// <reference types="vite-plugin-electron/electron-env" />

declare namespace NodeJS {
  interface ProcessEnv {
    /**
     * The built directory structure
     *
     * ```tree
     * ├─┬─┬ dist
     * │ │ └── index.html
     * │ │
     * │ ├─┬ dist-electron
     * │ │ ├── main.js
     * │ │ └── preload.js
     * │
     * ```
     */
    APP_ROOT: string
    /** /dist/ or /public/ */
    VITE_PUBLIC: string
  }
}

// Used in Renderer process, expose in `preload.ts`
interface Window {
  ipcRenderer: import('electron').IpcRenderer
  electronAPI: {
    convertAudio: (filePath: string) => Promise<any>;
    saveFileDialog: (options?: { filters?: { name: string; extensions: string[] }[]; defaultPath?: string }) => Promise<{ canceled: boolean; filePath?: string }>;
    saveFileToDisk: (fileBuffer: ArrayBuffer, fileName: string) => Promise<{ success: boolean; filePath?: string; error?: string }>;
    copyFile: (sourcePath: string, targetPath: string) => Promise<any>;
    getTranscriptionProviders: () => Promise<any>;
    transcribeAudio: (request: any) => Promise<any>;
    storeGet: (key: string) => Promise<any>;
    storeSet: (key: string, value: any) => Promise<any>;
    storeDelete: (key: string) => Promise<any>;
    storeClear: () => Promise<any>;
  }
}
