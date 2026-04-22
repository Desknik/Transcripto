import React, { useState, useRef, useEffect } from 'react';
import { FileAudio, FileVideo, Globe, Download, Mic, Copy, Check, Trash2, ChevronDown, Plus } from 'lucide-react';
import { TranscriptionFile, TranscriptionGroup } from '../types';
import { OutputFormat, FORMAT_LABELS, FORMAT_EXTENSIONS } from '../types/transcription';
import { useAudioConverter } from '../hooks/useAudioConverter';
import EditableFileName from './EditableFileName';
import ConfirmationModal from './ConfirmationModal';

interface TranscriptionPanelProps {
  file: TranscriptionFile | null;
  group: TranscriptionGroup | null;
  showGroupHeader?: boolean;
  onUpdateFileName?: (fileId: string, newName: string) => void;
  onDeleteFile?: (fileId: string) => void;
  onGenerateFormat?: (fileId: string, format: OutputFormat) => void;
  onActiveFormatChange?: (fileId: string, format: OutputFormat) => void;
}

const AVAILABLE_FORMATS: OutputFormat[] = ['text', 'srt', 'vtt', 'json', 'verbose_json'];

const TranscriptionPanel: React.FC<TranscriptionPanelProps> = ({ 
  file, 
  group, 
  showGroupHeader = true, 
  onUpdateFileName, 
  onDeleteFile,
  onGenerateFormat,
  onActiveFormatChange
}) => {
  const { downloadConvertedFile, downloadTranscription } = useAudioConverter();
  const [copied, setCopied] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDownloadDropdown, setShowDownloadDropdown] = useState(false);
  const [showGenerateDropdown, setShowGenerateDropdown] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const downloadRef = useRef<HTMLDivElement>(null);
  const generateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (downloadRef.current && !downloadRef.current.contains(event.target as Node)) {
        setShowDownloadDropdown(false);
      }
      if (generateRef.current && !generateRef.current.contains(event.target as Node)) {
        setShowGenerateDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erro ao copiar para área de transferência:', err);
    }
  };

  if (!file) {
    return (
      <div className="flex-1 flex flex-col bg-white">
        {group && showGroupHeader && (
          <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Mic className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{group.name}</h1>
                <p className="text-sm text-gray-600">
                  {group.files.length} arquivo(s) • Criado em {new Intl.DateTimeFormat('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }).format(group.createdAt)}
                </p>
              </div>
            </div>
          </header>
        )}
        
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileAudio className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nenhuma transcrição selecionada
            </h3>
            <p className="text-gray-600">
              Selecione uma transcrição da barra lateral para visualizar o conteúdo.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const transcriptions = file.transcriptions || [];
  const activeTranscription = transcriptions.find(t => t.format === file.activeFormat) || transcriptions[0];
  const existingFormats = transcriptions.map(t => t.format);
  const availableFormatsToGenerate = AVAILABLE_FORMATS.filter(f => !existingFormats.includes(f));

  const getFileIcon = () => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (['mp4', 'mov', 'avi', 'mkv'].includes(extension || '')) {
      return <FileVideo className="w-5 h-5 text-blue-500" />;
    }
    return <FileAudio className="w-5 h-5 text-emerald-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getLanguageName = (code: string) => {
    const languages: { [key: string]: string } = {
      'pt-BR': 'Português (Brasil)',
      'en-US': 'English (US)',
      'es-ES': 'Español (España)'
    };
    return languages[code] || code;
  };

  const handleDownload = async (format: OutputFormat) => {
    const transcription = transcriptions.find(t => t.format === format);
    if (!transcription) return;

    const baseName = file.name.replace(/\.[^/.]+$/, '');
    const extension = FORMAT_EXTENSIONS[format];
    await downloadTranscription(transcription.content, baseName, extension);
    setShowDownloadDropdown(false);
  };

  const handleGenerate = async (format: OutputFormat) => {
    if (onGenerateFormat) {
      setIsGenerating(true);
      setShowGenerateDropdown(false);
      await onGenerateFormat(file.id, format);
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex-1 bg-white overflow-hidden">
      <div className="h-full flex flex-col">
        {group && showGroupHeader && (
          <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Mic className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{group.name}</h1>
                <p className="text-sm text-gray-600">
                  {group.files.length} arquivo(s) • Criado em {new Intl.DateTimeFormat('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }).format(group.createdAt)}
                </p>
              </div>
            </div>
          </header>
        )}
        
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              {getFileIcon()}
              <div className="flex-1 min-w-0">
                {onUpdateFileName ? (
                  <EditableFileName 
                    file={file}
                    onUpdateName={onUpdateFileName}
                  />
                ) : (
                  <h2 className="text-xl font-semibold text-gray-900 truncate">
                    {file.name}
                  </h2>
                )}
                <div className="flex flex-wrap items-center gap-4 mt-2">
                  <span className="text-sm text-gray-600">
                    {formatFileSize(file.size)}
                  </span>
                  <span className="text-sm text-gray-600">
                    {formatDate(file.uploadedAt)}
                  </span>
                  {file.duration && (
                    <span className="text-sm text-gray-600">
                      Duração: {file.duration}
                    </span>
                  )}
                  {file.language && (
                    <div className="flex items-center space-x-1">
                      <Globe className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {getLanguageName(file.language)}
                      </span>
                    </div>
                  )}
                  {file.transcriptionProvider && (
                    <div className="flex items-center space-x-1">
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                        {file.transcriptionProvider.toUpperCase()}
                        {file.transcriptionModel && ` • ${file.transcriptionModel}`}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="relative" ref={downloadRef}>
                <button 
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                  onClick={() => setShowDownloadDropdown(!showDownloadDropdown)}
                >
                  <Download className="w-4 h-4" />
                  <span>Baixar</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showDownloadDropdown ? 'rotate-180' : ''}`} />
                </button>
                
                {showDownloadDropdown && (
                  <div className="absolute z-10 right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg">
                    {transcriptions.map((t, index) => (
                      <button
                        key={t.id}
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${
                          index === 0 ? 'rounded-t-lg' : ''
                        } ${index === transcriptions.length - 1 ? 'rounded-b-lg' : ''}`}
                        onClick={() => handleDownload(t.format)}
                      >
                        {FORMAT_LABELS[t.format]} ({FORMAT_EXTENSIONS[t.format]})
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative" ref={generateRef}>
                <button 
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
                  onClick={() => setShowGenerateDropdown(!showGenerateDropdown)}
                  disabled={isGenerating || availableFormatsToGenerate.length === 0}
                >
                  <Plus className="w-4 h-4" />
                  <span>{isGenerating ? 'Gerando...' : 'Gerar'}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showGenerateDropdown ? 'rotate-180' : ''}`} />
                </button>
                
                {showGenerateDropdown && availableFormatsToGenerate.length > 0 && (
                  <div className="absolute z-10 right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg">
                    {availableFormatsToGenerate.map((format, index) => (
                      <button
                        key={format}
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${
                          index === 0 ? 'rounded-t-lg' : ''
                        } ${index === availableFormatsToGenerate.length - 1 ? 'rounded-b-lg' : ''}`}
                        onClick={() => handleGenerate(format)}
                      >
                        {FORMAT_LABELS[format]}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {file.isConverted && file.convertedPath && (
                <button 
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                  onClick={async () => {
                    const result = await downloadConvertedFile(file.convertedPath!);
                    if (!result.canceled && !result.error) {
                      console.log('Arquivo baixado com sucesso!');
                    } else if (result.error) {
                      console.error('Erro ao baixar:', result.error);
                    }
                  }}
                >
                  <Download className="w-4 h-4" />
                  <span>Baixar MP3</span>
                </button>
              )}

              {onDeleteFile && (
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                  title="Excluir transcrição"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Excluir</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="border-b border-gray-200 bg-gray-50">
          <div className="flex items-center px-6 py-2 space-x-1 overflow-x-auto">
            {transcriptions.map((transcription) => (
              <button
                key={transcription.id}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                  file.activeFormat === transcription.format
                    ? 'bg-white text-blue-700 shadow-sm border border-blue-200'
                    : 'text-gray-600 hover:bg-white hover:text-gray-900'
                }`}
                onClick={() => {
                  onActiveFormatChange?.(file.id, transcription.format);
                }}
              >
                {FORMAT_LABELS[transcription.format]}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">
                {FORMAT_LABELS[activeTranscription?.format || 'text']}
              </h2>
              <button
                onClick={() => activeTranscription && copyToClipboard(activeTranscription.content)}
                className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  copied 
                    ? 'text-green-700 bg-green-50 border border-green-200' 
                    : 'text-gray-700 bg-gray-50 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copiar</span>
                  </>
                )}
              </button>
            </div>
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <div className="prose prose-gray max-w-none">
                <pre className="text-gray-800 leading-relaxed whitespace-pre-wrap font-sans text-sm overflow-x-auto">
                  {activeTranscription?.content || 'Sem conteúdo'}
                </pre>
              </div>
            </div>
            
            {activeTranscription && (
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {activeTranscription.content.split(' ').length}
                  </div>
                  <div className="text-sm text-blue-600 font-medium">Palavras</div>
                </div>
                <div className="bg-emerald-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-emerald-600">
                    {activeTranscription.content.length}
                  </div>
                  <div className="text-sm text-emerald-600 font-medium">Caracteres</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.ceil(activeTranscription.content.split(' ').length / 150)}
                  </div>
                  <div className="text-sm text-purple-600 font-medium">Min. leitura</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => onDeleteFile && onDeleteFile(file.id)}
        title="Excluir Transcrição"
        message={`Tem certeza que deseja excluir a transcrição "${file.name}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  );
};

export default TranscriptionPanel;