import OpenAI from 'openai';
import fs from 'fs';
import { BaseTranscriptionService } from './base';
import { formatTranscript, speechSeconds } from './formatter';
import { TranscriptionRequest, TranscriptionResponse, TranscriptionProvider } from '../../types/transcription';

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

      // Sempre pede verbose_json (traz os trechos com tempo) e formata aqui, como no motor local
      const transcription = await this.openai.audio.transcriptions.create({
        file: fs.createReadStream(request.filePath),
        model: request.model || 'whisper-1',
        response_format: 'verbose_json',
        language: request.language || undefined,
      }) as unknown as { language?: string; duration?: number; text: string; segments?: { start: number; end: number; text: string }[] };

      console.log('OpenAI transcription completed successfully');

      const duration = transcription.duration ?? 0;
      const segments = (transcription.segments ?? [{ start: 0, end: duration, text: transcription.text }])
        .map(seg => ({ start: seg.start, end: seg.end, text: seg.text.trim() }));
      const language = transcription.language || request.language;
      const text = formatTranscript(
        { segments, duration, language },
        request.outputFormat || 'text',
        { includeTimestamps: request.includeTimestamps ?? false },
      );

      return {
        success: true,
        text,
        language,
        duration,
        speechSeconds: speechSeconds(segments, duration),
      };    } catch (error) {
      console.error('OpenAI transcription error:', error);
      
      let errorMessage = 'Erro desconhecido na transcrição';
      
      if (error instanceof Error) {
        // Check for specific OpenAI API errors
        if (error.message.includes('401') || error.message.includes('Invalid API key') || error.message.includes('Unauthorized')) {
          errorMessage = 'API key inválida. Verifique sua chave OpenAI em Configurações';
        } else if (error.message.includes('402') || error.message.includes('quota')) {
          errorMessage = 'Quota excedida. Verifique seu limite de uso da API OpenAI';
        } else if (error.message.includes('429') || error.message.includes('rate limit')) {
          errorMessage = 'Limite de taxa excedido. Tente novamente em alguns minutos';
        } else if (error.message.includes('400') || error.message.includes('Bad Request')) {
          errorMessage = 'Requisição inválida. Verifique o formato do arquivo de áudio';
        } else if (error.message.includes('500') || error.message.includes('502') || error.message.includes('503')) {
          errorMessage = 'Erro interno do servidor OpenAI. Tente novamente mais tarde';
        } else {
          errorMessage = error.message;
        }
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  // Test API key validity
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      // Try to list models to test the API key
      await this.openai.models.list();
      return { success: true };
    } catch (error) {
      console.error('OpenAI API key test failed:', error);
      
      let errorMessage = 'Erro ao conectar com a API OpenAI';
      if (error instanceof Error) {
        if (error.message.includes('401') || error.message.includes('Invalid API key') || error.message.includes('Unauthorized')) {
          errorMessage = 'API key inválida. Verifique sua chave OpenAI em Configurações';
        } else if (error.message.includes('402') || error.message.includes('quota')) {
          errorMessage = 'Quota excedida. Verifique seu limite de uso da API OpenAI';
        } else {
          errorMessage = error.message;
        }
      }
      
      return { success: false, error: errorMessage };
    }
  }
}
