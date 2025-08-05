import { BaseTranscriptionService } from './base';
import { OpenAITranscriptionService } from './openai';
import { TranscriptionProvider, TranscriptionRequest, TranscriptionResponse } from '../../types/transcription';

export class TranscriptionServiceManager {
  private services: Map<string, BaseTranscriptionService> = new Map();

  constructor() {
    // Initialize services with API keys
    this.initializeServices();
  }

  private initializeServices(): void {
    // For now, we'll get API keys from environment variables
    // In the future, this could be from user settings or database
      const openaiKey = process.env.OPENAI_API_KEY;
    if (openaiKey && 
        openaiKey !== 'your_openai_api_key_here' && 
        openaiKey.trim() !== '' && 
        openaiKey.startsWith('sk-')) {
      this.services.set('openai', new OpenAITranscriptionService(openaiKey));
    }

    // Future providers can be added here:
    // const elevenlabsKey = process.env.ELEVENLABS_API_KEY;
    // if (elevenlabsKey) {
    //   this.services.set('elevenlabs', new ElevenLabsTranscriptionService(elevenlabsKey));
    // }
  }

  getAvailableProviders(): TranscriptionProvider[] {
    return Array.from(this.services.values()).map(service => service.getProvider());
  }

  async transcribe(request: TranscriptionRequest): Promise<TranscriptionResponse> {
    const service = this.services.get(request.provider);
    
    if (!service) {
      return {
        success: false,
        error: `Provedor de transcrição '${request.provider}' não encontrado ou não configurado`,
      };
    }

    return service.transcribe(request);
  }

  isProviderAvailable(providerId: string): boolean {
    return this.services.has(providerId);
  }
}
