# Graph Text Editor Component Contracts

**Feature**: Graph Text Editor (001-graph-text-editor)  
**Date**: December 4, 2025  
**Type**: Component Interface Specification

This document defines the interfaces and contracts for components implementing the Graph Text Editor feature.

## Core Interfaces

### IGraphTextParser

**Purpose**: Parse text input into graph data structures

```typescript
interface IGraphTextParser {
  /**
   * Parse text input into graph representation
   * @param text Raw text input in "vertex1 vertex2 weight" format
   * @param options Parsing configuration options
   * @returns Parsed graph data or validation errors
   */
  parseText(text: string, options?: ParseOptions): ParseResult;
  
  /**
   * Validate text format without full parsing
   * @param text Raw text input to validate
   * @returns Array of validation errors (empty if valid)
   */
  validateText(text: string): ValidationError[];
  
  /**
   * Perform incremental parse for performance optimization
   * @param previousResult Previous parse result for comparison
   * @param newText New text input
   * @returns Updated parse result with minimal computation
   */
  incrementalParse(previousResult: ParseResult, newText: string): ParseResult;
}

interface ParseOptions {
  allowSelfLoops?: boolean;        // Default: false
  allowDuplicateEdges?: boolean;   // Default: true (last wins)
  strictWhitespace?: boolean;      // Default: false
  maxNodes?: number;               // Default: 1000
  maxEdges?: number;               // Default: 1000
}

interface ParseResult {
  success: boolean;
  graph?: ParsedGraph;
  errors: ValidationError[];
  metadata: ParseMetadata;
}
```

### IGraphSerializer

**Purpose**: Convert graph data back to text format

```typescript
interface IGraphSerializer {
  /**
   * Convert graph model to text representation
   * @param graph Graph model to serialize
   * @param options Serialization formatting options
   * @returns Formatted text string
   */
  serialize(graph: GraphModel, options?: SerializeOptions): string;
  
  /**
   * Convert graph model to structured edge definitions
   * @param graph Graph model to extract edges from
   * @returns Array of edge definitions with metadata
   */
  extractEdgeDefinitions(graph: GraphModel): EdgeDefinition[];
}

interface SerializeOptions {
  sortEdges?: boolean;            // Sort by source then target vertex
  includeComments?: boolean;      // Add descriptive comments
  precision?: number;             // Decimal precision for weights (default: 2)
  format?: 'compact' | 'readable'; // Formatting style
}
```

### IGraphTextSync

**Purpose**: Handle bidirectional synchronization between text and visual representations

```typescript
interface IGraphTextSync {
  /**
   * Sync text input to graph model
   * @param text Current text representation
   * @param currentGraph Current graph state
   * @returns Updated graph model and sync metadata
   */
  syncTextToGraph(text: string, currentGraph: GraphModel): SyncResult;
  
  /**
   * Sync graph model to text representation
   * @param graph Current graph model
   * @param currentText Current text state
   * @returns Updated text content and sync metadata
   */
  syncGraphToText(graph: GraphModel, currentText: string): SyncResult;
  
  /**
   * Detect conflicts between text and graph representations
   * @param text Current text content
   * @param graph Current graph model
   * @returns List of conflicts requiring resolution
   */
  detectConflicts(text: string, graph: GraphModel): SyncConflict[];
}

interface SyncResult {
  success: boolean;
  updatedGraph?: GraphModel;
  updatedText?: string;
  conflicts: SyncConflict[];
  metadata: SyncMetadata;
}

interface SyncConflict {
  type: 'edge_weight_mismatch' | 'node_missing' | 'edge_missing';
  description: string;
  textValue: any;
  graphValue: any;
  resolution: 'prefer_text' | 'prefer_graph' | 'manual';
}
```

## React Component Contracts

### GraphTextEditor

**Purpose**: Main component orchestrating text input and graph visualization sync

```typescript
interface GraphTextEditorProps {
  /** Initial graph data */
  initialGraph?: GraphModel;
  /** Initial text content */
  initialText?: string;
  /** Callback when graph changes via text input */
  onGraphChange?: (graph: GraphModel, source: 'text' | 'visual') => void;
  /** Callback when text changes via visual editing */
  onTextChange?: (text: string, source: 'text' | 'visual') => void;
  /** Callback for validation errors */
  onValidationError?: (errors: ValidationError[]) => void;
  /** Performance monitoring callback */
  onPerformanceMetrics?: (metrics: PerformanceMetrics) => void;
  /** Configuration options */
  config?: GraphTextEditorConfig;
}

interface GraphTextEditorConfig {
  debounceMs?: number;           // Default: 300
  enableRealTimeValidation?: boolean; // Default: true
  enablePerformanceMonitoring?: boolean; // Default: false
  maxUndoSteps?: number;         // Default: 50
  autoLayout?: boolean;          // Default: true
  layoutConfig?: LayoutConfig;
}

interface GraphTextEditorRef {
  /** Get current text content */
  getText(): string;
  /** Set text content programmatically */
  setText(text: string): void;
  /** Get current graph model */
  getGraph(): GraphModel;
  /** Set graph model programmatically */
  setGraph(graph: GraphModel): void;
  /** Trigger manual synchronization */
  sync(direction: 'text-to-graph' | 'graph-to-text'): Promise<SyncResult>;
  /** Clear all content */
  clear(): void;
}
```

### EnhancedTextEditorModal

**Purpose**: Text editor component with graph parsing capabilities

```typescript
interface EnhancedTextEditorModalProps extends TextEditorModalProps {
  /** Enable graph text parsing and validation */
  enableGraphParsing?: boolean;
  /** Real-time validation feedback */
  showValidationErrors?: boolean;
  /** Syntax highlighting for graph format */
  enableSyntaxHighlighting?: boolean;
  /** Auto-complete for vertex names */
  enableAutoComplete?: boolean;
  /** Callback for parsed graph data */
  onGraphParsed?: (result: ParseResult) => void;
}
```

### GraphCanvas (Enhanced)

**Purpose**: Visual graph canvas with text sync capabilities

```typescript
interface EnhancedGraphCanvasProps extends GraphCanvasProps {
  /** Enable text synchronization */
  enableTextSync?: boolean;
  /** Callback when graph changes require text update */
  onGraphChangeForText?: (graph: GraphModel) => void;
  /** Current text representation for conflict detection */
  currentText?: string;
  /** Visual indicators for text-derived elements */
  highlightFromText?: boolean;
}
```

## Validation Contracts

### ValidationError

```typescript
interface ValidationError {
  type: 'format_error' | 'vertex_invalid' | 'weight_invalid' | 'duplicate_edge';
  lineNumber: number;
  columnRange?: [number, number];
  message: string;
  suggestion?: string;
  severity: 'error' | 'warning' | 'info';
}
```

### Performance Metrics

```typescript
interface PerformanceMetrics {
  parseTime: number;           // Time to parse text (ms)
  syncTime: number;            // Time to synchronize (ms)
  renderTime: number;          // Time to render graph (ms)
  nodeCount: number;           // Number of nodes processed
  edgeCount: number;           // Number of edges processed
  memoryUsage?: number;        // Memory usage (bytes)
}
```

## Usage Examples

### Basic Implementation

```typescript
const GraphTextEditorExample = () => {
  const [graph, setGraph] = useState<GraphModel>();
  const [text, setText] = useState<string>('');
  
  const handleGraphChange = useCallback((newGraph: GraphModel, source: string) => {
    setGraph(newGraph);
    if (source === 'text') {
      console.log('Graph updated from text input');
    }
  }, []);
  
  const handleValidationError = useCallback((errors: ValidationError[]) => {
    console.warn('Validation errors:', errors);
  }, []);
  
  return (
    <GraphTextEditor
      initialGraph={graph}
      initialText={text}
      onGraphChange={handleGraphChange}
      onTextChange={setText}
      onValidationError={handleValidationError}
      config={{
        debounceMs: 300,
        enableRealTimeValidation: true,
        autoLayout: true
      }}
    />
  );
};
```

### Advanced Usage with Performance Monitoring

```typescript
const AdvancedGraphEditor = () => {
  const editorRef = useRef<GraphTextEditorRef>();
  const [metrics, setMetrics] = useState<PerformanceMetrics>();
  
  const handlePerformanceMetrics = useCallback((metrics: PerformanceMetrics) => {
    setMetrics(metrics);
    if (metrics.parseTime > 500) {
      console.warn('Slow parsing detected:', metrics);
    }
  }, []);
  
  const handleExport = useCallback(async () => {
    if (editorRef.current) {
      const result = await editorRef.current.sync('graph-to-text');
      const text = editorRef.current.getText();
      downloadAsFile(text, 'graph.txt');
    }
  }, []);
  
  return (
    <div>
      <GraphTextEditor
        ref={editorRef}
        onPerformanceMetrics={handlePerformanceMetrics}
        config={{ enablePerformanceMonitoring: true }}
      />
      {metrics && (
        <div>Parse time: {metrics.parseTime}ms</div>
      )}
      <button onClick={handleExport}>Export Text</button>
    </div>
  );
};
```

These contracts provide a comprehensive interface specification for implementing the Graph Text Editor feature while maintaining type safety, performance, and extensibility.