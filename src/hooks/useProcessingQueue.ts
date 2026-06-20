import { useState, useRef, useCallback } from 'react';
import { TranscriptionFile, UploadProgress } from '../types';
import { OutputFormat, TranscriptionEntry } from '../types/transcription';

const MAX_CONCURRENT_TRANSCRIPTIONS = 3;
const CHUNK_DURATION_SECONDS = 16 * 60;

export interface BatchProgress {
  batchId: string;
  items: UploadProgress[];
}

export interface EnqueueOptions {
  files: File[];
  provider: string;
  model: string;
  format: OutputFormat;
  onFileComplete: (file: TranscriptionFile, isFirstInBatch: boolean) => void;
}

export function useProcessingQueue() {
  const [batches, setBatches] = useState<BatchProgress[]>([]);

  // Global conversion mutex — ensures only one ffmpeg process at a time across all batches
  const conversionTail = useRef(Promise.resolve());

  // Global transcription semaphore — shared across all batches
  const txSlots = useRef(MAX_CONCURRENT_TRANSCRIPTIONS);
  const txWaiters = useRef<Array<() => void>>([]);

  const acquireTx = useCallback((): Promise<void> =>
    new Promise(resolve => {
      if (txSlots.current > 0) { txSlots.current--; resolve(); }
      else txWaiters.current.push(resolve);
    }), []);

  const releaseTx = useCallback(() => {
    const next = txWaiters.current.shift();
    if (next) next(); else txSlots.current++;
  }, []);

  const updateItem = useCallback((batchId: string, fileId: string, update: Partial<UploadProgress>) => {
    setBatches(prev => prev.map(b =>
      b.batchId !== batchId ? b : {
        ...b,
        items: b.items.map(x => x.fileId === fileId ? { ...x, ...update } : x),
      }
    ));
  }, []);

  const replaceItem = useCallback((batchId: string, fileId: string, newItems: UploadProgress[]) => {
    setBatches(prev => prev.map(b => {
      if (b.batchId !== batchId) return b;
      const pos = b.items.findIndex(x => x.fileId === fileId);
      if (pos === -1) return b;
      return { ...b, items: [...b.items.slice(0, pos), ...newItems, ...b.items.slice(pos + 1)] };
    }));
  }, []);

  const enqueue = useCallback(({ files, provider, model, format, onFileComplete }: EnqueueOptions) => {
    const batchId = crypto.randomUUID();
    const initialItems: UploadProgress[] = files.map(file => ({
      fileId: crypto.randomUUID(),
      fileName: file.name,
      progress: 0,
      status: 'uploading' as const,
    }));

    setBatches(prev => [...prev, { batchId, items: initialItems }]);

    (async () => {
      interface WorkItem {
        fileId: string;
        displayName: string;
        audioPath: string;
        originalFile: File;
      }

      const formatDuration = (s: number) =>
        `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

      const callAPI = async (filePath: string, outputFormat?: OutputFormat) => {
        if (!window.electronAPI) return { success: false, error: 'API não disponível' };
        try {
          const r = await window.electronAPI.transcribeAudio({ filePath, provider, model, outputFormat });
          if (r.success && r.text) return { success: true, text: r.text, language: r.language, duration: r.duration };
          return { success: false, error: r.error || 'Erro desconhecido' };
        } catch (e) {
          return { success: false, error: e instanceof Error ? e.message : 'Erro de conexão' };
        }
      };

      const transcribeWithRetry = async (audioPath: string) => {
        for (let attempt = 0; attempt < 3; attempt++) {
          const result = await callAPI(audioPath, format);
          if (result.success) return result;
          const isRateLimit = result.error?.includes('429') ||
            result.error?.toLowerCase().includes('rate limit') ||
            result.error?.toLowerCase().includes('too many');
          if (!isRateLimit) return result;
          await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 2000 + Math.random() * 1000));
        }
        return { success: false, error: 'Limite de tentativas excedido' };
      };

      const tasks: Promise<void>[] = [];
      let completedCount = 0;

      const startTranscription = (item: WorkItem) => {
        tasks.push((async () => {
          await acquireTx();
          try {
            updateItem(batchId, item.fileId, { status: 'transcribing', progress: 0 });
            const result = await transcribeWithRetry(item.audioPath);
            if (!result.success) {
              updateItem(batchId, item.fileId, { status: 'error', errorMessage: result.error });
              return;
            }
            const entry: TranscriptionEntry = {
              id: crypto.randomUUID(),
              format,
              content: result.text || '',
              createdAt: new Date(),
              language: result.language || 'pt-BR',
              duration: result.duration,
            };
            const tf: TranscriptionFile = {
              id: item.fileId,
              name: item.displayName,
              size: item.originalFile.size,
              type: item.originalFile.type,
              transcriptions: [entry],
              activeFormat: format,
              language: result.language || 'pt-BR',
              duration: result.duration ? formatDuration(result.duration) : undefined,
              uploadedAt: new Date(),
              originalPath: item.originalFile.name,
              convertedPath: item.audioPath,
              audioPath: item.audioPath,
              isConverted: true,
              transcriptionProvider: provider,
              transcriptionModel: model,
            };
            const isFirst = completedCount === 0;
            completedCount++;
            onFileComplete(tf, isFirst);
            updateItem(batchId, item.fileId, { status: 'completed', progress: 100 });
          } finally {
            releaseTx();
          }
        })());
      };

      // Sequential conversion via global mutex — no parallel ffmpeg across batches
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const progressItem = initialItems[i];

        if (!window.electronAPI) continue;

        // Simulate file-read progress
        for (let p = 0; p <= 100; p += 10) {
          await new Promise(r => setTimeout(r, 50));
          updateItem(batchId, progressItem.fileId, { progress: p });
        }
        updateItem(batchId, progressItem.fileId, { status: 'converting', progress: 0 });

        // Acquire global conversion slot — blocks until previous ffmpeg finishes
        let releaseConversion!: () => void;
        await new Promise<void>(resolve => {
          conversionTail.current = conversionTail.current.then(() => {
            resolve();
            return new Promise<void>(r => { releaseConversion = r; });
          });
        });

        try {
          const arrayBuffer = await file.arrayBuffer();
          const saveResult = await window.electronAPI.saveFileToDisk(arrayBuffer, file.name);
          if (!saveResult.success || !saveResult.filePath) {
            updateItem(batchId, progressItem.fileId, { status: 'error', errorMessage: saveResult.error || 'Falha ao salvar arquivo' });
            continue;
          }

          const splitResult = await window.electronAPI.splitAudio(saveResult.filePath, CHUNK_DURATION_SECONDS);
          if (!splitResult.success || !splitResult.chunks.length) {
            updateItem(batchId, progressItem.fileId, { status: 'error', errorMessage: splitResult.error || 'Falha na conversão' });
            continue;
          }

          const chunks = splitResult.chunks;
          const baseName = file.name.replace(/\.[^/.]+$/, '');
          const ext = file.name.includes('.') ? file.name.split('.').pop()! : 'mp4';

          if (chunks.length === 1) {
            updateItem(batchId, progressItem.fileId, { status: 'queued', progress: 0 });
            startTranscription({ fileId: progressItem.fileId, displayName: file.name, audioPath: chunks[0], originalFile: file });
          } else {
            const chunkEntries: UploadProgress[] = chunks.map((_, idx) => ({
              fileId: crypto.randomUUID(),
              fileName: `${baseName}_${String(idx + 1).padStart(3, '0')}.${ext}`,
              progress: 0,
              status: 'queued' as const,
            }));
            replaceItem(batchId, progressItem.fileId, chunkEntries);
            chunks.forEach((chunkPath, idx) => {
              startTranscription({ fileId: chunkEntries[idx].fileId, displayName: chunkEntries[idx].fileName, audioPath: chunkPath, originalFile: file });
            });
          }
        } finally {
          releaseConversion();
        }
      }

      await Promise.all(tasks);

      // Auto-dismiss after success
      setTimeout(() => {
        setBatches(prev => {
          const batch = prev.find(b => b.batchId === batchId);
          if (!batch || batch.items.some(x => x.status === 'error')) return prev;
          return prev.filter(b => b.batchId !== batchId);
        });
      }, 3000);
    })();
  }, [acquireTx, releaseTx, updateItem, replaceItem]);

  const dismissBatch = useCallback((batchId: string) => {
    setBatches(prev => prev.filter(b => b.batchId !== batchId));
  }, []);

  const dismissItem = useCallback((batchId: string, fileId: string) => {
    setBatches(prev =>
      prev.map(b =>
        b.batchId !== batchId ? b : { ...b, items: b.items.filter(x => x.fileId !== fileId) }
      ).filter(b => b.items.length > 0)
    );
  }, []);

  return { batches, enqueue, dismissBatch, dismissItem };
}
