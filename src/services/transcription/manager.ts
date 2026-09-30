import { BaseTranscriptionService } from './base';
import { OpenAITranscriptionService } from './openai';
import { LocalWhisperTranscriptionService, resolveLocalWhisperConfig } from './localWhisper';
import { TranscriptionProvider, TranscriptionRequest, TranscriptionResponse, LOCAL_WHISPER_PROVIDER_ID } from '../../types/transcription';

export class TranscriptionServiceManager {
  private services: Map<string, BaseTranscriptionService> = new Map();
  private localWhisper: LocalWhisperTranscriptionService | null = null;

  getLocalWhisper(): LocalWhisperTranscriptionService | null {
    return this.localWhisper;
  }

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

    // Local faster-whisper (scripts Python indicados no .env)
    const localConfig = resolveLocalWhisperConfig();
    if (localConfig) {
      this.localWhisper = new LocalWhisperTranscriptionService(localConfig);
      this.services.set(LOCAL_WHISPER_PROVIDER_ID, this.localWhisper);
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
