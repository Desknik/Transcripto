import OpenAI from 'openai';
import fs from 'fs';
import { BaseTranscriptionService } from './base';
import { TranscriptionRequest, TranscriptionResponse, TranscriptionProvider } from '../types/transcription';

export class OpenAITranscriptionService extends BaseTranscriptionService {
  private openai: OpenAI;

  constructor(apiKey: string) {
    super();
    this.openai = new OpenAI({ 
      apiKey,
      dangerouslyAllowBrowser: false // This will run in Node.js (Electron main process)
    });
  }

  getProvider(): TranscriptionProvider {
    return {
      id: 'openai',
      name: 'OpenAI',
      models: [
        {
          id: 'whisper-1',
          name: 'Whisper v1',
          description: 'OpenAI Whisper model for general transcription'
        }
      ]
    };
  }

  async transcribe(request: TranscriptionRequest): Promise<TranscriptionResponse> {
    try {
      this.validateRequest(request);

      console.log('Starting OpenAI transcription for:', request.filePath);

      const transcription = await this.openai.audio.transcriptions.create({
        file: fs.createReadStream(request.filePath),
        model: request.model || 'whisper-1',
        response_format: 'verbose_json',
        language: request.language || undefined,
      });

      console.log('OpenAI transcription completed successfully');

      return {
        success: true,
        text: transcription.text,
        language: transcription.language || request.language,
        duration: transcription.duration,
      };
    } catch (error) {
      console.error('OpenAI transcription error:', error);
      
      let errorMessage = 'Erro desconhecido na transcrição';
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}
