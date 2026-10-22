import { BaseTranscriptionService } from './base';
import { OpenAITranscriptionService } from './openai';
import { LocalWhisperTranscriptionService, LocalWhisperConfig } from './localWhisper';
import { TranscriptionProvider, TranscriptionRequest, TranscriptionResponse, LOCAL_WHISPER_PROVIDER_ID } from '../../types/transcription';

export interface ManagerDeps {
  /** Config do motor local; o provedor local só existe com o motor instalado e o modelo escolhido baixado */
  localConfig: LocalWhisperConfig;
  isLocalReady: () => Promise<boolean>;
  getOpenAIKey: () => string | null;
  /** Idioma configurado, para requisições que não trazem o seu ('auto' → undefined) */
  getLanguage: () => string | undefined;
}

export class TranscriptionServiceManager {
  private readonly localWhisper: LocalWhisperTranscriptionService;
  private openai: { key: string; service: OpenAITranscriptionService } | null = null;

  constructor(private readonly deps: ManagerDeps) {
    this.localWhisper = new LocalWhisperTranscriptionService(deps.localConfig);
  }

  getLocalWhisper(): LocalWhisperTranscriptionService {
    return this.localWhisper;
  }

  /** Recriado só quando a chave muda; configurações podem mudar a qualquer momento. */
  private getOpenAI(): OpenAITranscriptionService | null {
    const key = this.deps.getOpenAIKey();
    if (!key) { this.openai = null; return null; }
    if (this.openai?.key !== key) this.openai = { key, service: new OpenAITranscriptionService(key) };
    return this.openai.service;
  }

  private async getServices(): Promise<Map<string, BaseTranscriptionService>> {
    const services = new Map<string, BaseTranscriptionService>();
    if (await this.deps.isLocalReady()) services.set(LOCAL_WHISPER_PROVIDER_ID, this.localWhisper);
    const openai = this.getOpenAI();
    if (openai) services.set('openai', openai);
    return services;
  }

  async getAvailableProviders(): Promise<TranscriptionProvider[]> {
    return Array.from((await this.getServices()).values()).map(service => service.getProvider());
  }

  async transcribe(request: TranscriptionRequest): Promise<TranscriptionResponse> {
    const service = (await this.getServices()).get(request.provider);

    if (!service) {
      return {
        success: false,
        error: `Provedor de transcrição '${request.provider}' não encontrado ou não configurado`,
      };
    }

    return service.transcribe({ ...request, language: request.language ?? this.deps.getLanguage() });
  }
}
