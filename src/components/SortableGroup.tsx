import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { TranscriptionGroup } from '../types';
import EditableGroupHeader from './EditableGroupHeader';

interface SortableGroupProps {
  group: TranscriptionGroup;
  isExpanded: boolean;
  onToggle: () => void;
  onUpdateName: (groupId: string, newName: string) => void;
  onNewTranscription: (groupId: string) => void;
  children: React.ReactNode;
}

export const SortableGroup: React.FC<SortableGroupProps> = ({
  group,
  isExpanded,
  onToggle,
  onUpdateName,
  onNewTranscription,
  children,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: group.id });  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const style: any = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="mb-2"
    >
      {/* Compact Group Header */}
      <div className="flex items-center bg-gray-100 rounded-md hover:bg-gray-200 transition-colors">
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="p-1.5 cursor-grab active:cursor-grabbing hover:bg-gray-300 rounded-l-md transition-colors"
        >
          <GripVertical className="w-3 h-3 text-gray-500" />
        </div>

        {/* Group Info */}
        <button
          onClick={onToggle}
          className="flex-1 px-2 py-1.5 text-left flex items-center justify-between"
        >
          <div className="flex items-center space-x-2">
            <EditableGroupHeader
              group={group}
              onUpdateName={onUpdateName}
            />
            <span className="text-xs text-gray-500 font-medium">
              ({group.files.length})
            </span>
          </div>
          
          {isExpanded ? (
            <ChevronDown className="w-3 h-3 text-gray-500" />
          ) : (
            <ChevronRight className="w-3 h-3 text-gray-500" />
          )}
        </button>

        {/* Add Button - sempre visível */}
        <button
          onClick={() => onNewTranscription(group.id)}
          className="p-1.5 hover:bg-blue-200 text-blue-600 rounded-r-md transition-colors"
          title="Nova Transcrição"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>

      {/* Files - quando expandido */}
      {isExpanded && (
        <div className="ml-6 mt-1 space-y-0.5">
          {children}
        </div>
      )}
    </div>
  );
};
