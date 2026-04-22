export interface TranscriptionProvider {
  id: string;
  name: string;
  models: TranscriptionModel[];
}

export interface TranscriptionModel {
  id: string;
  name: string;
  description?: string;
}

export type OutputFormat = 'json' | 'text' | 'srt' | 'verbose_json' | 'vtt';

export interface TranscriptionEntry {
  id: string;
  format: OutputFormat;
  content: string;
  createdAt: Date;
  language?: string;
  duration?: number;
}

export interface TranscriptionRequest {
  filePath: string;
  provider: string;
  model: string;
  language?: string;
  outputFormat?: OutputFormat;
}

export interface TranscriptionResponse {
  success: boolean;
  text?: string;
  error?: string;
  language?: string;
  duration?: number;
}

export const FORMAT_LABELS: Record<OutputFormat, string> = {
  text: 'Texto',
  srt: 'SRT',
  vtt: 'VTT',
  json: 'JSON',
  verbose_json: 'JSON Completo',
};

export const FORMAT_EXTENSIONS: Record<OutputFormat, string> = {
  text: 'txt',
  srt: 'srt',
  vtt: 'vtt',
  json: 'json',
  verbose_json: 'json',
};