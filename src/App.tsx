import { Mic } from 'lucide-react';
import FileUpload from './components/FileUpload';
import Sidebar from './components/Sidebar';
import TranscriptionPanel from './components/TranscriptionPanel';
import EditableGroupHeader from './components/EditableGroupHeader';
import { TranscriptionFile, TranscriptionGroup } from './types';
import { useElectronStore } from './hooks/useElectronStore';

function App() {
  const {
    isLoading,
    groups,
    selectedFileId,
    selectedGroupId,
    saveGroups,
    saveSelectedFileId,
    saveSelectedGroupId,
    updateGroupName
  } = useElectronStore();

  const handleFilesUploaded = async (files: TranscriptionFile[], groupId?: string) => {
    if (groupId) {
      // Adicionar arquivos a um grupo existente
      const updatedGroups = groups.map(group => 
        group.id === groupId 
          ? { ...group, files: [...group.files, ...files] }
          : group
      );
      await saveGroups(updatedGroups);
    } else {
      // Criar novo grupo (sempre agrupa, mesmo para um arquivo)
      const newGroup: TranscriptionGroup = {
        id: crypto.randomUUID(),
        name: `Transcrição ${new Date().toLocaleDateString('pt-BR')} - ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
        files,
        createdAt: new Date()
      };

      await saveGroups([newGroup, ...groups]);
      await saveSelectedGroupId(newGroup.id);
    }
    
    // Auto-select first file
    if (files.length > 0) {
      await saveSelectedFileId(files[0].id);
    }
  };

  const handleFileSelect = async (fileId: string | null) => {
    await saveSelectedFileId(fileId);
    
    // Find and set the group that contains this file
    if (fileId) {
      const group = groups.find(g => g.files.some(f => f.id === fileId));
      if (group) {
        await saveSelectedGroupId(group.id);
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
            onNewTranscription={async (groupId: string) => {
              await saveSelectedGroupId(groupId);
              await saveSelectedFileId(null);
            }}
            onNewTranscriptionGeneral={async () => {
              await saveSelectedGroupId(null);
              await saveSelectedFileId(null);
            }}
            onUpdateGroupName={updateGroupName}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {!hasTranscriptions || selectedFileId === null ? (
            // Initial state - no transcriptions or new transcription
            <>
              {/* Show group header if we're adding to an existing group */}
              {selectedGroupId && selectedGroup && (
                <EditableGroupHeader 
                  group={selectedGroup}
                  onUpdateName={updateGroupName}
                />
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
                <EditableGroupHeader 
                  group={selectedGroup}
                  onUpdateName={updateGroupName}
                />
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