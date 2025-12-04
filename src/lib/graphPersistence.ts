export const GRAPH_STORAGE_KEY = 'graph-editor-text';

export function saveGraphText(content: string): void {
  if (!content.trim()) return; // Don't save empty content

  try {
    const data = {
      content,
      lastModified: new Date().toISOString(),
      version: 1
    };
    localStorage.setItem(GRAPH_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save graph text:', error);
  }
}

export function loadGraphText(): string | null {
  try {
    const stored = localStorage.getItem(GRAPH_STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      return data.content || null;
    }
  } catch (error) {
    console.error('Failed to load graph text:', error);
  }
  return null;
}

export function clearGraphText(): void {
  localStorage.removeItem(GRAPH_STORAGE_KEY);
}