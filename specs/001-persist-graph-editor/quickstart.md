# Quickstart: Persist Graph Editor Text

**Feature**: 001-persist-graph-editor  
**Date**: Thu Dec 04 2025  
**Estimated Time**: 2-3 hours

## Overview

Add automatic persistence to the GraphTextEditor component so user text is saved and restored across browser sessions.

## Prerequisites

- Existing GraphTextEditor component in `src/components/controls/GraphTextEditor.tsx`
- Basic understanding of React hooks and localStorage

## Implementation Steps

### 1. Create Persistence Hook (30 min)

Create `src/hooks/useGraphPersistence.ts`:

```typescript
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
```

### 2. Create Persistence Utility (15 min)

Create `src/lib/graphPersistence.ts`:

```typescript
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
```

### 3. Update GraphTextEditor Component (45 min)

Modify `src/components/controls/GraphTextEditor.tsx`:

```typescript
import { useState, useEffect } from 'react';
import { loadGraphText, saveGraphText } from '../../lib/graphPersistence';

export function GraphTextEditor({ initialValue = '', onChange, ...props }) {
  const [value, setValue] = useState(initialValue);

  // Load persisted value on mount
  useEffect(() => {
    const persisted = loadGraphText();
    if (persisted && !initialValue) {
      setValue(persisted);
      onChange?.(persisted);
    }
  }, [initialValue, onChange]);

  // Auto-save on changes (debounced)
  useEffect(() => {
    if (!value) return;

    const timer = setTimeout(() => {
      saveGraphText(value);
    }, 500);

    return () => clearTimeout(timer);
  }, [value]);

  const handleChange = (newValue: string) => {
    setValue(newValue);
    onChange?.(newValue);
  };

  // ... rest of component
}
```

### 4. Add Tests (30 min)

Create `test/lib/graphPersistence.test.ts`:

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { saveGraphText, loadGraphText, clearGraphText, GRAPH_STORAGE_KEY } from '../../src/lib/graphPersistence';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('graphPersistence', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    clearGraphText();
  });

  it('saves graph text to localStorage', () => {
    const testText = 'node A -> node B';
    saveGraphText(testText);

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      GRAPH_STORAGE_KEY,
      expect.stringContaining(testText)
    );
  });

  it('loads graph text from localStorage', () => {
    const testText = 'node A -> node B';
    const mockData = JSON.stringify({
      content: testText,
      lastModified: new Date().toISOString(),
      version: 1
    });

    localStorageMock.getItem.mockReturnValue(mockData);

    const loaded = loadGraphText();
    expect(loaded).toBe(testText);
  });

  it('handles localStorage errors gracefully', () => {
    localStorageMock.getItem.mockImplementation(() => {
      throw new Error('Storage quota exceeded');
    });

    expect(() => loadGraphText()).not.toThrow();
    expect(loadGraphText()).toBeNull();
  });
});
```

## Testing

Run tests:
```bash
npm test
```

Manual testing:
1. Open graph editor
2. Enter some text
3. Refresh the page
4. Verify text is restored

## Edge Cases Handled

- localStorage unavailable (private browsing)
- JSON parsing errors
- Storage quota exceeded
- Empty content not saved
- Component unmounting during save

## Next Steps

After implementation, run integration tests and update component documentation.