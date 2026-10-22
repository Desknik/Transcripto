import { safeStorage } from 'electron'
import Store from 'electron-store'
import { AppSettings, DEFAULT_SETTINGS } from '../src/types/settings'

interface SettingsFile extends AppSettings {
  /** Chave OpenAI criptografada com safeStorage (base64) */
  openaiKeyEnc: string | null
}

const store = new Store<SettingsFile>({
  name: 'transcripto-settings',
  defaults: { ...DEFAULT_SETTINGS, openaiKeyEnc: null },
})

export function getSettings(): AppSettings {
  return {
    language: store.get('language'),
    whisperModel: store.get('whisperModel'),
    device: store.get('device'),
    idleMinutes: store.get('idleMinutes'),
    fallbackToOpenAI: store.get('fallbackToOpenAI'),
  }
}

export function updateSettings(patch: Partial<AppSettings>): AppSettings {
  for (const [k, v] of Object.entries(patch)) {
    if (k in DEFAULT_SETTINGS && v !== undefined) store.set(k as keyof AppSettings, v as never)
  }
  return getSettings()
}

/** Idioma para os provedores: 'auto' vira undefined (detecção automática) */
export function languageOrUndefined(settings = getSettings()): string | undefined {
  return settings.language === 'auto' ? undefined : settings.language
}

// ---------------------------------------------------------------- chave OpenAI (nunca vai para o renderer)

export function setOpenAIKey(key: string | null): void {
  const trimmed = key?.trim()
  if (!trimmed) { store.set('openaiKeyEnc', null); return }
  if (!safeStorage.isEncryptionAvailable()) throw new Error('Armazenamento seguro indisponível neste sistema')
  store.set('openaiKeyEnc', safeStorage.encryptString(trimmed).toString('base64'))
}

export function getOpenAIKey(): string | null {
  const enc = store.get('openaiKeyEnc')
  if (!enc) return null
  try { return safeStorage.decryptString(Buffer.from(enc, 'base64')) } catch { return null }
}

export function hasOpenAIKey(): boolean {
  return !!getOpenAIKey()
}
