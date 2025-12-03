// Core entities for Graph Text Editor feature

export interface GraphTextRepresentation {
  content: string;
  lines: string[];
  lastModified: Date;
  isValid: boolean;
  errors: ValidationError[];
}

export interface EdgeDefinition {
  sourceVertex: string;
  targetVertex: string;
  weight: number;
  lineNumber: number;
  rawText: string;
}

export interface ParsedGraph {
  vertices: Set<string>;
  edgeDefinitions: EdgeDefinition[];
  adjacencyMap: Map<string, string[]>;
  metadata: ParseMetadata;
}

export interface ParseMetadata {
  parseTime: number;
  vertexCount: number;
  edgeCount: number;
  errorCount: number;
  isIncremental: boolean;
}

export interface ValidationError {
  type: 'format_error' | 'vertex_invalid' | 'weight_invalid' | 'duplicate_edge';
  lineNumber: number;
  columnRange?: [number, number];
  message: string;
  suggestion?: string;
  severity: 'error' | 'warning' | 'info';
}

export interface PerformanceMetrics {
  parseTime: number;           // Time to parse text (ms)
  syncTime: number;            // Time to synchronize (ms)
  renderTime: number;          // Time to render graph (ms)
  nodeCount: number;           // Number of nodes processed
  edgeCount: number;           // Number of edges processed
  memoryUsage?: number;        // Memory usage (bytes)
}

// Parser interface contracts
export interface ParseOptions {
  allowSelfLoops?: boolean;        // Default: false
  allowDuplicateEdges?: boolean;   // Default: true (last wins)
  strictWhitespace?: boolean;      // Default: false
  maxNodes?: number;               // Default: 1000
  maxEdges?: number;               // Default: 1000
}

export interface ParseResult {
  success: boolean;
  graph?: ParsedGraph;
  errors: ValidationError[];
  metadata: ParseMetadata;
}

export interface SerializeOptions {
  sortEdges?: boolean;            // Sort by source then target vertex
  includeComments?: boolean;      // Add descriptive comments
  precision?: number;             // Decimal precision for weights (default: 2)
  format?: 'compact' | 'readable'; // Formatting style
}

// Sync interface contracts
export interface SyncResult {
  success: boolean;
  updatedGraph?: any;  // Will be GraphModel from existing types
  updatedText?: string;
  conflicts: SyncConflict[];
  metadata: SyncMetadata;
}

export interface SyncConflict {
  type: 'edge_weight_mismatch' | 'node_missing' | 'edge_missing';
  description: string;
  textValue: any;
  graphValue: any;
  resolution: 'prefer_text' | 'prefer_graph' | 'manual';
}

export interface SyncMetadata {
  syncTime: number;
  direction: 'text-to-graph' | 'graph-to-text';
  timestamp: Date;
}

export interface SyncState {
  isTextDirty: boolean;        // Text changed since last sync
  isGraphDirty: boolean;       // Graph changed since last sync
  isSyncing: boolean;          // Sync operation in progress
  lastSyncSource: 'text' | 'visual' | null;
  conflicts: SyncConflict[];   // Conflicts requiring user resolution
}

// Component configuration contracts
export interface GraphTextEditorConfig {
  debounceMs?: number;           // Default: 300
  enableRealTimeValidation?: boolean; // Default: true
  enablePerformanceMonitoring?: boolean; // Default: false
  maxUndoSteps?: number;         // Default: 50
  autoLayout?: boolean;          // Default: true
  layoutConfig?: any;            // Will be defined when we implement D3-force layout
}

// React component prop interfaces  
export interface GraphTextEditorProps {
  /** Initial graph data */
  initialGraph?: any;  // Will be GraphModel from existing types
  /** Initial text content */
  initialText?: string;
  /** Callback when graph changes via text input */
  onGraphChange?: (graph: any, source: 'text' | 'visual') => void;
  /** Callback when text changes via visual editing */
  onTextChange?: (text: string, source: 'text' | 'visual') => void;
  /** Callback for validation errors */
  onValidationError?: (errors: ValidationError[]) => void;
  /** Performance monitoring callback */
  onPerformanceMetrics?: (metrics: PerformanceMetrics) => void;
  /** Configuration options */
  config?: GraphTextEditorConfig;
}

// Enhanced existing model interfaces (to be merged later)
export interface EnhancedNodeModel {
  // Existing NodeModel fields
  id: string;
  label?: string;
  x: number;
  y: number;
  // New fields for text integration
  fromText?: boolean;
  textLabel?: string;
}

export interface EnhancedEdgeModel {
  // Existing EdgeModel fields
  id: string;
  from: string;
  to: string;
  weight: number;
  directed?: boolean;
  // New fields for text integration
  fromText?: boolean;
  textWeight?: number;
  lineNumber?: number;
}

export interface EnhancedGraphModel {
  // Existing GraphModel fields
  nodes: EnhancedNodeModel[];
  edges: EnhancedEdgeModel[];
  directed?: boolean;
  // New fields for text integration
  textRepresentation?: GraphTextRepresentation;
  lastSyncDirection?: 'text-to-visual' | 'visual-to-text';
  syncTimestamp?: Date;
}