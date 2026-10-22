import React, { useEffect, useState } from 'react';
import { Download, Loader2, Mic, AlertCircle, Settings } from 'lucide-react';
import { EngineStatus, SetupEvent, WHISPER_MODELS } from '../types/settings';

interface SetupWizardProps {
  status: EngineStatus;
  modelId: string;
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

const SetupWizard: React.FC<SetupWizardProps> = ({ status, modelId, onDone, onSkip, onOpenSettings }) => {
  const [running, setRunning] = useState(false);
  const [event, setEvent] = useState<SetupEvent | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => window.electronAPI.onEngineSetupProgress(setEvent), []);

  const model = WHISPER_MODELS.find(m => m.id === modelId);
  const sizeGB = (status.hasGpu ? 1.5 : 0.3) + (status.missing.includes('model') ? (model?.sizeMB ?? 1600) / 1024 : 0);

  const start = async () => {
    setRunning(true);
    setError(null);
    const r = await window.electronAPI.setupEngine();
    setRunning(false);
    if (r.success) onDone();
    else setError(r.error ?? 'Falha na instalação');
  };

  return (
    <div className="fixed inset-0 z-40 bg-gray-100 flex items-center justify-center p-8">
      <div className="bg-white rounded-xl shadow-lg max-w-lg w-full p-8 text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mic className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Preparar a transcrição local</h2>
        <p className="text-gray-600 text-sm mb-4">
          Na primeira vez, o Transcripto baixa o motor de transcrição e o modelo <b>{model?.name ?? modelId}</b>.
          Depois disso tudo funciona offline, direto no seu computador.
        </p>
        <p className="text-xs text-gray-500 mb-6">
          {status.hasGpu ? 'GPU NVIDIA detectada: a transcrição será acelerada.' : 'Nenhuma GPU NVIDIA detectada: será usada a CPU (mais lenta).'}
          {' '}Download aproximado: {sizeGB.toFixed(1)} GB.
        </p>

        {running && (
          <div className="mb-6 text-left">
            <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              <span>{event ? `${STAGE_LABELS[event.stage] ?? event.stage}: ${event.message}` : 'Iniciando…'}</span>
            </div>
            {event?.percent != null && (
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 transition-all" style={{ width: `${event.percent}%` }} />
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
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
        >
          <Download className="w-4 h-4" />
          {error ? 'Tentar novamente' : 'Baixar e instalar'}
        </button>

        {!running && (
          <div className="mt-4 flex justify-center gap-4 text-xs">
            <button onClick={onOpenSettings} className="text-blue-600 hover:underline flex items-center gap-1">
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
