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
  /** Texto com o tempo (início -> fim) de cada trecho de fala; padrão: só o texto */
  includeTimestamps: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  language: 'pt',
  whisperModel: 'large-v3-turbo',
  device: 'auto',
  idleMinutes: 0,
  fallbackToOpenAI: false,
  includeTimestamps: false,
};

export interface WhisperModelInfo {
  id: string;
  name: string;
  sizeMB: number;
  description: string;
  /** 1–5 */
  quality: number;
  /** 1–5 (maior = mais rápido) */
  speed: number;
}

/** Modelos compatíveis com o faster-whisper, do mais leve ao mais preciso */
export const WHISPER_MODELS: WhisperModelInfo[] = [
  { id: 'tiny', name: 'Tiny', sizeMB: 75, description: 'Muito rápido, qualidade básica', quality: 1, speed: 5 },
  { id: 'base', name: 'Base', sizeMB: 145, description: 'Rápido, qualidade razoável', quality: 2, speed: 5 },
  { id: 'small', name: 'Small', sizeMB: 484, description: 'Bom equilíbrio para CPU', quality: 3, speed: 4 },
  { id: 'medium', name: 'Medium', sizeMB: 1530, description: 'Boa qualidade, exige mais memória', quality: 4, speed: 2 },
  { id: 'large-v3-turbo', name: 'Large v3 Turbo', sizeMB: 1620, description: 'Quase a qualidade do Large, bem mais rápido (ideal com GPU)', quality: 5, speed: 3 },
  { id: 'large-v3', name: 'Large v3', sizeMB: 3090, description: 'Máxima precisão, mais lento', quality: 5, speed: 1 },
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

export interface HardwareInfo {
  hasGpu: boolean;
  gpuName?: string;
  vramMB?: number;
  ramMB: number;
  cpuCores: number;
}

/**
 * Modelo sugerido para a máquina.
 * GPU: o turbo precisa de ~3 GB de VRAM. CPU: modelos grandes ficam lentos demais, então o teto é o small.
 */
export function recommendModel(hw: HardwareInfo): string {
  if (hw.hasGpu) {
    const vram = hw.vramMB ?? 0;
    if (vram >= 4000) return 'large-v3-turbo';
    if (vram >= 2000) return 'small';
    return 'base';
  }
  if (hw.ramMB >= 8000 && hw.cpuCores >= 6) return 'small';
  if (hw.ramMB >= 4000) return 'base';
  return 'tiny';
}

export function recommendationReason(hw: HardwareInfo): string {
  if (hw.hasGpu) {
    const gpu = `${hw.gpuName ?? 'GPU NVIDIA'}${hw.vramMB ? ` (${(hw.vramMB / 1024).toFixed(0)} GB)` : ''}`;
    return `GPU detectada: ${gpu}.`;
  }
  return `Sem GPU NVIDIA: usando CPU (${hw.cpuCores} núcleos, ${(hw.ramMB / 1024).toFixed(0)} GB de RAM).`;
}

const stars = (n: number) => '★'.repeat(n) + '☆'.repeat(5 - n);

/** Texto de uma linha para listas/selects: tamanho, qualidade e velocidade */
export function describeModel(m: WhisperModelInfo, recommended: boolean): string {
  const size = m.sizeMB >= 1024 ? `${(m.sizeMB / 1024).toFixed(1)} GB` : `${m.sizeMB} MB`;
  return `${m.name} · ${size} · qualidade ${stars(m.quality)} · velocidade ${stars(m.speed)}${recommended ? ' · recomendado' : ''}`;
}

export interface InstalledModel {
  id: string;
  bytes: number;
}

/** Estado do motor local para a UI */
export interface EngineStatus {
  ready: boolean;
  hardware: HardwareInfo;
  recommendedModel: string;
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
