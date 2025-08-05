import React, { useState } from 'react';
import { Mic } from 'lucide-react';
import FileUpload from './components/FileUpload';
import Sidebar from './components/Sidebar';
import TranscriptionPanel from './components/TranscriptionPanel';
import { TranscriptionFile, TranscriptionGroup } from './types';

function App() {
  const [groups, setGroups] = useState<TranscriptionGroup[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);

  const handleFilesUploaded = (files: TranscriptionFile[]) => {
    const newGroup: TranscriptionGroup = {
      id: crypto.randomUUID(),
      name: files.length === 1 
        ? files[0].name 
        : `Grupo ${new Date().toLocaleDateString('pt-BR')} - ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
      files,
      createdAt: new Date()
    };

    setGroups(prev => [newGroup, ...prev]);
    
    // Auto-select first file
    if (files.length > 0) {
      setSelectedFileId(files[0].id);
    }
  };

  const handleFileSelect = (fileId: string | null) => {
    setSelectedFileId(fileId);
  };

  const selectedFile = groups
    .flatMap(group => group.files)
    .find(file => file.id === selectedFileId) || null;

  const hasTranscriptions = groups.length > 0;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Mic className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Transcripto</h1>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Sidebar - only show if there are transcriptions */}
        {hasTranscriptions && (
          <Sidebar
            groups={groups}
            selectedFileId={selectedFileId}
            onFileSelect={handleFileSelect}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {!hasTranscriptions || selectedFileId === null ? (
            // Initial state - no transcriptions
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center max-w-2xl">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Mic className="w-10 h-10 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {!hasTranscriptions ? 'Nenhuma transcrição encontrada' : 'Nova Transcrição'}
                </h2>
                <p className="text-gray-600 mb-8 text-lg">
                  Envie um ou mais arquivos de áudio ou vídeo para começar a transcrever.
                </p>
                <FileUpload onFilesUploaded={handleFilesUploaded} />
              </div>
            </div>
          ) : (
            // Show transcription panel when there are transcriptions
            <TranscriptionPanel file={selectedFile} />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;