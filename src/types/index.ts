export interface TranscriptionFile {
  id: string;
  name: string;
  size: number;
  type: string;
  content: string;
  language?: string;
  duration?: string;
  uploadedAt: Date;
  originalPath?: string;
  convertedPath?: string;
  isConverted?: boolean;
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
  status: 'uploading' | 'converting' | 'processing' | 'completed' | 'error';
}