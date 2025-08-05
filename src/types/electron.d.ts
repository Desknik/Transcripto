// Types for Electron IPC API
export interface ElectronAPI {
  convertAudio: (filePath: string) => Promise<{
    success: boolean;
    outputPath?: string;
    error?: string;
  }>;
  saveFileDialog: () => Promise<{
    canceled: boolean;
    filePath?: string;
  }>;
  saveFileToDisk: (fileBuffer: ArrayBuffer, fileName: string) => Promise<{
    success: boolean;
    filePath?: string;
    error?: string;
  }>;
  copyFile: (sourcePath: string, targetPath: string) => Promise<{
    success: boolean;
    error?: string;
  }>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
    ipcRenderer: {
      on: (channel: string, func: (...args: any[]) => void) => void;
      off: (channel: string, func: (...args: any[]) => void) => void;
      send: (channel: string, ...args: any[]) => void;
      invoke: (channel: string, ...args: any[]) => Promise<any>;
    };
  }
}
