import React, { useEffect, useState } from 'react';
import { Download, Loader2, AlertCircle, Settings } from 'lucide-react';
import logo from '../assets/cpod.svg';
import { EngineStatus, SetupEvent, WHISPER_MODELS, describeModel, recommendationReason } from '../types/settings';

interface SetupWizardProps {
  status: EngineStatus;
  onDone: () => void;
  onSkip: () => void;
  onOpenSettings: () => void;
}

const STAGE_LABELS: Record<string, string> = {
  gpu: 'Detectando hardware',
  python: 'Python',
  pip: 'Gerenciador de pacotes',
  deps: 'Motor de transcrição',
  cuda: 'Bibliotecas da GPU',
  model: 'Modelo de voz',
  verify: 'Verificação',
};

const SetupWizard: React.FC<SetupWizardProps> = ({ status, onDone, onSkip, onOpenSettings }) => {
  // Começa pelo modelo recomendado para esta máquina; a pessoa pode trocar antes de instalar
  const [modelId, setModelId] = useState(status.recommendedModel);
  const [running, setRunning] = useState(false);
  const [event, setEvent] = useState<SetupEvent | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => window.electronAPI.onEngineSetupProgress(setEvent), []);

  const model = WHISPER_MODELS.find(m => m.id === modelId);
  const sizeGB = (status.hasGpu ? 1.5 : 0.3) + (model && !status.installedModels.some(m => m.id === modelId) ? model.sizeMB / 1024 : 0);

  const start = async () => {
    setRunning(true);
    setError(null);
    const saved = await window.electronAPI.updateSettings({ whisperModel: modelId });
    if (!saved.success) {
      setRunning(false);
      setError(saved.error ?? 'Não foi possível salvar o modelo escolhido');
      return;
    }
    const r = await window.electronAPI.setupEngine();
    setRunning(false);
    if (r.success) onDone();
    else setError(r.error ?? 'Falha na instalação');
  };

  return (
    <div className="fixed inset-0 z-40 bg-gray-100 flex items-center justify-center p-8">
      <div className="bg-white rounded-xl shadow-lg max-w-lg w-full p-8 text-center">
        <img src={logo} alt="cPod" className="h-16 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Preparar a transcrição local</h2>
        <p className="text-gray-600 text-sm mb-4">
          Na primeira vez, o Transcripto baixa o motor de transcrição e um modelo de voz.
          Depois disso tudo funciona offline, direto no seu computador.
        </p>

        <div className="text-left mb-4">
          <label className="block text-xs font-medium text-gray-700 mb-1">Modelo de transcrição</label>
          <select
            value={modelId}
            onChange={e => setModelId(e.target.value)}
            disabled={running}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
          >
            {WHISPER_MODELS.map(m => (
              <option key={m.id} value={m.id}>{describeModel(m, m.id === status.recommendedModel)}</option>
            ))}
          </select>
          {model && <p className="text-[11px] text-gray-500 mt-1">{model.description}</p>}
        </div>

        <p className="text-xs text-gray-500 mb-6">
          {recommendationReason(status.hardware)} Download aproximado: {sizeGB.toFixed(1)} GB.
        </p>

        {running && (
          <div className="mb-6 text-left">
            <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
              <Loader2 className="w-4 h-4 animate-spin text-brand-600" />
              <span>{event ? `${STAGE_LABELS[event.stage] ?? event.stage}: ${event.message}` : 'Iniciando…'}</span>
            </div>
            {event?.percent != null && (
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-brand-600 transition-all" style={{ width: `${event.percent}%` }} />
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-left text-xs text-red-700 flex gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <button
          onClick={start}
          disabled={running}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 text-sm font-medium"
        >
          <Download className="w-4 h-4" />
          {error ? 'Tentar novamente' : 'Baixar e instalar'}
        </button>

        {!running && (
          <div className="mt-4 flex justify-center gap-4 text-xs">
            <button onClick={onOpenSettings} className="text-brand-600 hover:underline flex items-center gap-1">
              <Settings className="w-3 h-3" /> Usar a OpenAI em vez disso
            </button>
            <button onClick={onSkip} className="text-gray-500 hover:underline">Agora não</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SetupWizard;
