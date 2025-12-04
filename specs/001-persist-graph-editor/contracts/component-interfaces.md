# Component Interface: GraphTextEditor with Persistence

**Feature**: 001-persist-graph-editor  
**Date**: Thu Dec 04 2025  
**Contract Type**: Component Interface

## Overview

This contract defines the interface for the GraphTextEditor component with integrated persistence functionality. The component must automatically save and restore text content while maintaining the existing editor behavior.

## Interface Definition

### Props

```typescript
interface GraphTextEditorProps {
  // Existing props (unchanged)
  initialValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  // New optional props for persistence
  autoSave?: boolean; // default: true
  storageKey?: string; // default: 'graph-editor-text'
}
```

### Component Behavior

**Mounting**:
- Load persisted content from localStorage if available
- Use initialValue prop if no persisted content exists
- Set loaded content as current editor value

**Text Changes**:
- Auto-save to localStorage on every change (debounced, 500ms)
- Update lastModified timestamp
- Maintain existing onChange callback behavior

**Unmounting**:
- Final save to localStorage
- Clean up any timers/listeners

### Hook Interface (useGraphPersistence)

For reusable persistence logic:

```typescript
interface UseGraphPersistenceOptions {
  key: string;
  autoSave?: boolean;
  debounceMs?: number;
}

interface UseGraphPersistenceReturn {
  savedValue: string | null;
  saveValue: (value: string) => void;
  clearValue: () => void;
  lastModified: Date | null;
}

// Usage
const { savedValue, saveValue } = useGraphPersistence({
  key: 'graph-editor-text',
  autoSave: true,
  debounceMs: 500
});
```

## Error Handling

- If localStorage is unavailable (private browsing), disable persistence silently
- If quota exceeded, show user-friendly warning but continue operation
- If JSON parsing fails, fall back to empty state

## Testing Contracts

**Unit Tests**:
- Persistence hook saves/loads correctly
- Debouncing works as expected
- Error conditions handled gracefully

**Integration Tests**:
- Component loads persisted value on mount
- Changes are auto-saved
- Persistence survives page refresh