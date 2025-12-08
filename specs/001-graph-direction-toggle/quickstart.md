# Quickstart: Graph Direction Toggle

**Feature**: Graph Direction Toggle
**Date**: 2025-12-08

## Overview

The graph direction toggle allows you to switch between undirected (bidirectional) and directed (unidirectional) graph modes. This affects how edges are displayed, how algorithms traverse the graph, and how new edges are created.

## Getting Started

### 1. Access the Toggle

The direction toggle is located in the main toolbar, next to the existing tools. It shows:
- **Undirected mode**: Bidirectional arrow icon or "Undirected" label
- **Directed mode**: One-way arrow icon or "Directed" label

### 2. Switch Modes

1. Click the toggle button in the toolbar
2. The graph immediately updates to show the new mode
3. Edges display arrows in directed mode, lines in undirected mode

### 3. Create Edges by Mode

**Undirected Mode**:
- Click "Add Edge" tool
- Click two nodes to create a bidirectional edge
- Edge appears as a line (no arrows)

**Directed Mode**:
- Click "Add Edge" tool
- Click source node, then target node
- Edge appears with arrow pointing from source to target

### 4. Run Algorithms

Algorithms automatically respect the current direction mode:
- **BFS/DFS**: Traverse only in allowed directions
- **Dijkstra**: Find shortest paths considering direction
- **Floyd-Warshall**: Compute all-pairs shortest paths with direction

## Text Input Format

### Directed Edges
Use vertex order to specify direction:
```
A B 3    # Creates directed edge A → B with weight 3
B A 5    # Creates directed edge B → A with weight 5
```

### Undirected Edges
Existing format continues to work:
```
A B 3    # Creates undirected edge A ↔ B with weight 3
```

## Mode Transitions

### Switching from Undirected to Directed
- All existing edges become directed (A ↔ B becomes A → B)
- No data loss
- Visual: Arrows appear on all edges

### Switching from Directed to Undirected
- Conflicting edges are merged (if A → B and B → A exist, one is preserved)
- Edge weights maintained
- Visual: Arrows disappear

## Visual Feedback

### Edge Rendering
- **Directed**: Lines with arrowheads at target nodes
- **Undirected**: Simple lines without arrows
- **Highlighted**: Edges glow during algorithm execution
- **Visited**: Edges change color after traversal

### Algorithm Visualization
- Only traversed edges are highlighted
- Direction respected (A → B highlight ≠ B → A highlight in directed mode)
- Step-by-step visualization shows correct traversal paths

## Troubleshooting

### Edges Not Showing Arrows
- Check if graph is in directed mode
- Toggle the direction button in toolbar

### Algorithm Not Working
- Ensure graph has valid structure for the algorithm
- Check console for error messages

### Text Input Errors
- Verify vertex order for directed edges
- Check weight values are positive numbers

## Examples

### Creating a Directed Graph
1. Toggle to directed mode
2. Add nodes A, B, C
3. Add edges: A→B, B→C, C→A
4. Run BFS from A to see directed traversal

### Creating an Undirected Graph
1. Toggle to undirected mode (default)
2. Add nodes X, Y, Z
3. Add edges: X-Y, Y-Z (creates bidirectional edges)
4. Run Dijkstra to find shortest paths

## Performance Notes

- Toggle operations complete in <500ms
- Supports graphs up to 100 nodes
- Real-time visual updates
- State persists across sessions</content>
<parameter name="filePath">specs/001-graph-direction-toggle/quickstart.md