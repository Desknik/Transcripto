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

export interface TranscriptionRequest {
  filePath: string;
  provider: string;
  model: string;
  language?: string;
}

export interface TranscriptionResponse {
  success: boolean;
  text?: string;
  error?: string;
  language?: string;
  duration?: number;
}
