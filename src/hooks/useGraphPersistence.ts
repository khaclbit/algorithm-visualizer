import { useState, useEffect } from 'react';

interface GraphData {
  content: string;
  lastModified: Date;
  version?: number;
}

export function useGraphPersistence(storageKey: string = 'graph-editor-text') {
  const [savedData, setSavedData] = useState<GraphData | null>(null);

  // Load on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSavedData({
          ...parsed,
          lastModified: new Date(parsed.lastModified)
        });
      }
    } catch (error) {
      console.warn('Failed to load persisted graph data:', error);
    }
  }, [storageKey]);

  // Save function
  const saveData = (content: string) => {
    const data: GraphData = {
      content,
      lastModified: new Date(),
      version: (savedData?.version || 0) + 1
    };

    try {
      localStorage.setItem(storageKey, JSON.stringify(data));
      setSavedData(data);
    } catch (error) {
      console.warn('Failed to save graph data:', error);
    }
  };

  return {
    savedData,
    saveData,
    clearData: () => {
      localStorage.removeItem(storageKey);
      setSavedData(null);
    }
  };
}