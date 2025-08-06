import { useState } from 'react';
import { Mic } from 'lucide-react';
import FileUpload from './components/FileUpload';
import Sidebar from './components/Sidebar';
import TranscriptionPanel from './components/TranscriptionPanel';
import { TranscriptionFile, TranscriptionGroup } from './types';

function App() {
  const [groups, setGroups] = useState<TranscriptionGroup[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  const handleFilesUploaded = (files: TranscriptionFile[], groupId?: string) => {
    if (groupId) {
      // Adicionar arquivos a um grupo existente
      setGroups(prev => prev.map(group => 
        group.id === groupId 
          ? { ...group, files: [...group.files, ...files] }
          : group
      ));
    } else {
      // Criar novo grupo (sempre agrupa, mesmo para um arquivo)
      const newGroup: TranscriptionGroup = {
        id: crypto.randomUUID(),
        name: `Transcrição ${new Date().toLocaleDateString('pt-BR')} - ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
        files,
        createdAt: new Date()
      };

      setGroups(prev => [newGroup, ...prev]);
      setSelectedGroupId(newGroup.id);
    }
    
    // Auto-select first file
    if (files.length > 0) {
      setSelectedFileId(files[0].id);
    }
  };

  const handleFileSelect = (fileId: string | null) => {
    setSelectedFileId(fileId);
    
    // Find and set the group that contains this file
    if (fileId) {
      const group = groups.find(g => g.files.some(f => f.id === fileId));
      if (group) {
        setSelectedGroupId(group.id);
      }
    }
  };

  const selectedFile = groups
    .flatMap(group => group.files)
    .find(file => file.id === selectedFileId) || null;

  const selectedGroup = groups.find(group => group.id === selectedGroupId) || null;

  const hasTranscriptions = groups.length > 0;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex h-screen">
        {/* Sidebar - only show if there are transcriptions */}
        {hasTranscriptions && (
          <Sidebar
            groups={groups}
            selectedFileId={selectedFileId}
            selectedGroupId={selectedGroupId}
            onFileSelect={handleFileSelect}
            onNewTranscription={(groupId: string) => {
              setSelectedGroupId(groupId);
              setSelectedFileId(null);
            }}
            onNewTranscriptionGeneral={() => {
              setSelectedGroupId(null);
              setSelectedFileId(null);
            }}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {!hasTranscriptions || selectedFileId === null ? (
            // Initial state - no transcriptions or new transcription
            <>
              {/* Show group header if we're adding to an existing group */}
              {selectedGroupId && selectedGroup && (
                <header className="bg-white border-b border-gray-200 px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                      <Mic className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h1 className="text-xl font-bold text-gray-900">{selectedGroup.name}</h1>
                      <p className="text-sm text-gray-600">
                        {selectedGroup.files.length} arquivo(s) • Criado em {new Intl.DateTimeFormat('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }).format(selectedGroup.createdAt)}
                      </p>
                    </div>
                  </div>
                </header>
              )}
              
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center max-w-2xl">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Mic className="w-10 h-10 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    {!hasTranscriptions ? 'Nenhuma transcrição encontrada' : 
                     selectedGroupId ? 'Adicionar ao Grupo' : 'Nova Transcrição'}
                  </h2>
                  <p className="text-gray-600 mb-8 text-lg">
                    {selectedGroupId ? 
                      'Envie arquivos para adicionar a este grupo de transcrições.' :
                      'Envie um ou mais arquivos de áudio ou vídeo para começar a transcrever.'
                    }
                  </p>
                  <FileUpload onFilesUploaded={(files) => handleFilesUploaded(files, selectedGroupId || undefined)} />
                </div>
              </div>
            </>
          ) : (
            // Show transcription panel when there are transcriptions
            <>
              {/* Show group header when a file is selected */}
              {selectedGroup && (
                <header className="bg-white border-b border-gray-200 px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                      <Mic className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h1 className="text-xl font-bold text-gray-900">{selectedGroup.name}</h1>
                      <p className="text-sm text-gray-600">
                        {selectedGroup.files.length} arquivo(s) • Criado em {new Intl.DateTimeFormat('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }).format(selectedGroup.createdAt)}
                      </p>
                    </div>
                  </div>
                </header>
              )}
              
              <TranscriptionPanel file={selectedFile} group={selectedGroup} showGroupHeader={false} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;