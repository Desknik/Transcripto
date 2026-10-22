import React, { useCallback, useEffect, useState } from 'react';
import { X, Download, Trash2, Check, Loader2, KeyRound, Cpu, Languages, Wrench, Database } from 'lucide-react';
import ConfirmationModal from './ConfirmationModal';
import {
  AppSettings, DEFAULT_SETTINGS, DeviceChoice, EngineStatus, LANGUAGES, SetupEvent, WHISPER_MODELS, recommendationReason,
} from '../types/settings';

interface SettingsModalProps {
  onClose: () => void;
  /** Chamado ao fechar, se algo que afeta provedores/modelos mudou */
  onChanged: () => void;
  /** Apaga todas as transcrições e grupos do histórico */
  onClearTranscriptions: () => Promise<void>;
}

const formatSize = (mb: number) => (mb >= 1024 ? `${(mb / 1024).toFixed(1)} GB` : `${mb} MB`);

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, onChanged, onClearTranscriptions }) => {
  const [confirmClear, setConfirmClear] = useState(false);
  const [cleared, setCleared] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [hasKey, setHasKey] = useState(false);
  const [engine, setEngine] = useState<EngineStatus | null>(null);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [repair, setRepair] = useState<SetupEvent | null>(null);
  const [repairing, setRepairing] = useState(false);
  const [keyInput, setKeyInput] = useState('');
  const [keyMsg, setKeyMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [changed, setChanged] = useState(false);

  const api = window.electronAPI;

  const refreshEngine = useCallback(async () => {
    const r = await api.getEngineStatus();
    if (r.success && r.status) setEngine(r.status);
  }, [api]);

  useEffect(() => {
    api.getSettings().then(r => { if (r.success) { setSettings(r.settings); setHasKey(r.hasOpenAIKey); } });
    refreshEngine();
    const offModel = api.onModelDownloadProgress(p => setProgress(prev => ({ ...prev, [p.id]: p.total ? (p.done / p.total) * 100 : 0 })));
    const offSetup = api.onEngineSetupProgress(setRepair);
    return () => { offModel(); offSetup(); };
  }, [api, refreshEngine]);

  const clearAll = async () => {
    setConfirmClear(false);
    await onClearTranscriptions();
    setCleared(true);
  };

  const close = () => { if (changed) onChanged(); onClose(); };

  const update = async (patch: Partial<AppSettings>) => {
    const r = await api.updateSettings(patch);
    if (r.success && r.settings) { setSettings(r.settings); setChanged(true); setError(null); }
    else setError(r.error ?? 'Não foi possível salvar');
  };

  const downloadModel = async (id: string) => {
    setProgress(p => ({ ...p, [id]: 0 }));
    const r = await api.downloadModel(id);
    setProgress(p => Object.fromEntries(Object.entries(p).filter(([k]) => k !== id)));
    if (!r.success) setError(`Falha ao baixar o modelo: ${r.error}`);
    setChanged(true);
    refreshEngine();
  };

  const removeModel = async (id: string) => {
    const r = await api.removeModel(id);
    if (!r.success) setError(r.error ?? 'Não foi possível remover');
    setChanged(true);
    refreshEngine();
  };

  const reinstall = async () => {
    setRepairing(true);
    setError(null);
    const r = await api.setupEngine();
    setRepairing(false);
    setRepair(null);
    if (!r.success) setError(r.error ?? 'Falha na instalação');
    setChanged(true);
    refreshEngine();
  };

  const saveKey = async () => {
    setKeyMsg(null);
    const test = await api.testOpenAIKey(keyInput);
    if (!test.success) { setKeyMsg({ ok: false, text: `Chave inválida: ${test.error}` }); return; }
    const r = await api.setOpenAIKey(keyInput);
    if (r.success) { setHasKey(true); setKeyInput(''); setKeyMsg({ ok: true, text: 'Chave validada e salva.' }); setChanged(true); }
    else setKeyMsg({ ok: false, text: r.error ?? 'Não foi possível salvar a chave' });
  };

  const removeKey = async () => {
    await api.setOpenAIKey(null);
    setHasKey(false);
    setSettings(s => ({ ...s, fallbackToOpenAI: false }));
    setKeyMsg(null);
    setChanged(true);
  };

  const installed = new Set(engine?.installedModels.map(m => m.id));
  const engineInstalled = engine ? !engine.missing.includes('python') && !engine.missing.includes('deps') : false;

  const section = 'bg-white border border-gray-200 rounded-lg p-4 mb-4';
  const label = 'block text-xs font-medium text-gray-700 mb-1';
  const input = 'w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white';

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-gray-50 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-900">Configurações</h2>
          <button onClick={close} className="p-1 text-gray-500 hover:text-gray-800"><X className="w-5 h-5" /></button>
        </div>

        <div className="overflow-y-auto p-5">
          {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">{error}</div>}

          {/* Idioma */}
          <div className={section}>
            <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3"><Languages className="w-4 h-4" /> Idioma e saída</h3>
            <label className={label}>Idioma do áudio</label>
            <select className={input} value={settings.language} onChange={e => update({ language: e.target.value })}>
              {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
            </select>
            <p className="text-[11px] text-gray-500 mt-1">Vale para o motor local e para a OpenAI.</p>

            <label className="flex items-start gap-2 mt-4 text-sm text-gray-800">
              <input
                type="checkbox" className="mt-1"
                checked={settings.includeTimestamps}
                onChange={e => update({ includeTimestamps: e.target.checked })}
              />
              <span>
                Incluir o tempo da fala no texto
                <span className="block text-[11px] text-gray-500">
                  Desligado (padrão): só o texto, em parágrafos. Ligado: cada trecho vem como [início -&gt; fim] em segundos.
                  Vale para novas transcrições e novos formatos gerados; SRT e VTT sempre têm tempo.
                </span>
              </span>
            </label>
          </div>

          {/* Motor local */}
          <div className={section}>
            <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3"><Cpu className="w-4 h-4" /> Motor local</h3>
            <div className="flex items-center justify-between mb-3 text-xs">
              <span className="text-gray-700">
                {!engine ? 'Verificando…' : engineInstalled ? 'Instalado' : 'Não instalado'}
                {engine && ` · ${engine.hasGpu ? 'GPU NVIDIA detectada' : 'sem GPU NVIDIA (usa CPU)'}`}
              </span>
              <button
                onClick={reinstall}
                disabled={repairing}
                className="flex items-center gap-1 px-2.5 py-1 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50"
              >
                {repairing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wrench className="w-3 h-3" />}
                {engineInstalled ? 'Reparar / atualizar' : 'Instalar'}
              </button>
            </div>
            {repairing && repair && <p className="text-[11px] text-gray-500 mb-3">{repair.message}{repair.percent != null && ` ${repair.percent.toFixed(0)}%`}</p>}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={label}>Dispositivo</label>
                <select className={input} value={settings.device} onChange={e => update({ device: e.target.value as DeviceChoice })}>
                  <option value="auto">Automático</option>
                  <option value="cuda" disabled={engine ? !engine.hasGpu : false}>GPU (NVIDIA)</option>
                  <option value="cpu">CPU</option>
                </select>
              </div>
              <div>
                <label className={label}>Descarregar modelo após ociosidade (min, 0 = nunca)</label>
                <input
                  type="number" min={0} className={input} value={settings.idleMinutes}
                  onChange={e => update({ idleMinutes: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                />
              </div>
            </div>
          </div>

          {/* Modelos */}
          <div className={section}>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">Modelos de transcrição</h3>
            {engine && <p className="text-[11px] text-gray-500 mb-3">{recommendationReason(engine.hardware)}</p>}
            <ul className="divide-y divide-gray-100">
              {WHISPER_MODELS.map(m => {
                const isInstalled = installed.has(m.id);
                const inUse = settings.whisperModel === m.id;
                const downloading = m.id in progress;
                return (
                  <li key={m.id} className="py-2 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-gray-900">
                        {m.name} <span className="text-[11px] text-gray-500">· {formatSize(m.sizeMB)}</span>
                        {inUse && <span className="ml-2 text-[10px] px-1.5 py-0.5 bg-brand-100 text-brand-700 rounded">em uso</span>}
                        {engine?.recommendedModel === m.id && <span className="ml-2 text-[10px] px-1.5 py-0.5 bg-green-100 text-green-700 rounded">recomendado</span>}
                      </div>
                      <div className="text-[11px] text-gray-500">
                        {m.description} · qualidade {'★'.repeat(m.quality)}{'☆'.repeat(5 - m.quality)} · velocidade {'★'.repeat(m.speed)}{'☆'.repeat(5 - m.speed)}
                      </div>
                      {downloading && (
                        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mt-1">
                          <div className="h-full bg-brand-600 transition-all" style={{ width: `${progress[m.id]}%` }} />
                        </div>
                      )}
                    </div>
                    {downloading ? (
                      <span className="text-xs text-gray-500 w-10 text-right">{progress[m.id].toFixed(0)}%</span>
                    ) : isInstalled ? (
                      <div className="flex items-center gap-2">
                        {!inUse && (
                          <button onClick={() => update({ whisperModel: m.id })} className="flex items-center gap-1 text-xs px-2 py-1 border border-gray-300 rounded-lg hover:bg-gray-100">
                            <Check className="w-3 h-3" /> Usar
                          </button>
                        )}
                        {!inUse && (
                          <button onClick={() => removeModel(m.id)} title="Remover do disco" className="p-1 text-gray-400 hover:text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() => downloadModel(m.id)}
                        disabled={!engineInstalled}
                        title={engineInstalled ? undefined : 'Instale o motor local primeiro'}
                        className="flex items-center gap-1 text-xs px-2 py-1 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-40"
                      >
                        <Download className="w-3 h-3" /> Baixar
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Dados */}
          <div className={section}>
            <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3"><Database className="w-4 h-4" /> Dados</h3>
            <div className="flex items-center justify-between gap-4">
              <p className="text-[11px] text-gray-500">
                Remove todo o histórico de transcrições e grupos. O motor local, os modelos e suas configurações são mantidos.
              </p>
              <button
                onClick={() => { setCleared(false); setConfirmClear(true); }}
                className="flex items-center gap-1 px-3 py-1.5 border border-red-300 text-red-600 rounded-lg text-sm hover:bg-red-50 whitespace-nowrap"
              >
                <Trash2 className="w-4 h-4" /> Limpar transcrições
              </button>
            </div>
            {cleared && <p className="text-[11px] text-green-700 mt-2">Histórico apagado.</p>}
          </div>

          {/* OpenAI */}
          <div className={section}>
            <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3"><KeyRound className="w-4 h-4" /> OpenAI (opcional)</h3>
            {hasKey ? (
              <div className="flex items-center justify-between text-xs mb-3">
                <span className="text-green-700 flex items-center gap-1"><Check className="w-3 h-3" /> Chave configurada</span>
                <button onClick={removeKey} className="text-red-600 hover:underline">Remover chave</button>
              </div>
            ) : null}
            <label className={label}>{hasKey ? 'Substituir chave' : 'Chave da API'}</label>
            <div className="flex gap-2">
              <input
                type="password" placeholder="sk-…" className={input} value={keyInput}
                onChange={e => setKeyInput(e.target.value)} autoComplete="off"
              />
              <button
                onClick={saveKey} disabled={!keyInput.trim()}
                className="px-3 py-1.5 bg-brand-600 text-white rounded-lg text-sm hover:bg-brand-700 disabled:opacity-40 whitespace-nowrap"
              >
                Testar e salvar
              </button>
            </div>
            {keyMsg && <p className={`text-[11px] mt-1 ${keyMsg.ok ? 'text-green-700' : 'text-red-600'}`}>{keyMsg.text}</p>}
            <p className="text-[11px] text-gray-500 mt-1">A chave fica criptografada neste computador e nunca é exibida de novo.</p>

            <label className={`flex items-start gap-2 mt-4 text-sm ${hasKey ? 'text-gray-800' : 'text-gray-400'}`}>
              <input
                type="checkbox" className="mt-1" disabled={!hasKey}
                checked={settings.fallbackToOpenAI && hasKey}
                onChange={e => update({ fallbackToOpenAI: e.target.checked })}
              />
              <span>
                Usar a OpenAI como fallback se a transcrição local falhar
                <span className="block text-[11px] text-gray-500">O áudio será enviado à OpenAI (cobrança na sua conta) apenas quando o motor local falhar.</span>
              </span>
            </label>
          </div>
        </div>

        <ConfirmationModal
          isOpen={confirmClear}
          onClose={() => setConfirmClear(false)}
          onConfirm={clearAll}
          title="Limpar todas as transcrições"
          message="Todas as transcrições e grupos do histórico serão apagados permanentemente. Esta ação não pode ser desfeita."
          confirmText="Apagar tudo"
        />

        <div className="px-5 py-3 border-t border-gray-200 flex justify-end">
          <button onClick={close} className="px-4 py-1.5 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-700">Fechar</button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
