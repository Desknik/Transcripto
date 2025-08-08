import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { TranscriptionFile } from '../types';

interface SortableFileProps {
  file: TranscriptionFile;
  isSelected: boolean;
  onSelect: () => void;
  getIcon: (file: TranscriptionFile) => React.ReactNode;
  getTitle: (file: TranscriptionFile) => string;
}

export const SortableFile: React.FC<SortableFileProps> = ({
  file,
  isSelected,
  onSelect,
  getIcon,
  getTitle,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: file.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getFileIcon = () => {
    return getIcon(file);
  };

  const getFileTitle = () => {
    return getTitle(file);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center"
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="p-2 cursor-grab active:cursor-grabbing hover:bg-gray-100 transition-colors rounded"
      >
        <GripVertical className="w-3 h-3 text-gray-400" />
      </div>

      {/* File Button */}
      <button
        onClick={onSelect}
        className={`flex-1 p-3 pl-2 text-left hover:bg-gray-50 transition-colors border-l-2 ${
          isSelected
            ? "bg-blue-50 border-l-blue-500"
            : "border-l-transparent hover:border-l-gray-200"
        }`}
      >
        <div className="flex items-start space-x-3">
          {getFileIcon()}
          <div className="flex-1 min-w-0">
            <h5 className="font-medium text-gray-900 text-sm leading-tight">
              {getFileTitle()}
            </h5>
          </div>
        </div>
      </button>
    </div>
  );
};
