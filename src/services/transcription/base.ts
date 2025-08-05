import { TranscriptionRequest, TranscriptionResponse, TranscriptionProvider } from '../../types/transcription';

export abstract class BaseTranscriptionService {
  abstract getProvider(): TranscriptionProvider;
  abstract transcribe(request: TranscriptionRequest): Promise<TranscriptionResponse>;
  
  // Optional method to test API connection
  async testConnection?(): Promise<{ success: boolean; error?: string }>;

  protected validateRequest(request: TranscriptionRequest): void {
    if (!request.filePath) {
      throw new Error('File path is required');
    }
    if (!request.provider) {
      throw new Error('Provider is required');
    }
    if (!request.model) {
      throw new Error('Model is required');
    }
  }
}
