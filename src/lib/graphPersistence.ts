export const GRAPH_STORAGE_KEY = 'graph-editor-text';
export const GRAPH_STATE_KEY = 'graph-editor-state';

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

export function saveGraphState(graph: any): void {
  try {
    const data = {
      graph,
      lastModified: new Date().toISOString(),
      version: 1
    };
    localStorage.setItem(GRAPH_STATE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save graph state:', error);
  }
}

export function loadGraphState(): any | null {
  try {
    const stored = localStorage.getItem(GRAPH_STATE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      return data.graph || null;
    }
  } catch (error) {
    console.error('Failed to load graph state:', error);
  }
  return null;
}

export function clearGraphState(): void {
  localStorage.removeItem(GRAPH_STATE_KEY);
}