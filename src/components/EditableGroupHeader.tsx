import React, { useState, useRef, useEffect } from 'react';
import { Mic } from 'lucide-react';
import { TranscriptionGroup } from '../types';

interface EditableGroupHeaderProps {
  group: TranscriptionGroup;
  onUpdateName: (groupId: string, newName: string) => void;
}

const EditableGroupHeader: React.FC<EditableGroupHeaderProps> = ({ group, onUpdateName }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(group.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSubmit = () => {
    if (editValue.trim() && editValue.trim() !== group.name) {
      onUpdateName(group.id, editValue.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    } else if (e.key === 'Escape') {
      setEditValue(group.name);
      setIsEditing(false);
    }
  };

  const handleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    handleSubmit();
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <Mic className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleBlur}
              className="text-xl font-bold text-gray-900 bg-transparent border-b border-blue-500 outline-none w-full max-w-md"
              placeholder="Nome do grupo"
            />
          ) : (
            <h1 
              className="text-xl font-bold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
              onClick={handleClick}
              title="Clique para editar o nome"
            >
              {group.name}
            </h1>
          )}
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
  );
};

export default EditableGroupHeader;
