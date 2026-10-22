export type DeviceChoice = 'auto' | 'cuda' | 'cpu';

export interface AppSettings {
  /** Código ISO do idioma da transcrição, ou 'auto' para detectar */
  language: string;
  whisperModel: string;
  device: DeviceChoice;
  /** Minutos de ociosidade até o servidor local se encerrar (0 = nunca) */
  idleMinutes: number;
  /** Se o motor local falhar, repete a transcrição na OpenAI (exige chave) */
  fallbackToOpenAI: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  language: 'pt',
  whisperModel: 'large-v3-turbo',
  device: 'auto',
  idleMinutes: 0,
  fallbackToOpenAI: false,
};

export interface WhisperModelInfo {
  id: string;
  name: string;
  sizeMB: number;
  description: string;
}

/** Modelos compatíveis com o faster-whisper, do mais leve ao mais preciso */
export const WHISPER_MODELS: WhisperModelInfo[] = [
  { id: 'tiny', name: 'Tiny', sizeMB: 75, description: 'Muito rápido, qualidade básica' },
  { id: 'base', name: 'Base', sizeMB: 145, description: 'Rápido, qualidade razoável' },
  { id: 'small', name: 'Small', sizeMB: 484, description: 'Bom equilíbrio para CPU' },
  { id: 'medium', name: 'Medium', sizeMB: 1530, description: 'Boa qualidade, exige mais memória' },
  { id: 'large-v3-turbo', name: 'Large v3 Turbo (padrão)', sizeMB: 1620, description: 'Quase a qualidade do Large, bem mais rápido' },
  { id: 'large-v3', name: 'Large v3', sizeMB: 3090, description: 'Máxima precisão, mais lento' },
];

export const AUTO_LANGUAGE = 'auto';

/** Idiomas suportados pelo Whisper (subconjunto mais usado; o mesmo código vale para a OpenAI) */
export const LANGUAGES: { code: string; name: string }[] = [
  { code: 'auto', name: 'Detectar automaticamente' },
  { code: 'pt', name: 'Português' },
  { code: 'en', name: 'Inglês' },
  { code: 'es', name: 'Espanhol' },
  { code: 'fr', name: 'Francês' },
  { code: 'de', name: 'Alemão' },
  { code: 'it', name: 'Italiano' },
  { code: 'nl', name: 'Holandês' },
  { code: 'pl', name: 'Polonês' },
  { code: 'ru', name: 'Russo' },
  { code: 'uk', name: 'Ucraniano' },
  { code: 'tr', name: 'Turco' },
  { code: 'ar', name: 'Árabe' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ja', name: 'Japonês' },
  { code: 'ko', name: 'Coreano' },
  { code: 'zh', name: 'Chinês' },
  { code: 'sv', name: 'Sueco' },
  { code: 'da', name: 'Dinamarquês' },
  { code: 'no', name: 'Norueguês' },
  { code: 'fi', name: 'Finlandês' },
  { code: 'el', name: 'Grego' },
  { code: 'he', name: 'Hebraico' },
  { code: 'id', name: 'Indonésio' },
  { code: 'vi', name: 'Vietnamita' },
];

export interface InstalledModel {
  id: string;
  bytes: number;
}

/** Estado do motor local para a UI */
export interface EngineStatus {
  ready: boolean;
  hasGpu: boolean;
  cudaInstalled: boolean;
  /** Etapas pendentes: 'python' | 'deps' | 'model' */
  missing: string[];
  installedModels: InstalledModel[];
}

export interface SetupEvent {
  stage: string;
  message: string;
  percent?: number;
}
