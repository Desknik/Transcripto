import { TranscriptionEntry, OutputFormat } from './transcription';

export interface TranscriptionFile {
  id: string;
  name: string;
  size: number;
  type: string;
  transcriptions: TranscriptionEntry[];
  activeFormat: OutputFormat;
  language?: string;
  duration?: string;
  uploadedAt: Date;
  originalPath?: string;
  convertedPath?: string;
  audioPath?: string;
  isConverted?: boolean;
  transcriptionProvider?: string;
  transcriptionModel?: string;
}

export interface TranscriptionGroup {
  id: string;
  name: string;
  files: TranscriptionFile[];
  createdAt: Date;
}

export interface TranscriptionGroup {
  id: string;
  name: string;
  files: TranscriptionFile[];
  createdAt: Date;
}

export interface UploadProgress {
  fileId: string;
  fileName: string;
  progress: number;
  status: 'uploading' | 'converting' | 'transcribing' | 'completed' | 'error';
  errorMessage?: string;
}

// Re-export transcription types
export * from './transcription';