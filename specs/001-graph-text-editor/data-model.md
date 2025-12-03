# Data Model: Graph Text Editor

**Feature**: Graph Text Editor (001-graph-text-editor)  
**Date**: December 4, 2025  
**Status**: Phase 1 Design

This document defines the data structures, entities, and relationships for the Graph Text Editor feature.

## Core Entities

### GraphTextRepresentation
Represents the textual form of a graph using the "vertex1 vertex2 weight" format.

**Fields**:
- `content: string` - Raw text content of the graph definition
- `lines: string[]` - Split content by newlines for line-by-line processing
- `lastModified: Date` - Timestamp of last change for change detection
- `isValid: boolean` - Whether the current text represents a valid graph
- `errors: ValidationError[]` - List of parsing/validation errors

**Validation Rules**:
- Each non-empty line must follow "vertex1 vertex2 weight" format
- Vertex names must be alphanumeric (letters, numbers, underscores)
- Weights must be positive numbers (integers or decimals)
- Empty lines and whitespace-only lines are ignored

**State Transitions**:
- `Empty` → `Editing` → `Valid` → `Synchronized`
- `Valid` → `Invalid` (on validation error)
- `Invalid` → `Valid` (on error correction)

### EdgeDefinition
Parsed representation of a single text line.

**Fields**:
- `sourceVertex: string` - Name of the source vertex
- `targetVertex: string` - Name of the target vertex  
- `weight: number` - Numeric edge weight (positive)
- `lineNumber: number` - Original line number in text (for error reporting)
- `rawText: string` - Original text line for error context

**Validation Rules**:
- `sourceVertex !== targetVertex` (no self-loops)
- `weight > 0` (positive weights only)
- `sourceVertex` and `targetVertex` match alphanumeric pattern

### ParsedGraph
Intermediate representation between text and visual graph model.

**Fields**:
- `vertices: Set<string>` - Unique vertex names extracted from text
- `edgeDefinitions: EdgeDefinition[]` - List of valid edge definitions
- `adjacencyMap: Map<string, string[]>` - Quick lookup for vertex neighbors
- `metadata: ParseMetadata` - Parsing statistics and performance info

### ParseMetadata
Performance and diagnostic information for text parsing.

**Fields**:
- `parseTime: number` - Time taken to parse (ms)
- `vertexCount: number` - Total number of vertices
- `edgeCount: number` - Total number of edges
- `errorCount: number` - Number of validation errors
- `isIncremental: boolean` - Whether this was an incremental parse

## Extended Entities (Integration with Existing Model)

### Enhanced GraphModel
Extends the existing `GraphModel` interface with text synchronization capabilities.

**New Fields**:
- `textRepresentation?: GraphTextRepresentation` - Associated text form
- `lastSyncDirection?: 'text-to-visual' | 'visual-to-text'` - Last sync direction
- `syncTimestamp?: Date` - When last synchronized

### Enhanced NodeModel
Extends existing `NodeModel` with text parsing context.

**New Fields**:
- `fromText: boolean` - Whether node was created from text input
- `textLabel?: string` - Original label from text (may differ from display label)

### Enhanced EdgeModel
Extends existing `EdgeModel` with text parsing context.

**New Fields**:
- `fromText: boolean` - Whether edge was created from text input
- `textWeight?: number` - Original weight from text (for precision preservation)
- `lineNumber?: number` - Source line in text (for error reporting)

## Data Flow Relationships

### Text → Graph Flow
1. **Input**: Raw text string
2. **Parse**: Text → `GraphTextRepresentation` → `ParsedGraph`
3. **Validate**: Check for errors, update `isValid` and `errors`
4. **Transform**: `ParsedGraph` → Enhanced `GraphModel`
5. **Layout**: Apply D3-force layout to position nodes
6. **Render**: Update visual canvas

### Graph → Text Flow
1. **Extract**: Enhanced `GraphModel` → `EdgeDefinition[]`
2. **Serialize**: Edge definitions → formatted text lines
3. **Update**: Text → `GraphTextRepresentation`
4. **Sync**: Update text editor content

### Bidirectional Sync State
```typescript
interface SyncState {
  isTextDirty: boolean;        // Text changed since last sync
  isGraphDirty: boolean;       // Graph changed since last sync
  isSyncing: boolean;          // Sync operation in progress
  lastSyncSource: 'text' | 'visual' | null;
  conflicts: SyncConflict[];   // Conflicts requiring user resolution
}
```

## Validation Rules

### Text Format Validation
- **Line Format**: `/^(\w+)\s+(\w+)\s+([\d.]+)$/`
- **Vertex Names**: `/^[a-zA-Z0-9_]+$/` (alphanumeric + underscore)
- **Weight Values**: Positive numbers, finite values only
- **Duplicate Edges**: Allow overwrite (last definition wins)

### Graph Consistency Validation
- **Node Existence**: All referenced nodes must exist
- **Edge Validity**: No self-loops, positive weights
- **Graph Connectivity**: No constraints (disconnected components allowed)

### Cross-Format Validation
- **Round-trip Consistency**: Text → Graph → Text should preserve semantics
- **Precision Preservation**: Decimal weights preserved within floating-point limits
- **Label Consistency**: Node labels match between text and visual representations

## Performance Considerations

### Incremental Parsing
- **Change Detection**: Compare line-by-line differences
- **Partial Updates**: Parse only modified sections
- **Cache Strategy**: LRU cache for 50 most recent parse results

### Memory Management
- **Object Pooling**: Reuse `EdgeDefinition` and `ParsedGraph` objects
- **Weak References**: Use WeakMap for temporary parsing data
- **Cleanup**: Automatic cleanup of stale cache entries

### Synchronization Efficiency
- **Debounced Updates**: 300ms debounce for text input changes
- **Batch Operations**: Group multiple changes into single sync operation
- **Lazy Evaluation**: Parse text only when visual sync is needed

## Error Handling

### Validation Errors
```typescript
interface ValidationError {
  type: 'format' | 'vertex' | 'weight' | 'duplicate';
  lineNumber: number;
  message: string;
  suggestion?: string;
}
```

### Recovery Strategies
- **Partial Parsing**: Continue parsing valid lines despite errors
- **Error Context**: Preserve line numbers and original text for debugging
- **Graceful Degradation**: Show last valid graph state during error correction

This data model provides a robust foundation for implementing bidirectional synchronization between text input and visual graph representation while maintaining performance and data consistency.