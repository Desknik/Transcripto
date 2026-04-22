import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Cpu, FileText } from 'lucide-react';
import { TranscriptionProvider, TranscriptionModel, OutputFormat, FORMAT_LABELS } from '../types/transcription';

interface TranscriptionProviderSelectorProps {
  selectedProvider: string | null;
  selectedModel: string | null;
  selectedFormat: OutputFormat;
  onProviderChange: (provider: string, model: string) => void;
  onFormatChange: (format: OutputFormat) => void;
}

const OUTPUT_FORMATS: OutputFormat[] = ['text', 'srt', 'vtt', 'json', 'verbose_json'];

const TranscriptionProviderSelector: React.FC<TranscriptionProviderSelectorProps> = ({
  selectedProvider,
  selectedModel,
  selectedFormat,
  onProviderChange,
  onFormatChange,
}) => {
  const [providers, setProviders] = useState<TranscriptionProvider[]>([]);
  const [modelOpen, setModelOpen] = useState(false);
  const [formatOpen, setFormatOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const modelRef = useRef<HTMLDivElement>(null);
  const formatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modelRef.current && !modelRef.current.contains(event.target as Node)) {
        setModelOpen(false);
      }
      if (formatRef.current && !formatRef.current.contains(event.target as Node)) {
        setFormatOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const loadProviders = async () => {
      try {
        if (window.electronAPI) {
          const result = await window.electronAPI.getTranscriptionProviders();
          if (result.success && result.providers) {
            setProviders(result.providers);
            
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

  const handleModelSelection = (provider: TranscriptionProvider, model: TranscriptionModel) => {
    onProviderChange(provider.id, model.id);
    setModelOpen(false);
  };

  const getSelectedModelDisplay = () => {
    if (!selectedProvider || !selectedModel) {
      return 'Selecionar';
    }
    const provider = providers.find(p => p.id === selectedProvider);
    const model = provider?.models.find(m => m.id === selectedModel);
    if (!provider || !model) return 'Selecionar';
    return `${provider.name} - ${model.name}`;
  };

  const getSelectedFormatDisplay = () => {
    return FORMAT_LABELS[selectedFormat];
  };

  if (loading) {
    return (
      <div className="mb-2 flex items-center gap-3">
        <div className="relative" ref={modelRef}>
          <button className="flex items-center space-x-2 px-3 py-1.5 border border-blue-200 rounded-lg bg-blue-50 text-xs">
            <Cpu className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-blue-700">Carregando...</span>
          </button>
        </div>
        <div className="relative" ref={formatRef}>
          <button className="flex items-center space-x-2 px-3 py-1.5 border border-blue-200 rounded-lg bg-blue-50 text-xs">
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-blue-700">...</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-2 flex items-center gap-3">
      <div className="relative" ref={modelRef}>
        <button 
          className="flex items-center space-x-2 px-3 py-1.5 border border-blue-200 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors text-xs"
          onClick={() => {
            setModelOpen(!modelOpen);
            setFormatOpen(false);
          }}
        >
          <Cpu className="w-3.5 h-3.5 text-blue-600" />
          <span className="text-blue-700 font-medium">{getSelectedModelDisplay()}</span>
          <ChevronDown className={`w-3.5 h-3.5 text-blue-600 transition-transform ${modelOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {modelOpen && (
          <div className="absolute z-20 top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto text-xs">
            {providers.map((provider) => (
              <div key={provider.id}>
                <div className="px-3 py-1.5 bg-gray-50 border-b border-gray-200">
                  <span className="text-[10px] font-semibold text-gray-600 uppercase">{provider.name}</span>
                </div>
                {provider.models.map((model) => (
                  <button
                    key={`${provider.id}-${model.id}`}
                    className={`w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors ${
                      selectedProvider === provider.id && selectedModel === model.id
                        ? 'bg-blue-50'
                        : ''
                    }`}
                    onClick={() => handleModelSelection(provider, model)}
                  >
                    <div className="flex flex-col">
                      <span className={`text-xs ${selectedProvider === provider.id && selectedModel === model.id ? 'text-blue-700 font-medium' : 'text-gray-900'}`}>
                        {model.name}
                      </span>
                      {model.description && (
                        <span className="text-[10px] text-gray-500 mt-0.5">{model.description}</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="relative" ref={formatRef}>
        <button 
          className="flex items-center space-x-2 px-3 py-1.5 border border-blue-200 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors text-xs"
          onClick={() => {
            setFormatOpen(!formatOpen);
            setModelOpen(false);
          }}
        >
          <FileText className="w-3.5 h-3.5 text-blue-600" />
          <span className="text-blue-700 font-medium">{getSelectedFormatDisplay()}</span>
          <ChevronDown className={`w-3.5 h-3.5 text-blue-600 transition-transform ${formatOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {formatOpen && (
          <div className="absolute z-20 top-full left-0 mt-1 w-44 bg-white border border-gray-200 rounded-lg shadow-lg text-xs">
            {OUTPUT_FORMATS.map((format, index) => (
              <button
                key={format}
                className={`w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors ${
                  selectedFormat === format ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
                } ${index === 0 ? 'rounded-t-lg' : ''} ${index === OUTPUT_FORMATS.length - 1 ? 'rounded-b-lg' : ''}`}
                onClick={() => {
                  onFormatChange(format);
                  setFormatOpen(false);
                }}
              >
                {FORMAT_LABELS[format]}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TranscriptionProviderSelector;