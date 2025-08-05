import React, { useState, useEffect } from 'react';
import { ChevronDown, Cpu } from 'lucide-react';
import { TranscriptionProvider, TranscriptionModel } from '../types/transcription';

interface TranscriptionProviderSelectorProps {
  selectedProvider: string | null;
  selectedModel: string | null;
  onProviderChange: (provider: string, model: string) => void;
}

const TranscriptionProviderSelector: React.FC<TranscriptionProviderSelectorProps> = ({
  selectedProvider,
  selectedModel,
  onProviderChange,
}) => {
  const [providers, setProviders] = useState<TranscriptionProvider[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const loadProviders = async () => {
      try {
        if (window.electronAPI) {
          const result = await window.electronAPI.getTranscriptionProviders();
          if (result.success && result.providers) {
            setProviders(result.providers);
            
            // Auto-select first provider and model if none selected
            if (!selectedProvider && result.providers.length > 0) {
              const firstProvider = result.providers[0];
              const firstModel = firstProvider.models[0];
              if (firstModel) {
                onProviderChange(firstProvider.id, firstModel.id);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error loading transcription providers:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProviders();
  }, [selectedProvider, onProviderChange]);

  const handleSelection = (provider: TranscriptionProvider, model: TranscriptionModel) => {
    onProviderChange(provider.id, model.id);
    setIsOpen(false);
  };

  const getSelectedDisplay = () => {
    if (!selectedProvider || !selectedModel) {
      return 'Selecionar modelo de transcrição';
    }

    const provider = providers.find(p => p.id === selectedProvider);
    const model = provider?.models.find(m => m.id === selectedModel);
    
    if (!provider || !model) {
      return 'Selecionar modelo de transcrição';
    }

    return `${provider.name} - ${model.name}`;
  };

  if (loading) {
    return (
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Modelo de Transcrição
        </label>
        <div className="relative">
          <div className="w-full max-w-md px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 flex items-center">
            <Cpu className="w-4 h-4 text-gray-400 mr-2" />
            <span className="text-gray-500">Carregando modelos...</span>
          </div>
        </div>
      </div>
    );
  }

  if (providers.length === 0) {
    return (
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Modelo de Transcrição
        </label>
        <div className="relative">
          <div className="w-full max-w-md px-4 py-3 border border-red-300 rounded-lg bg-red-50 flex items-center">
            <Cpu className="w-4 h-4 text-red-400 mr-2" />
            <span className="text-red-600">Nenhum provedor de transcrição configurado</span>
          </div>
        </div>
        <p className="text-xs text-red-600 mt-1">
          Configure sua API key no arquivo .env para habilitar a transcrição
        </p>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Modelo de Transcrição
      </label>
      <div className="relative">
        <button
          type="button"
          className="w-full max-w-[220px] px-2 py-1.5 border border-gray-300 rounded-md bg-white flex items-center justify-between hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-xs min-w-0"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center">
            <Cpu className="w-3 h-3 text-gray-500 mr-1.5" />
            <span className="text-gray-900 text-xs font-normal">{getSelectedDisplay()}</span>
          </div>
          <ChevronDown 
            className={`w-3 h-3 text-gray-500 transition-transform ${
              isOpen ? 'transform rotate-180' : ''
            }`} 
          />
        </button>
        {isOpen && (
          <div className="absolute z-10 w-full max-w-[220px] mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto text-xs">
            {providers.map((provider) => (
              <div key={provider.id}>
                <div className="px-2 py-1 bg-gray-50 border-b border-gray-200">
                  <span className="text-[10px] font-medium text-gray-700">{provider.name}</span>
                </div>
                {provider.models.map((model) => (
                  <button
                    key={`${provider.id}-${model.id}`}
                    type="button"
                    className={`w-full px-2 py-1 text-left hover:bg-gray-50 transition-colors ${
                      selectedProvider === provider.id && selectedModel === model.id
                        ? 'bg-blue-50 text-blue-900'
                        : 'text-gray-900'
                    } text-xs font-normal`}
                    onClick={() => handleSelection(provider, model)}
                  >
                    <div className="flex flex-col">
                      <span className="text-xs font-medium">{model.name}</span>
                      {model.description && (
                        <span className="text-[10px] text-gray-500 mt-0.5 leading-tight">{model.description}</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TranscriptionProviderSelector;
