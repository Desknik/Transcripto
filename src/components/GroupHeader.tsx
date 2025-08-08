import React, { useState } from 'react';
import { Calendar, FileText, Folder, Copy, Check, Trash2 } from 'lucide-react';
import { TranscriptionGroup } from '../types';
import EditableGroupHeader from './EditableGroupHeader';
import ConfirmationModal from './ConfirmationModal';

interface GroupHeaderProps {
  group: TranscriptionGroup;
  onUpdateName: (groupId: string, newName: string) => void;
  onDeleteGroup?: (groupId: string) => void;
}

const GroupHeader: React.FC<GroupHeaderProps> = ({ group, onUpdateName, onDeleteGroup }) => {
  const [copiedAll, setCopiedAll] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const copyAllTranscriptions = async () => {
    try {
      // Ordena os arquivos pela ordem que aparecem no grupo e concatena as transcrições
      const allTranscriptions = group.files
        .map((file, index) => `=== Transcrição ${index + 1}: ${file.name} ===\n\n${file.content}`)
        .join('\n\n---\n\n');
      
      await navigator.clipboard.writeText(allTranscriptions);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    } catch (err) {
      console.error('Erro ao copiar todas as transcrições:', err);
    }
  };
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  return (
    <div className="bg-white border-b border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Folder className="w-6 h-6 text-blue-600" />
          </div>
          
          <div>
            <EditableGroupHeader 
              group={group}
              onUpdateName={onUpdateName}
            />
            
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <FileText className="w-4 h-4" />
                <span>{group.files.length} arquivo(s)</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>Criado em {formatDate(group.createdAt)}</span>
              </div>
              
              <span>•</span>
              <span>{formatTime(group.createdAt)}</span>
            </div>
          </div>
        </div>        {/* Botão Copiar Todas as Transcrições */}
        <div className="flex items-center space-x-2">
          <button
            onClick={copyAllTranscriptions}
            className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              copiedAll 
                ? 'text-green-700 bg-green-50 border border-green-200' 
                : 'text-gray-700 bg-gray-50 border border-gray-200 hover:bg-gray-100'
            }`}
          >
            {copiedAll ? (
              <>
                <Check className="w-4 h-4" />
                <span>Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copiar Todas</span>
              </>
            )}
          </button>

          {/* Botão Excluir Grupo */}
          {onDeleteGroup && (
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
              title="Excluir grupo"
            >
              <Trash2 className="w-4 h-4" />
              <span>Excluir</span>
            </button>
          )}
        </div>
      </div>

      {/* Modal de Confirmação */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => onDeleteGroup && onDeleteGroup(group.id)}
        title="Excluir Grupo"
        message={`Tem certeza que deseja excluir o grupo "${group.name}" e todas as suas transcrições? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  );
};

export default GroupHeader;
