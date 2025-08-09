import React, { useState } from "react";
import { Plus, FileText, Mic, VideoIcon } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { TranscriptionGroup, TranscriptionFile } from "../types";
import { SortableGroup } from "./SortableGroup";
import { SortableFile } from "./SortableFile";

interface SidebarProps {
  groups: TranscriptionGroup[];
  selectedFileId: string | null;
  selectedGroupId: string | null;
  onFileSelect: (fileId: string | null) => void;
  onNewTranscription: (groupId: string) => void;
  onNewTranscriptionGeneral: () => void;
  onUpdateGroupName: (groupId: string, newName: string) => void;
  onReorderGroups: (oldIndex: number, newIndex: number) => void;
  onReorderFilesInGroup: (groupId: string, oldIndex: number, newIndex: number) => void;
  onMoveFileBetweenGroups: (fileId: string, sourceGroupId: string, targetGroupId: string, targetIndex: number) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  groups,
  selectedFileId,
  selectedGroupId,
  onFileSelect,
  onNewTranscription,
  onNewTranscriptionGeneral,
  onUpdateGroupName,
  onReorderGroups,
  onReorderFilesInGroup,
  onMoveFileBetweenGroups,
}) => {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Auto-expand selected group
  React.useEffect(() => {
    if (selectedGroupId && !expandedGroups.has(selectedGroupId)) {
      setExpandedGroups(prev => new Set([...prev, selectedGroupId]));
    }
  }, [selectedGroupId, expandedGroups]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Check if we're dragging a group
    const isGroupDrag = groups.some(group => group.id === activeId);
    
    if (isGroupDrag) {
      // Reordering groups
      const oldIndex = groups.findIndex(group => group.id === activeId);
      const newIndex = groups.findIndex(group => group.id === overId);
      
      if (oldIndex !== newIndex) {
        onReorderGroups(oldIndex, newIndex);
      }
    } else {
      // Reordering files within a group or between groups
      const sourceGroup = groups.find(group => 
        group.files.some(file => file.id === activeId)
      );
      
      if (!sourceGroup) return;

      // Check if we're dropping on a file (same group reorder) or group (move between groups)
      const targetGroup = groups.find(group => group.id === overId) ||
                          groups.find(group => group.files.some(file => file.id === overId));
      
      if (!targetGroup) return;

      if (sourceGroup.id === targetGroup.id) {
        // Reordering within same group
        const oldIndex = sourceGroup.files.findIndex(file => file.id === activeId);
        const newIndex = targetGroup.files.findIndex(file => file.id === overId);
        
        if (oldIndex !== newIndex) {
          onReorderFilesInGroup(sourceGroup.id, oldIndex, newIndex);
        }
      } else {
        // Moving between groups
        const targetIndex = targetGroup.files.findIndex(file => file.id === overId);
        const finalIndex = targetIndex >= 0 ? targetIndex : targetGroup.files.length;
        
        onMoveFileBetweenGroups(activeId, sourceGroup.id, targetGroup.id, finalIndex);
      }    }  };
    const getFileIcon = (file: TranscriptionFile) => {
    if (file.type.includes('audio')) {
      return <Mic className="w-4 h-4 text-blue-500" />;
    }
    if (file.type.includes('video')) {
      return <VideoIcon className="w-4 h-4 text-purple-500" />;
    }
    return <FileText className="w-4 h-4 text-gray-500" />;
  };

  const getFileTitle = (file: TranscriptionFile) => {
    return file.name || `Transcrição ${file.id}`;
  };

  if (groups.length === 0) {
    return null;
  }
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="w-80 bg-gray-50 border-r border-gray-200 h-full overflow-y-auto">
        <div className="p-4 border-b border-gray-200 bg-white">
          <h2 className="text-lg font-semibold text-gray-900">Transcrições</h2>
          <p className="text-sm text-gray-600 mt-1">
            {groups.reduce((acc, group) => acc + group.files.length, 0)}{" "}
            arquivo(s)
          </p>
          <button
            onClick={() => onNewTranscriptionGeneral()}
            className="mt-3 w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2.5 rounded-lg font-medium transition-all duration-200 text-sm shadow-sm hover:shadow-md flex items-center justify-center space-x-2 group"
          >
            <div className="w-4 h-4 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
              <Plus className="w-2.5 h-2.5" />
            </div>
            <span>Nova Transcrição</span>
          </button>
        </div>

        <div className="p-4">
          <SortableContext
            items={groups.map(group => group.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {groups.map((group) => (                <SortableGroup
                  key={group.id}
                  group={group}
                  isExpanded={expandedGroups.has(group.id)}
                  onToggle={() => toggleGroup(group.id)}
                  onUpdateName={onUpdateGroupName}
                  onNewTranscription={onNewTranscription}
                >
                  <SortableContext
                    items={group.files.map(file => file.id)}
                    strategy={verticalListSortingStrategy}
                  >                    {group.files.map((file) => (
                      <SortableFile
                        key={file.id}
                        file={file}
                        isSelected={selectedFileId === file.id}
                        onSelect={() => onFileSelect(file.id)}
                        getIcon={getFileIcon}
                        getTitle={getFileTitle}
                      />
                    ))}
                  </SortableContext>
                </SortableGroup>
              ))}
            </div>
          </SortableContext>
        </div>
      </div>
    </DndContext>
  );
};

export default Sidebar;
