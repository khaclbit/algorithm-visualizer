# Data Model: Graph Direction Toggle

**Feature**: Graph Direction Toggle
**Date**: 2025-12-08

## Overview

The graph direction toggle feature extends the existing graph data model to fully support both directed and undirected graphs. The core entities remain the same, but with enhanced properties and validation rules.

## Core Entities

### Graph Direction Mode

**Purpose**: Represents the current direction mode of the entire graph
**Fields**:
- `directed: boolean` - True for directed graphs, false for undirected
- `default: false` - Backward compatibility with existing graphs

**Validation Rules**:
- Must be boolean value
- Cannot be null or undefined

**Relationships**:
- Controls behavior of all edges in the graph
- Affects algorithm execution (traversal direction)
- Influences visual rendering (arrow display)

### Edge Direction

**Purpose**: Defines the directionality of individual edges
**Fields**:
- `directed: boolean` - True if edge has specific direction, false if bidirectional
- `from: NodeId` - Source node (required)
- `to: NodeId` - Target node (required)
- `weight: number` - Edge weight (default: 1)

**Validation Rules**:
- `from` and `to` must reference existing nodes
- `weight` must be positive finite number
- Self-loops (`from === to`) allowed in both modes
- In undirected graphs, reverse edges are automatically created

**Relationships**:
- Belongs to Graph (inherits direction mode)
- Referenced by algorithms for traversal
- Controls visual rendering (arrows vs lines)

### Mode Toggle State

**Purpose**: UI state for the direction toggle control
**Fields**:
- `currentMode: 'directed' | 'undirected'` - Current UI state
- `isTransitioning: boolean` - True during mode change operations
- `hasConflicts: boolean` - True if mode change would create edge conflicts

**Validation Rules**:
- `currentMode` must match graph's `directed` property
- `isTransitioning` prevents concurrent operations

**Relationships**:
- Controls Graph Direction Mode
- Triggers edge conflict resolution
- Updates UI components

## State Transitions

### Graph Direction Mode Changes

**Undirected → Directed**:
- All existing edges become directed (A↔B becomes A→B)
- No data loss
- Visual: Arrows appear on all edges

**Directed → Undirected**:
- Check for conflicting edges (A→B and B→A)
- Merge conflicts by preserving first edge
- Visual: Arrows disappear from all edges

### Edge Operations by Mode

**Undirected Mode**:
- Adding edge A-B automatically creates B-A
- Removing edge A-B removes both directions
- Highlighting considers both directions

**Directed Mode**:
- Adding edge A-B creates only A→B
- Removing edge A-B removes only that direction
- Highlighting respects exact direction

## Data Integrity Rules

1. **Mode Consistency**: All edges in a graph must respect the graph's direction mode
2. **Conflict Resolution**: When switching to undirected, conflicting directed edges are merged
3. **Weight Preservation**: Edge weights maintained during mode transitions
4. **Self-Loop Handling**: Self-loops preserved regardless of direction mode

## Persistence Schema

The graph state includes direction mode in serialization:

```typescript
interface PersistedGraph {
  nodes: NodeModel[];
  edges: EdgeModel[];
  directed: boolean;  // New field
  // ... other metadata
}
```

## Validation Constraints

- Maximum graph size: 100 nodes, 1000 edges
- Edge weights: Positive finite numbers only
- Node IDs: Unique alphanumeric strings
- Direction mode: Boolean only

## Migration Strategy

Existing graphs default to `directed: false` for backward compatibility. Users can toggle to directed mode at any time, with automatic edge conversion.</content>
<parameter name="filePath">specs/001-graph-direction-toggle/data-model.md