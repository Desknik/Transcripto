import React, { useState, useRef, useEffect } from 'react';
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
    <div className="flex-1">
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          className="text-sm font-medium text-gray-900 bg-transparent border-b border-blue-500 outline-none w-full"
          placeholder="Nome do grupo"
        />
      ) : (
        <span 
          className="text-sm font-medium text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
          onClick={handleClick}
          title="Clique para editar o nome"
        >
          {group.name}
        </span>
      )}
    </div>
  );
};

export default EditableGroupHeader;
