// Types for Electron IPC API
import { TranscriptionProvider, TranscriptionRequest, TranscriptionResponse } from './transcription';

export interface ElectronAPI {
  convertAudio: (filePath: string) => Promise<{
    success: boolean;
    outputPath?: string;
    error?: string;
  }>;
  saveFileDialog: (options?: { filters?: { name: string; extensions: string[] }[]; defaultPath?: string }) => Promise<{
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
  splitAudio: (filePath: string, chunkDurationSeconds: number) => Promise<{
    success: boolean;
    chunks: string[];
    error?: string;
  }>;
  getTranscriptionProviders: () => Promise<{
    success: boolean;
    providers?: TranscriptionProvider[];
    error?: string;
  }>;
  transcribeAudio: (request: TranscriptionRequest) => Promise<TranscriptionResponse>;

  // Store APIs
  storeGet: (key: string) => Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }>;
  storeSet: (key: string, value: any) => Promise<{
    success: boolean;
    error?: string;
  }>;
  storeDelete: (key: string) => Promise<{
    success: boolean;
    error?: string;
  }>;
  storeClear: () => Promise<{
    success: boolean;
    error?: string;
  }>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
    ipcRenderer: {
      on: (channel: string, func: (...args: unknown[]) => void) => void;
      off: (channel: string, func: (...args: unknown[]) => void) => void;
      send: (channel: string, ...args: unknown[]) => void;
      invoke: (channel: string, ...args: unknown[]) => Promise<unknown>;
    };
  }
}
