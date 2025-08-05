import { useState, useCallback } from 'react';

interface ConversionResult {
  success: boolean;
  outputPath?: string;
  error?: string;
}

export const useAudioConverter = () => {
  const [isConverting, setIsConverting] = useState(false);
  const [conversionProgress, setConversionProgress] = useState<Record<string, number>>({});

  const convertAudioFile = useCallback(async (file: File, fileId: string): Promise<ConversionResult> => {
    if (!window.electronAPI) {
      return { success: false, error: 'Electron API não disponível' };
    }

    setIsConverting(true);
    setConversionProgress(prev => ({ ...prev, [fileId]: 0 }));

    try {
      // Convert file to ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      
      // Save file to disk first
      const saveResult = await window.electronAPI.saveFileToDisk(arrayBuffer, file.name);
      
      if (!saveResult.success || !saveResult.filePath) {
        throw new Error(saveResult.error || 'Falha ao salvar arquivo temporário');
      }

      // Simulate progress for UI feedback
      const progressInterval = setInterval(() => {
        setConversionProgress(prev => {
          const current = prev[fileId] || 0;
          if (current < 90) {
            return { ...prev, [fileId]: current + 10 };
          }
          return prev;
        });
      }, 200);

      // Convert the file
      const result = await window.electronAPI.convertAudio(saveResult.filePath);
      
      clearInterval(progressInterval);
      setConversionProgress(prev => ({ ...prev, [fileId]: 100 }));
      
      return result;
    } catch (error) {
      console.error('Erro na conversão:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido na conversão' 
      };
    } finally {
      setIsConverting(false);
      // Clean up progress after a delay
      setTimeout(() => {
        setConversionProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[fileId];
          return newProgress;
        });
      }, 2000);
    }
  }, []);

  const downloadConvertedFile = useCallback(async (convertedPath: string) => {
    if (!window.electronAPI) {
      return { canceled: true };
    }

    try {
      const saveDialog = await window.electronAPI.saveFileDialog();
      
      if (saveDialog.canceled || !saveDialog.filePath) {
        return { canceled: true };
      }

      const copyResult = await window.electronAPI.copyFile(convertedPath, saveDialog.filePath);
      
      if (copyResult.success) {
        return { canceled: false, filePath: saveDialog.filePath };
      } else {
        throw new Error(copyResult.error || 'Falha ao copiar arquivo');
      }
    } catch (error) {
      console.error('Erro ao baixar arquivo:', error);
      return { canceled: true, error: error instanceof Error ? error.message : 'Erro desconhecido' };
    }
  }, []);

  // Keep the old function for backward compatibility
  const convertAudio = useCallback(async (filePath: string, fileId: string): Promise<ConversionResult> => {
    if (!window.electronAPI) {
      return { success: false, error: 'Electron API não disponível' };
    }

    setIsConverting(true);
    setConversionProgress(prev => ({ ...prev, [fileId]: 0 }));

    try {
      const progressInterval = setInterval(() => {
        setConversionProgress(prev => {
          const current = prev[fileId] || 0;
          if (current < 90) {
            return { ...prev, [fileId]: current + 10 };
          }
          return prev;
        });
      }, 200);

      const result = await window.electronAPI.convertAudio(filePath);
      
      clearInterval(progressInterval);
      setConversionProgress(prev => ({ ...prev, [fileId]: 100 }));
      
      return result;
    } catch (error) {
      console.error('Erro na conversão:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido na conversão' 
      };
    } finally {
      setIsConverting(false);
      setTimeout(() => {
        setConversionProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[fileId];
          return newProgress;
        });
      }, 2000);
    }
  }, []);

  const saveFileDialog = useCallback(async () => {
    if (!window.electronAPI) {
      return { canceled: true };
    }

    try {
      return await window.electronAPI.saveFileDialog();
    } catch (error) {
      console.error('Erro ao abrir diálogo de salvamento:', error);
      return { canceled: true };
    }
  }, []);

  return {
    convertAudio,
    convertAudioFile,
    downloadConvertedFile,
    saveFileDialog,
    isConverting,
    conversionProgress,
  };
};
