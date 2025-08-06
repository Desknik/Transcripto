import React from 'react';
import { Calendar, FileText, Folder } from 'lucide-react';
import { TranscriptionGroup } from '../types';
import EditableGroupHeader from './EditableGroupHeader';

interface GroupHeaderProps {
  group: TranscriptionGroup;
  onUpdateName: (groupId: string, newName: string) => void;
}

const GroupHeader: React.FC<GroupHeaderProps> = ({ group, onUpdateName }) => {
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
        </div>
      </div>
    </div>
  );
};

export default GroupHeader;
