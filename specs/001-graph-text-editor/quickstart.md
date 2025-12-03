# Quickstart: Graph Text Editor Implementation

**Feature**: Graph Text Editor (001-graph-text-editor)  
**Date**: December 4, 2025  
**Prerequisites**: React 18.3.1, TypeScript 5.8.3, Vite build system

This guide provides step-by-step instructions for implementing the Graph Text Editor feature in the existing algorithm visualizer.

## Phase 1: Core Parser Implementation

### Step 1: Install Dependencies

```bash
# Core dependencies for graph layout
npm install d3-force

# Testing dependencies
npm install -D vitest @vitest/ui jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

### Step 2: Create Text Parser Module

Create `src/lib/textParser.ts`:

```typescript
import { GraphModel, NodeModel, EdgeModel } from '@/models/graph';

export interface ParsedGraph {
  vertices: Set<string>;
  edgeDefinitions: EdgeDefinition[];
  adjacencyMap: Map<string, string[]>;
  metadata: ParseMetadata;
}

export interface EdgeDefinition {
  sourceVertex: string;
  targetVertex: string;
  weight: number;
  lineNumber: number;
  rawText: string;
}

export class GraphTextParser {
  parse(text: string): ParseResult {
    const lines = text.split('\n').map((line, index) => ({
      content: line.trim(),
      number: index + 1
    }));
    
    const edges: EdgeDefinition[] = [];
    const errors: ValidationError[] = [];
    const vertices = new Set<string>();
    
    for (const line of lines) {
      if (!line.content) continue; // Skip empty lines
      
      const match = line.content.match(/^(\w+)\s+(\w+)\s+([\d.]+)$/);
      if (!match) {
        errors.push({
          type: 'format_error',
          lineNumber: line.number,
          message: 'Invalid format. Expected: vertex1 vertex2 weight',
          suggestion: 'Use format: A B 5'
        });
        continue;
      }
      
      const [, source, target, weightStr] = match;
      const weight = parseFloat(weightStr);
      
      if (weight <= 0 || !isFinite(weight)) {
        errors.push({
          type: 'weight_invalid',
          lineNumber: line.number,
          message: 'Weight must be a positive number',
          suggestion: `Use positive number instead of ${weightStr}`
        });
        continue;
      }
      
      vertices.add(source);
      vertices.add(target);
      
      edges.push({
        sourceVertex: source,
        targetVertex: target,
        weight,
        lineNumber: line.number,
        rawText: line.content
      });
    }
    
    return {
      success: errors.length === 0,
      graph: {
        vertices,
        edgeDefinitions: edges,
        adjacencyMap: this.buildAdjacencyMap(edges),
        metadata: {
          parseTime: 0, // Add performance timing
          vertexCount: vertices.size,
          edgeCount: edges.length,
          errorCount: errors.length
        }
      },
      errors
    };
  }
  
  private buildAdjacencyMap(edges: EdgeDefinition[]): Map<string, string[]> {
    const map = new Map<string, string[]>();
    for (const edge of edges) {
      if (!map.has(edge.sourceVertex)) map.set(edge.sourceVertex, []);
      if (!map.has(edge.targetVertex)) map.set(edge.targetVertex, []);
      map.get(edge.sourceVertex)!.push(edge.targetVertex);
      map.get(edge.targetVertex)!.push(edge.sourceVertex); // Undirected
    }
    return map;
  }
}
```

### Step 3: Create Graph Serializer

Create `src/lib/graphSerializer.ts`:

```typescript
export class GraphSerializer {
  serialize(graph: GraphModel, options?: SerializeOptions): string {
    const sortedEdges = [...graph.edges].sort((a, b) => {
      if (a.from !== b.from) return a.from.localeCompare(b.from);
      return a.to.localeCompare(b.to);
    });
    
    return sortedEdges
      .map(edge => `${edge.from} ${edge.to} ${edge.weight}`)
      .join('\n');
  }
  
  extractEdgeDefinitions(graph: GraphModel): EdgeDefinition[] {
    return graph.edges.map(edge => ({
      sourceVertex: edge.from,
      targetVertex: edge.to,
      weight: edge.weight,
      lineNumber: 0, // Will be updated during sync
      rawText: `${edge.from} ${edge.to} ${edge.weight}`
    }));
  }
}
```

## Phase 2: React Integration

### Step 4: Create Synchronization Hook

Create `src/hooks/useGraphTextSync.ts`:

```typescript
import { useState, useCallback, useMemo } from 'react';
import { useGraph } from '@/context/GraphContext';
import { GraphTextParser } from '@/lib/textParser';
import { GraphSerializer } from '@/lib/graphSerializer';

export const useGraphTextSync = (initialText = '') => {
  const { graph, setGraph } = useGraph();
  const [text, setText] = useState(initialText);
  const [isTextDirty, setIsTextDirty] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const parser = useMemo(() => new GraphTextParser(), []);
  const serializer = useMemo(() => new GraphSerializer(), []);
  
  const syncTextToGraph = useCallback(async (newText: string) => {
    setIsSyncing(true);
    
    const parseResult = parser.parse(newText);
    if (parseResult.success && parseResult.graph) {
      // Convert ParsedGraph to GraphModel
      const nodes = Array.from(parseResult.graph.vertices).map(vertexId => ({
        id: vertexId,
        label: vertexId,
        x: Math.random() * 500 + 100, // Temporary positioning
        y: Math.random() * 300 + 100,
        fromText: true
      }));
      
      const edges = parseResult.graph.edgeDefinitions.map(def => ({
        id: `e-${def.sourceVertex}-${def.targetVertex}-${Date.now()}`,
        from: def.sourceVertex,
        to: def.targetVertex,
        weight: def.weight,
        fromText: true,
        lineNumber: def.lineNumber
      }));
      
      setGraph({
        nodes,
        edges,
        directed: false,
        textRepresentation: {
          content: newText,
          lines: newText.split('\n'),
          lastModified: new Date(),
          isValid: true,
          errors: []
        }
      });
      
      setIsTextDirty(false);
    }
    
    setIsSyncing(false);
    return parseResult;
  }, [parser, setGraph]);
  
  const syncGraphToText = useCallback(() => {
    const newText = serializer.serialize(graph);
    setText(newText);
    setIsTextDirty(false);
  }, [graph, serializer]);
  
  const handleTextChange = useCallback((newText: string) => {
    setText(newText);
    setIsTextDirty(true);
  }, []);
  
  return {
    text,
    setText: handleTextChange,
    syncTextToGraph,
    syncGraphToText,
    isTextDirty,
    isSyncing
  };
};
```

### Step 5: Create Graph Text Editor Component

Create `src/components/controls/GraphTextEditor.tsx`:

```typescript
import React, { useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useGraphTextSync } from '@/hooks/useGraphTextSync';
import { useDeferredValue } from 'react';

export const GraphTextEditor = () => {
  const {
    text,
    setText,
    syncTextToGraph,
    syncGraphToText,
    isTextDirty,
    isSyncing
  } = useGraphTextSync();
  
  const deferredText = useDeferredValue(text);
  
  const handleSync = useCallback(async () => {
    if (isTextDirty) {
      await syncTextToGraph(text);
    }
  }, [text, isTextDirty, syncTextToGraph]);
  
  const handleUpdateFromGraph = useCallback(() => {
    syncGraphToText();
  }, [syncGraphToText]);
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Graph Text Editor</h3>
        <div className="space-x-2">
          <Button 
            onClick={handleSync} 
            disabled={!isTextDirty || isSyncing}
            variant="outline"
          >
            {isSyncing ? 'Syncing...' : 'Update Graph'}
          </Button>
          <Button 
            onClick={handleUpdateFromGraph}
            variant="outline"
          >
            Update Text
          </Button>
        </div>
      </div>
      
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter graph edges (format: vertex1 vertex2 weight)&#10;Example:&#10;A B 5&#10;B C 3&#10;A C 7"
        className="min-h-[300px] font-mono"
        disabled={isSyncing}
      />
      
      {isTextDirty && (
        <Alert>
          <AlertDescription>
            Text has been modified. Click "Update Graph" to apply changes.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
```

## Phase 3: Integration with Existing UI

### Step 6: Enhance TextEditorModal

Update `src/components/controls/TextEditorModal.tsx`:

```typescript
// Add to existing imports
import { GraphTextEditor } from './GraphTextEditor';

// Add new prop to interface
interface TextEditorModalProps {
  // ... existing props
  mode?: 'text' | 'graph'; // Add mode selection
}

// Update component to include graph editing
export function TextEditorModal({
  isOpen,
  onClose,
  initialContent = "",
  onContentChange,
  title = "Text Editor",
  mode = 'text' // Default to regular text mode
}: TextEditorModalProps) {
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        {mode === 'graph' ? (
          <GraphTextEditor />
        ) : (
          // Existing text editor implementation
          <>
            <Textarea
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder="Enter text here..."
              className="min-h-[300px] resize-none"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleClose}>
                Close
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
```

### Step 7: Add to Toolbar

Update `src/components/controls/Toolbar.tsx` to include graph text editor:

```typescript
// Add button to toolbar
<Button
  onClick={() => setIsGraphTextEditorOpen(true)}
  variant="outline"
  size="sm"
>
  Text Editor
</Button>

// Add modal state and component
<TextEditorModal
  isOpen={isGraphTextEditorOpen}
  onClose={() => setIsGraphTextEditorOpen(false)}
  title="Graph Text Editor"
  mode="graph"
/>
```

## Phase 4: Testing Setup

### Step 8: Configure Vitest

Add to `vite.config.ts`:

```typescript
/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/setupTests.ts'],
  },
})
```

### Step 9: Create Basic Tests

Create `src/lib/__tests__/textParser.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { GraphTextParser } from '../textParser';

describe('GraphTextParser', () => {
  const parser = new GraphTextParser();
  
  it('parses valid graph text', () => {
    const text = 'A B 5\nB C 3\nA C 7';
    const result = parser.parse(text);
    
    expect(result.success).toBe(true);
    expect(result.graph?.vertices.size).toBe(3);
    expect(result.graph?.edgeDefinitions.length).toBe(3);
  });
  
  it('handles invalid format', () => {
    const text = 'invalid line\nA B 5';
    const result = parser.parse(text);
    
    expect(result.success).toBe(false);
    expect(result.errors.length).toBe(1);
    expect(result.errors[0].type).toBe('format_error');
  });
});
```

## Quick Start Commands

```bash
# Install dependencies
npm install d3-force
npm install -D vitest @vitest/ui jsdom @testing-library/react @testing-library/jest-dom

# Run tests
npm run test

# Run development server
npm run dev
```

## Next Steps

1. Implement D3-force layout integration for automatic node positioning
2. Add real-time validation with syntax highlighting
3. Implement undo/redo functionality
4. Add export/import capabilities
5. Optimize performance for larger graphs (>100 nodes)

This quickstart provides a solid foundation for the Graph Text Editor feature with bidirectional synchronization between text input and visual graph representation.