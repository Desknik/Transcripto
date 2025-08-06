import { useState, useEffect, useCallback } from 'react';
import { TranscriptionGroup } from '../types';

interface StoreData {
  groups: TranscriptionGroup[];
  selectedFileId: string | null;
  selectedGroupId: string | null;
  expandedGroups: string[];
}

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
    clearStore
  };
};
