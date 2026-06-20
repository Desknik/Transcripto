import React, { useCallback, useState } from 'react';
import { Upload, FileAudio, FileVideo, X } from 'lucide-react';
import { UploadProgress } from '../types';
import TranscriptionProviderSelector from './TranscriptionProviderSelector';
import { OutputFormat } from '../types/transcription';
import { BatchProgress } from '../hooks/useProcessingQueue';

interface FileUploadProps {
  onFilesSelected: (files: File[], provider: string, model: string, format: OutputFormat) => void;
  batches: BatchProgress[];
  onDismissBatch: (batchId: string) => void;
  onDismissItem: (batchId: string, fileId: string) => void;
}

const acceptedMimeTypes = [
  'audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/x-wav',
  'audio/m4a', 'audio/aac', 'audio/ogg',
  'video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska',
  'video/mov', 'video/avi', 'video/mkv',
];
const acceptedExtensionsArray = ['mp3', 'wav', 'm4a', 'aac', 'ogg', 'mp4', 'mov', 'avi', 'mkv'];
const acceptedExtensions = '.mp3,.wav,.m4a,.aac,.ogg,.mp4,.mov,.avi,.mkv';

const getFileIcon = (fileName: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  if (['mp4', 'mov', 'avi', 'mkv'].includes(ext || '')) {
    return <FileVideo className="w-5 h-5 text-blue-500" />;
  }
  return <FileAudio className="w-5 h-5 text-emerald-500" />;
};

const ItemRow: React.FC<{ item: UploadProgress; onDismiss: () => void }> = ({ item, onDismiss }) => (
  <div className="relative">
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center space-x-3">
        {getFileIcon(item.fileName)}
        <span className="text-sm font-medium text-gray-900 truncate">{item.fileName}</span>
      </div>
      {item.status === 'completed' && (
        <button onClick={onDismiss} className="text-gray-400 hover:text-gray-600">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className={`h-2 rounded-full transition-all duration-300 ${
          item.status === 'completed' ? 'bg-emerald-500'
          : item.status === 'converting' ? 'bg-orange-500 animate-pulse'
          : item.status === 'queued' ? 'bg-gray-400'
          : item.status === 'transcribing' ? 'bg-purple-500 animate-pulse'
          : item.status === 'error' ? 'bg-red-500'
          : 'bg-blue-500'
        }`}
        style={{ width: item.status === 'queued' ? '100%' : `${item.progress}%` }}
      />
    </div>
    <div className="flex justify-between items-center mt-1">
      <span className="text-xs text-gray-500">
        {item.status === 'uploading' && 'Enviando...'}
        {item.status === 'converting' && 'Convertendo para MP3...'}
        {item.status === 'queued' && 'Na fila para transcrição...'}
        {item.status === 'transcribing' && 'Transcrevendo...'}
        {item.status === 'completed' && 'Concluído!'}
        {item.status === 'error' && (
          <span className="text-red-600">{item.errorMessage || 'Erro no processamento'}</span>
        )}
      </span>
      {item.status !== 'error' && item.status !== 'queued' && (
        <span className="text-xs text-gray-500">{item.progress}%</span>
      )}
    </div>
    {item.status === 'error' && item.errorMessage && (
      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
        <strong>Erro:</strong> {item.errorMessage}
      </div>
    )}
  </div>
);

const FileUpload: React.FC<FileUploadProps> = ({ onFilesSelected, batches, onDismissBatch, onDismissItem }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<OutputFormat>('text');

  const submit = useCallback((files: File[]) => {
    if (!selectedProvider || !selectedModel) return;
    onFilesSelected(files, selectedProvider, selectedModel, selectedFormat);
  }, [selectedProvider, selectedModel, selectedFormat, onFilesSelected]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter(file => {
      const ext = file.name.split('.').pop()?.toLowerCase();
      return (file.type && acceptedMimeTypes.includes(file.type)) || (ext && acceptedExtensionsArray.includes(ext));
    });
    if (files.length > 0) submit(files);
  }, [submit]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) submit(files);
    e.target.value = '';
  };

  const hasActiveBatches = batches.length > 0;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <TranscriptionProviderSelector
        selectedProvider={selectedProvider}
        selectedModel={selectedModel}
        selectedFormat={selectedFormat}
        onProviderChange={(provider, model) => { setSelectedProvider(provider); setSelectedModel(model); }}
        onFormatChange={setSelectedFormat}
      />

      <div
        className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 ${
          isDragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(true); }}
        onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(false); }}
        onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); }}
      >
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Arraste arquivos aqui ou clique para selecionar
        </h3>
        <p className="text-gray-600 mb-6">Suporte para áudio e vídeo (MP3, WAV, MP4, M4A, etc.)</p>
        <input
          type="file"
          multiple
          accept={acceptedExtensions}
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
          Selecionar Arquivos
        </button>
      </div>

      {hasActiveBatches && (
        <div className="space-y-3">
          {batches.map(batch => {
            const hasErrors = batch.items.some(x => x.status === 'error');
            const allDone = batch.items.every(x => x.status === 'completed' || x.status === 'error');
            const isProcessing = batch.items.some(x => ['uploading', 'converting', 'transcribing'].includes(x.status));

            return (
              <div key={batch.batchId} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-700">
                    {isProcessing ? 'Processando...' : hasErrors ? 'Concluído com erros' : 'Concluído'}
                  </h3>
                  {allDone && (
                    <button onClick={() => onDismissBatch(batch.batchId)} className="text-gray-400 hover:text-gray-600">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="space-y-4">
                  {batch.items.map(item => (
                    <ItemRow
                      key={item.fileId}
                      item={item}
                      onDismiss={() => onDismissItem(batch.batchId, item.fileId)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
