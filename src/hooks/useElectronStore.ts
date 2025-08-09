import { useState, useEffect, useCallback } from 'react';
import { TranscriptionGroup } from '../types';

export const useElectronStore = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [groups, setGroups] = useState<TranscriptionGroup[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

  // Load data from store on mount
  useEffect(() => {
    const loadData = async () => {
      if (!window.electronAPI) {
        setIsLoading(false);
        return;
      }

      try {
        const [groupsResult, selectedFileResult, selectedGroupResult, expandedResult] = await Promise.all([
          window.electronAPI.storeGet('groups'),
          window.electronAPI.storeGet('selectedFileId'),
          window.electronAPI.storeGet('selectedGroupId'),
          window.electronAPI.storeGet('expandedGroups')
        ]);

        if (groupsResult.success && groupsResult.data) {
          // Convert Date strings back to Date objects
          const processedGroups = groupsResult.data.map((group: any) => ({
            ...group,
            createdAt: new Date(group.createdAt),
            files: group.files.map((file: any) => ({
              ...file,
              uploadedAt: new Date(file.uploadedAt)
            }))
          }));
          setGroups(processedGroups);
        }

        if (selectedFileResult.success && selectedFileResult.data) {
          setSelectedFileId(selectedFileResult.data);
        }

        if (selectedGroupResult.success && selectedGroupResult.data) {
          setSelectedGroupId(selectedGroupResult.data);
        }

        if (expandedResult.success && expandedResult.data) {
          setExpandedGroups(expandedResult.data);
        }
      } catch (error) {
        console.error('Error loading data from store:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Save groups to store
  const saveGroups = useCallback(async (newGroups: TranscriptionGroup[]) => {
    setGroups(newGroups);
    if (window.electronAPI) {
      try {
        await window.electronAPI.storeSet('groups', newGroups);
      } catch (error) {
        console.error('Error saving groups to store:', error);
      }
    }
  }, []);

  // Save selected file ID
  const saveSelectedFileId = useCallback(async (fileId: string | null) => {
    setSelectedFileId(fileId);
    if (window.electronAPI) {
      try {
        await window.electronAPI.storeSet('selectedFileId', fileId);
      } catch (error) {
        console.error('Error saving selectedFileId to store:', error);
      }
    }
  }, []);

  // Save selected group ID
  const saveSelectedGroupId = useCallback(async (groupId: string | null) => {
    setSelectedGroupId(groupId);
    if (window.electronAPI) {
      try {
        await window.electronAPI.storeSet('selectedGroupId', groupId);
      } catch (error) {
        console.error('Error saving selectedGroupId to store:', error);
      }
    }
  }, []);

  // Save expanded groups
  const saveExpandedGroups = useCallback(async (expanded: string[]) => {
    setExpandedGroups(expanded);
    if (window.electronAPI) {
      try {
        await window.electronAPI.storeSet('expandedGroups', expanded);
      } catch (error) {
        console.error('Error saving expandedGroups to store:', error);
      }
    }
  }, []);
  // Update group name
  const updateGroupName = useCallback(async (groupId: string, newName: string) => {
    const updatedGroups = groups.map(group => 
      group.id === groupId ? { ...group, name: newName } : group
    );
    await saveGroups(updatedGroups);
  }, [groups, saveGroups]);

  // Update file name
  const updateFileName = useCallback(async (fileId: string, newName: string) => {
    const updatedGroups = groups.map(group => ({
      ...group,
      files: group.files.map(file => 
        file.id === fileId ? { ...file, name: newName } : file
      )
    }));
    await saveGroups(updatedGroups);
  }, [groups, saveGroups]);

  // Delete group
  const deleteGroup = useCallback(async (groupId: string) => {
    const updatedGroups = groups.filter(group => group.id !== groupId);
    await saveGroups(updatedGroups);
    
    // Clear selections if the deleted group was selected
    if (selectedGroupId === groupId) {
      await saveSelectedGroupId(null);
      await saveSelectedFileId(null);
    }
  }, [groups, saveGroups, selectedGroupId, saveSelectedGroupId, saveSelectedFileId]);
  // Delete file
  const deleteFile = useCallback(async (fileId: string) => {
    const fileGroup = groups.find(group => group.files.some(file => file.id === fileId));
    
    const updatedGroups = groups.map(group => ({
      ...group,
      files: group.files.filter(file => file.id !== fileId)
    })).filter(group => group.files.length > 0); // Remove grupos vazios
    
    await saveGroups(updatedGroups);
    
    // Clear file selection if the deleted file was selected
    if (selectedFileId === fileId) {
      await saveSelectedFileId(null);
    }

    // Clear group selection if the group was deleted (became empty)
    if (fileGroup) {
      const groupStillExists = updatedGroups.some(g => g.id === fileGroup.id);
      if (!groupStillExists && selectedGroupId === fileGroup.id) {
        await saveSelectedGroupId(null);
      }
    }
  }, [groups, saveGroups, selectedFileId, saveSelectedFileId, selectedGroupId, saveSelectedGroupId]);

  // Reorder groups
  const reorderGroups = useCallback(async (oldIndex: number, newIndex: number) => {
    const reorderedGroups = [...groups];
    const [removed] = reorderedGroups.splice(oldIndex, 1);
    reorderedGroups.splice(newIndex, 0, removed);
    await saveGroups(reorderedGroups);
  }, [groups, saveGroups]);

  // Reorder files within a group
  const reorderFilesInGroup = useCallback(async (groupId: string, oldIndex: number, newIndex: number) => {
    const updatedGroups = groups.map(group => {
      if (group.id === groupId) {
        const reorderedFiles = [...group.files];
        const [removed] = reorderedFiles.splice(oldIndex, 1);
        reorderedFiles.splice(newIndex, 0, removed);
        return { ...group, files: reorderedFiles };
      }
      return group;
    });
    await saveGroups(updatedGroups);
  }, [groups, saveGroups]);
  // Move file between groups
  const moveFileBetweenGroups = useCallback(async (
    fileId: string, 
    sourceGroupId: string, 
    targetGroupId: string, 
    targetIndex: number
  ) => {
    const sourceGroup = groups.find(g => g.id === sourceGroupId);
    const targetGroup = groups.find(g => g.id === targetGroupId);
    const file = sourceGroup?.files.find(f => f.id === fileId);

    if (!sourceGroup || !targetGroup || !file) return;

    const updatedGroups = groups.map(group => {
      if (group.id === sourceGroupId) {
        return { ...group, files: group.files.filter(f => f.id !== fileId) };
      } else if (group.id === targetGroupId) {
        const newFiles = [...group.files];
        newFiles.splice(targetIndex, 0, file);
        return { ...group, files: newFiles };
      }
      return group;
    }).filter(group => group.files.length > 0); // Remove grupos vazios

    await saveGroups(updatedGroups);

    // Clear selections if the source group was deleted (became empty)
    const sourceGroupStillExists = updatedGroups.some(g => g.id === sourceGroupId);
    if (!sourceGroupStillExists && selectedGroupId === sourceGroupId) {
      // Move selection to target group
      await saveSelectedGroupId(targetGroupId);
      await saveSelectedFileId(fileId);
    }
  }, [groups, saveGroups, selectedGroupId, saveSelectedGroupId, saveSelectedFileId]);

  // Clear all data
  const clearStore = useCallback(async () => {
    if (window.electronAPI) {
      try {
        await window.electronAPI.storeClear();
        setGroups([]);
        setSelectedFileId(null);
        setSelectedGroupId(null);
        setExpandedGroups([]);
      } catch (error) {
        console.error('Error clearing store:', error);
      }
    }
  }, []);
  return {
    isLoading,
    groups,
    selectedFileId,
    selectedGroupId,
    expandedGroups,
    saveGroups,
    saveSelectedFileId,
    saveSelectedGroupId,
    saveExpandedGroups,
    updateGroupName,
    updateFileName,
    reorderGroups,
    reorderFilesInGroup,
    moveFileBetweenGroups,
    clearStore,
    deleteGroup,
    deleteFile
  };
};
