import React from 'react';
import { FileAudio, FileVideo, Globe, Download, Mic } from 'lucide-react';
import { TranscriptionFile, TranscriptionGroup } from '../types';
import { useAudioConverter } from '../hooks/useAudioConverter';

interface TranscriptionPanelProps {
  file: TranscriptionFile | null;
  group: TranscriptionGroup | null;
  showGroupHeader?: boolean;
}

const TranscriptionPanel: React.FC<TranscriptionPanelProps> = ({ file, group, showGroupHeader = true }) => {
  const { downloadConvertedFile } = useAudioConverter();

  if (!file) {
    return (
      <div className="flex-1 flex flex-col bg-white">
        {/* Header */}
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

  return (
    <div className="flex-1 bg-white overflow-hidden">
      <div className="h-full flex flex-col">
        {/* Group Header */}
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
        
        {/* File Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              {getFileIcon()}
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-semibold text-gray-900 truncate">
                  {file.name}
                </h2>
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
            
            {/* Download Button */}
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
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Transcrição
            </h2>
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {file.content}
                </p>
              </div>
            </div>
            
            {/* Stats */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {file.content.split(' ').length}
                </div>
                <div className="text-sm text-blue-600 font-medium">Palavras</div>
              </div>
              <div className="bg-emerald-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-emerald-600">
                  {file.content.length}
                </div>
                <div className="text-sm text-emerald-600 font-medium">Caracteres</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.ceil(file.content.split(' ').length / 150)}
                </div>
                <div className="text-sm text-purple-600 font-medium">Min. leitura</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TranscriptionPanel;