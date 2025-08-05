import React, { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  FileAudio,
  FileVideo,
  Calendar,
} from "lucide-react";
import { TranscriptionGroup, TranscriptionFile } from "../types";

interface SidebarProps {
  groups: TranscriptionGroup[];
  selectedFileId: string | null;
  onFileSelect: (fileId: string | null) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  groups,
  selectedFileId,
  onFileSelect,
}) => {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
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
        </p>
        <button
          onClick={() => onFileSelect(null)}
          className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
        >
          Nova Transcrição
        </button>
      </div>

      <div className="p-4">
        <div className="space-y-3">
          {groups.map((group) => (
            <div
              key={group.id}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden"
            >
              {group.files.length === 1 ? (
                // Single file - direct item
                <button
                  onClick={() => onFileSelect(group.files[0].id)}
                  className={`w-full p-3 text-left hover:bg-gray-50 transition-colors ${
                    selectedFileId === group.files[0].id
                      ? "bg-blue-50 border-l-4 border-l-blue-500"
                      : ""
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {getFileIcon(group.files[0])}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 text-sm leading-tight">
                        {getFileTitle(group.files[0])}
                      </h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-gray-500">
                          {formatDate(group.files[0].uploadedAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ) : (
                // Multiple files - grouped
                <>
                  <button
                    onClick={() => toggleGroup(group.id)}
                    className="w-full p-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
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
                  </button>

                  {expandedGroups.has(group.id) && (
                    <div className="border-t border-gray-100">
                      {group.files.map((file) => (
                        <button
                          key={file.id}
                          onClick={() => onFileSelect(file.id)}
                          className={`w-full p-3 pl-10 text-left hover:bg-gray-50 transition-colors border-l-2 ${
                            selectedFileId === file.id
                              ? "bg-blue-50 border-l-blue-500"
                              : "border-l-transparent"
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
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
