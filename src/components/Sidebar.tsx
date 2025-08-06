import React, { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  FileAudio,
  FileVideo,
  Calendar,
  Plus,
} from "lucide-react";
import { TranscriptionGroup, TranscriptionFile } from "../types";

interface SidebarProps {
  groups: TranscriptionGroup[];
  selectedFileId: string | null;
  selectedGroupId: string | null;
  onFileSelect: (fileId: string | null) => void;
  onNewTranscription: (groupId: string) => void;
  onNewTranscriptionGeneral: () => void;
  onUpdateGroupName: (groupId: string, newName: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  groups,
  selectedFileId,
  selectedGroupId,
  onFileSelect,
  onNewTranscription,
  onNewTranscriptionGeneral,
  onUpdateGroupName,
}) => {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Auto-expand selected group
  React.useEffect(() => {
    if (selectedGroupId && !expandedGroups.has(selectedGroupId)) {
      setExpandedGroups(prev => new Set([...prev, selectedGroupId]));
    }
  }, [selectedGroupId, expandedGroups]);

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

  const getFileIcon = (file: TranscriptionFile) => {
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (["mp4", "mov", "avi", "mkv"].includes(extension || "")) {
      return <FileVideo className="w-4 h-4 text-blue-500 flex-shrink-0" />;
    }
    return <FileAudio className="w-4 h-4 text-emerald-500 flex-shrink-0" />;
  };

  const getFileTitle = (file: TranscriptionFile) => {
    const words = file.content.split(" ").slice(0, 8).join(" ");
    return words.length > 50 ? words.substring(0, 50) + "..." : words;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  if (groups.length === 0) {
    return null;
  }

  return (
    <div className="w-80 bg-gray-50 border-r border-gray-200 h-full overflow-y-auto">
      <div className="p-4 border-b border-gray-200 bg-white">
        <h2 className="text-lg font-semibold text-gray-900">Transcrições</h2>
        <p className="text-sm text-gray-600 mt-1">
          {groups.reduce((acc, group) => acc + group.files.length, 0)}{" "}
          arquivo(s)
        </p>        <button
          onClick={() => onNewTranscriptionGeneral()}
          className="mt-3 w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2.5 rounded-lg font-medium transition-all duration-200 text-sm shadow-sm hover:shadow-md flex items-center justify-center space-x-2 group"
        >
          <div className="w-4 h-4 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
            <Plus className="w-2.5 h-2.5" />
          </div>
          <span>Nova Transcrição</span>
        </button>
      </div>

      <div className="p-4">        <div className="space-y-3">
          {groups.map((group) => (
            <div
              key={group.id}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden"
            >
              {/* Always show group header */}              <button
                onClick={() => toggleGroup(group.id)}
                className={`w-full p-3 flex items-center justify-between hover:bg-gray-50 transition-colors ${
                  selectedGroupId === group.id ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <div className="text-left">
                    <h4 className="font-medium text-gray-900 text-sm">
                      {group.name}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {group.files.length} arquivo(s) •{" "}
                      {formatDate(group.createdAt)}
                    </p>
                  </div>
                </div>
                {expandedGroups.has(group.id) ? (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
              </button>              {expandedGroups.has(group.id) && (
                <div className="border-t border-gray-100 p-3">
                  {/* Nova Transcrição Button */}
                  <button
                    onClick={() => onNewTranscription(group.id)}
                    className="w-full p-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 hover:border-blue-300 rounded-lg transition-all duration-200 flex items-center space-x-3 text-blue-600 group/button mb-3"
                  >
                    <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center group-hover/button:bg-blue-300 transition-colors">
                      <Plus className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-medium text-sm group-hover/button:text-blue-700 transition-colors">Nova Transcrição</span>
                  </button>                  
                  {/* Files */}
                  {group.files.map((file) => (
                    <button
                      key={file.id}
                      onClick={() => onFileSelect(file.id)}
                      className={`w-full p-3 pl-6 text-left hover:bg-gray-50 transition-colors border-l-2 ${
                        selectedFileId === file.id
                          ? "bg-blue-50 border-l-blue-500"
                          : "border-l-transparent hover:border-l-gray-200"
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        {getFileIcon(file)}
                        <div className="flex-1 min-w-0">
                          <h5 className="font-medium text-gray-900 text-sm leading-tight">
                            {getFileTitle(file)}
                          </h5>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs text-gray-500">
                              {formatDate(file.uploadedAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
