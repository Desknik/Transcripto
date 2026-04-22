import React, { useCallback, useState } from 'react';
import { Upload, FileAudio, FileVideo, X } from 'lucide-react';
import { TranscriptionFile, UploadProgress } from '../types';
import { TranscriptionEntry } from '../types/transcription';
import { useAudioConverter } from '../hooks/useAudioConverter';
import TranscriptionProviderSelector from './TranscriptionProviderSelector';
import { OutputFormat } from '../types/transcription';

interface FileUploadProps {
  onFilesUploaded: (files: TranscriptionFile[], groupId?: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFilesUploaded }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<OutputFormat>('text');
  const { convertAudioFile } = useAudioConverter();

  const acceptedMimeTypes = React.useMemo(() => [
    'audio/mp3',
    'audio/mpeg', // para mp3
    'audio/wav',
    'audio/x-wav',
    'audio/m4a',
    'audio/aac',
    'audio/ogg',
    'video/mp4',
    'video/quicktime', // mov
    'video/x-msvideo', // avi
    'video/x-matroska', // mkv
    'video/mov',
    'video/avi',
    'video/mkv',
  ], []);
  const acceptedExtensionsArray = React.useMemo(() => ['mp3','wav','m4a','aac','ogg','mp4','mov','avi','mkv'], []);
  const acceptedExtensions = '.mp3,.wav,.m4a,.aac,.ogg,.mp4,.mov,.avi,.mkv';
  
  const handleProviderChange = (provider: string, model: string) => {
    setSelectedProvider(provider);
    setSelectedModel(model);
  };

  const handleFormatChange = (format: OutputFormat) => {
    setSelectedFormat(format);
  };

  const transcribeAudio = async (filePath: string, outputFormat?: OutputFormat): Promise<{ success: boolean; text?: string; language?: string; duration?: number; error?: string }> => {
    if (!window.electronAPI || !selectedProvider || !selectedModel) {
      return { 
        success: false, 
        error: 'API não disponível ou provedor de transcrição não selecionado' 
      };
    }

    try {
      const result = await window.electronAPI.transcribeAudio({
        filePath,
        provider: selectedProvider,
        model: selectedModel,
        outputFormat,
      });

      if (result.success && result.text) {
        return {
          success: true,
          text: result.text,
          language: result.language,
          duration: result.duration,
        };
      } else {
        console.error('Transcription failed:', result.error);
        return { 
          success: false, 
          error: result.error || 'Erro desconhecido na transcrição' 
        };
      }
    } catch (error) {
      console.error('Error during transcription:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro de conexão com o serviço de transcrição' 
      };
    }
  };

  const processFiles = async (files: File[]) => {
    const newProgress: UploadProgress[] = files.map(file => ({
      fileId: crypto.randomUUID(),
      fileName: file.name,
      progress: 0,
      status: 'uploading' as const
    }));

    setUploadProgress(newProgress);

    const processedFiles: TranscriptionFile[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const progressItem = newProgress[i];

      // Simulate upload progress
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 50));
        setUploadProgress(prev => 
          prev.map(p => 
            p.fileId === progressItem.fileId 
              ? { ...p, progress }
              : p
          )
        );
      }

      let convertedPath: string | undefined;
      let isConverted = false;
      let audioFilePath: string = file.path || file.name; // Caminho real do arquivo
      // Sempre converter para mp3 93k
      setUploadProgress(prev => 
        prev.map(p => 
          p.fileId === progressItem.fileId 
            ? { ...p, status: 'converting', progress: 0 }
            : p
        )
      );

      if (window.electronAPI) {
        try {
          const conversionResult = await convertAudioFile(file, progressItem.fileId);
          if (conversionResult.success && conversionResult.outputPath) {
            isConverted = true;
            convertedPath = conversionResult.outputPath;
            audioFilePath = convertedPath; // Usa o caminho convertido real
          } else {
            console.error('Conversion failed:', conversionResult.error);
            // Continue sem conversão
          }
        } catch (error) {
          console.error('Conversion failed:', error);
          // Continue sem conversão
        }
      } else {
        // Fallback: simula conversão para desenvolvimento
        await new Promise(resolve => setTimeout(resolve, 2000));
        // Simula progresso de conversão
        for (let progress = 0; progress <= 100; progress += 20) {
          setUploadProgress(prev => 
            prev.map(p => 
              p.fileId === progressItem.fileId 
                ? { ...p, progress }
                : p
            )
          );
          await new Promise(resolve => setTimeout(resolve, 200));
        }
        isConverted = true;
        // NÃO altera audioFilePath, pois arquivo convertido não existe de fato
      }
      // Transcription processing
      setUploadProgress(prev => 
        prev.map(p => 
          p.fileId === progressItem.fileId 
            ? { ...p, status: 'transcribing', progress: 0 }
            : p
        )
      );

      // Perform actual transcription using selected format
      const transcriptionResult = await transcribeAudio(audioFilePath, selectedFormat);
      
      // Check if transcription failed
      if (!transcriptionResult.success) {
        console.error('Transcription failed:', transcriptionResult.error);
        
        // Set error status
        setUploadProgress(prev => 
          prev.map(p => 
            p.fileId === progressItem.fileId 
              ? { 
                  ...p, 
                  status: 'error', 
                  progress: 100, 
                  errorMessage: transcriptionResult.error || 'Erro desconhecido na transcrição' 
                }
              : p
          )
        );
        
        // Skip adding this file to processed files and continue with next file
        continue;
      }

      // Format duration for display
      const formatDurationDisplay = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
      };

      // Create transcription entry
      const transcriptionEntry: TranscriptionEntry = {
        id: crypto.randomUUID(),
        format: selectedFormat,
        content: transcriptionResult.text || '',
        createdAt: new Date(),
        language: transcriptionResult.language || 'pt-BR',
        duration: transcriptionResult.duration,
      };

      // Complete processing
      const transcriptionFile: TranscriptionFile = {
        id: progressItem.fileId,
        name: file.name,
        size: file.size,
        type: file.type,
        transcriptions: [transcriptionEntry],
        activeFormat: selectedFormat,
        language: transcriptionResult.language || 'pt-BR',
        duration: transcriptionResult.duration ? formatDurationDisplay(transcriptionResult.duration) : undefined,
        uploadedAt: new Date(),
        originalPath: file.name,
        convertedPath,
        audioPath: convertedPath,
        isConverted,
        transcriptionProvider: selectedProvider || undefined,
        transcriptionModel: selectedModel || undefined,
      };

      processedFiles.push(transcriptionFile);

      setUploadProgress(prev => 
        prev.map(p => 
          p.fileId === progressItem.fileId 
            ? { ...p, status: 'completed' }
            : p
        )
      );    }

    // Create groups for successfully processed files immediately
    if (processedFiles.length > 0) {
      onFilesUploaded(processedFiles);
    }

    // Use a small delay to check the final state after all updates
    setTimeout(() => {
      setUploadProgress(currentProgress => {
        const hasErrors = currentProgress.some(p => p.status === 'error');
        
        if (!hasErrors) {
          // Only auto-clear if NO errors - all files were successful
          setTimeout(() => {
            setUploadProgress([]);
          }, 1000);
        }
        // If there are errors, keep them visible until user manually clears
        
        return currentProgress;
      });
    }, 100);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files).filter(file => {
      const ext = file.name.split('.').pop()?.toLowerCase();
      return (
        (file.type && acceptedMimeTypes.includes(file.type)) ||
        (ext && acceptedExtensionsArray.includes(ext))
      );
    });

    if (files.length > 0) {
      processFiles(files);
    }
  }, [acceptedMimeTypes, acceptedExtensionsArray, processFiles]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      processFiles(files);
    }
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (['mp4', 'mov', 'avi', 'mkv'].includes(extension || '')) {
      return <FileVideo className="w-5 h-5 text-blue-500" />;
    }
    return <FileAudio className="w-5 h-5 text-emerald-500" />;
  };
  const removeUploadItem = (fileId: string) => {
    setUploadProgress(prev => prev.filter(p => p.fileId !== fileId));
  };
  const clearAllErrors = () => {
    setUploadProgress([]);
  };
  if (uploadProgress.length > 0) {
    const hasErrors = uploadProgress.some(item => item.status === 'error');
    const hasCompleted = uploadProgress.some(item => item.status === 'completed');
    const hasProcessing = uploadProgress.some(item => ['uploading', 'converting', 'transcribing'].includes(item.status));

    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {hasProcessing ? 'Processando arquivos...' : hasErrors ? 'Processamento concluído com erros' : 'Processamento concluído'}
            </h3>
            
            {/* Action buttons when not processing */}
            {!hasProcessing && (
              <div className="flex space-x-2">
                {hasErrors && (
                  <button
                    onClick={clearAllErrors}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg font-medium transition-colors"
                  >
                    Nova Transcrição
                  </button>
                )}
                {(hasCompleted || hasErrors) && (
                  <button
                    onClick={clearAllErrors}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg font-medium transition-colors"
                  >
                    Limpar Lista
                  </button>
                )}
              </div>
            )}
          </div>
          <div className="space-y-4">
            {uploadProgress.map((item) => (
              <div key={item.fileId} className="relative">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    {getFileIcon(item.fileName)}
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {item.fileName}
                    </span>
                  </div>
                  {item.status === 'completed' && (
                    <button
                      onClick={() => removeUploadItem(item.fileId)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      item.status === 'completed' 
                        ? 'bg-emerald-500' 
                        : item.status === 'converting'
                        ? 'bg-orange-500 animate-pulse'
                        : item.status === 'transcribing'
                        ? 'bg-purple-500 animate-pulse'
                        : item.status === 'error'
                        ? 'bg-red-500'
                        : 'bg-blue-500'
                    }`}
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-gray-500">
                    {item.status === 'uploading' && 'Enviando...'}
                    {item.status === 'converting' && 'Convertendo para MP3...'}
                    {item.status === 'transcribing' && 'Transcrevendo...'}
                    {item.status === 'completed' && 'Concluído!'}
                    {item.status === 'error' && (
                      <span className="text-red-600">
                        {item.errorMessage || 'Erro no processamento'}
                      </span>
                    )}
                  </span>
                  {item.status !== 'error' && (
                    <span className="text-xs text-gray-500">{item.progress}%</span>
                  )}
                </div>
                {item.status === 'error' && item.errorMessage && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                    <strong>Erro:</strong> {item.errorMessage}
                  </div>
                )}
              </div>            ))}
          </div>
          
          {/* Additional help message for errors */}
          {hasErrors && !hasProcessing && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                  </svg>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-yellow-800">
                    Alguns arquivos falharam na transcrição
                  </h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Verifique se sua chave da API OpenAI está configurada corretamente no arquivo .env e se você tem créditos disponíveis.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
  return (
    <div className="max-w-2xl mx-auto">
      <TranscriptionProviderSelector
        selectedProvider={selectedProvider}
        selectedModel={selectedModel}
        selectedFormat={selectedFormat}
        onProviderChange={handleProviderChange}
        onFormatChange={handleFormatChange}
      />
      
      <div
        className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 ${
          isDragOver
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragOver(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragOver(false);
        }}
        onDragEnter={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Arraste arquivos aqui ou clique para selecionar
        </h3>
        <p className="text-gray-600 mb-6">
          Suporte para áudio e vídeo (MP3, WAV, MP4, M4A, etc.)
        </p>
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
    </div>
  );
};

export default FileUpload;