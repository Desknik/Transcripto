import React, { useCallback, useState } from 'react';
import { Upload, FileAudio, FileVideo, X } from 'lucide-react';
import { TranscriptionFile, UploadProgress } from '../types';
import { useAudioConverter } from '../hooks/useAudioConverter';

interface FileUploadProps {
  onFilesUploaded: (files: TranscriptionFile[]) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFilesUploaded }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const { convertAudioFile, conversionProgress } = useAudioConverter();

  const acceptedMimeTypes = [
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
  ];
  const acceptedExtensionsArray = ['mp3','wav','m4a','aac','ogg','mp4','mov','avi','mkv'];
  const acceptedExtensions = '.mp3,.wav,.m4a,.aac,.ogg,.mp4,.mov,.avi,.mkv';

  const simulateTranscription = (): string => {
    const samples = [
      "Olá, bem-vindos ao nosso podcast sobre tecnologia. Hoje vamos falar sobre inteligência artificial e como ela está transformando o mundo dos negócios.",
      "Esta é uma reunião importante onde discutiremos os próximos passos do projeto. Precisamos alinhar as expectativas e definir os prazos.",
      "Gravação de uma aula sobre programação em React. Vamos aprender sobre hooks, componentes funcionais e gerenciamento de estado.",
      "Entrevista com o CEO da empresa sobre as novas tendências do mercado e os planos de expansão para o próximo ano.",
      "Apresentação dos resultados do último trimestre e análise das métricas de performance da equipe de vendas."
    ];
    return samples[Math.floor(Math.random() * samples.length)];
  };

  const detectLanguage = (): string => {
    const languages = ['pt-BR', 'en-US', 'es-ES'];
    return languages[Math.floor(Math.random() * languages.length)];
  };

  const generateRandomDuration = (): string => {
    const minutes = Math.floor(Math.random() * 15) + 1; // 1-15 minutes
    const seconds = Math.floor(Math.random() * 60); // 0-59 seconds
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };  const needsConversion = (file: File): boolean => {
    const videoExtensions = ['mp4', 'mov', 'avi', 'mkv'];
    const audioExtensions = ['wav', 'm4a', 'aac', 'ogg'];
    const extension = file.name.split('.').pop()?.toLowerCase();
    return [...videoExtensions, ...audioExtensions].includes(extension || '');
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
      let isConverted = false;      // Check if file needs conversion
      if (needsConversion(file)) {
        // Update status to converting
        setUploadProgress(prev => 
          prev.map(p => 
            p.fileId === progressItem.fileId 
              ? { ...p, status: 'converting', progress: 0 }
              : p
          )
        );

        // Convert file using Electron API
        if (window.electronAPI) {
          try {
            const conversionResult = await convertAudioFile(file, progressItem.fileId);
            
            if (conversionResult.success && conversionResult.outputPath) {
              isConverted = true;
              convertedPath = conversionResult.outputPath;
            } else {
              console.error('Conversion failed:', conversionResult.error);
              // Continue without conversion
            }
          } catch (error) {
            console.error('Conversion failed:', error);
            // Continue without conversion
          }
        } else {
          // Fallback: simulate conversion for development
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Simulate conversion progress
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
          convertedPath = `converted_${file.name.replace(/\.[^/.]+$/, "")}.mp3`;
        }
      }

      // Simulate transcription processing
      setUploadProgress(prev => 
        prev.map(p => 
          p.fileId === progressItem.fileId 
            ? { ...p, status: 'processing', progress: 0 }
            : p
        )
      );

      // Simulate transcription progress
      for (let progress = 0; progress <= 100; progress += 25) {
        setUploadProgress(prev => 
          prev.map(p => 
            p.fileId === progressItem.fileId 
              ? { ...p, progress }
              : p
          )
        );
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      // Complete processing
      const transcriptionFile: TranscriptionFile = {
        id: progressItem.fileId,
        name: file.name,
        size: file.size,
        type: file.type,
        content: simulateTranscription(),
        language: detectLanguage(),
        duration: generateRandomDuration(),
        uploadedAt: new Date(),
        originalPath: file.name,
        convertedPath,
        isConverted
      };

      processedFiles.push(transcriptionFile);

      setUploadProgress(prev => 
        prev.map(p => 
          p.fileId === progressItem.fileId 
            ? { ...p, status: 'completed' }
            : p
        )
      );
    }

    // Clear progress after a brief delay
    setTimeout(() => {
      setUploadProgress([]);
      onFilesUploaded(processedFiles);
    }, 1000);
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
  }, []);

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

  if (uploadProgress.length > 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Processando arquivos...
          </h3>
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
                        : item.status === 'processing'
                        ? 'bg-blue-500 animate-pulse'
                        : item.status === 'error'
                        ? 'bg-red-500'
                        : 'bg-blue-500'
                    }`}
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
                <div className="flex justify-between items-center mt-1">                  <span className="text-xs text-gray-500">
                    {item.status === 'uploading' && 'Enviando...'}
                    {item.status === 'converting' && 'Convertendo para MP3...'}
                    {item.status === 'processing' && 'Transcrevendo...'}
                    {item.status === 'completed' && 'Concluído!'}
                    {item.status === 'error' && 'Erro no processamento'}
                  </span>
                  <span className="text-xs text-gray-500">{item.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
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