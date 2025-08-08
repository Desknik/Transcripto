import React, { useState, useRef, useEffect } from 'react';
import { TranscriptionFile } from '../types';

interface EditableFileNameProps {
  file: TranscriptionFile;
  onUpdateName: (fileId: string, newName: string) => void;
}

const EditableFileName: React.FC<EditableFileNameProps> = ({ file, onUpdateName }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(file.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSubmit = () => {
    if (editValue.trim() && editValue.trim() !== file.name) {
      onUpdateName(file.id, editValue.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    } else if (e.key === 'Escape') {
      setEditValue(file.name);
      setIsEditing(false);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evita que o click selecione o arquivo
    setIsEditing(true);
  };

  const handleBlur = () => {
    handleSubmit();
  };
  return (
    <div className="flex-1 min-w-0">
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          className="text-xl font-semibold text-gray-900 bg-transparent border-b border-blue-500 outline-none w-full truncate"
          placeholder="Nome do arquivo"
        />
      ) : (
        <h2 
          className="text-xl font-semibold text-gray-900 truncate cursor-pointer hover:text-blue-600 transition-colors"
          onClick={handleClick}
          title="Clique para editar o nome"
        >
          {file.name}
        </h2>
      )}
    </div>
  );
};

export default EditableFileName;
