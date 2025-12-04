# Quickstart: Floyd-Warshall Intermediary Node Coloring

## Overview

This guide provides step-by-step instructions for implementing enhanced Floyd-Warshall visualization with distinct coloring for intermediary nodes.

## Prerequisites

- Floyd-Warshall algorithm already implemented
- Graph visualization system with node coloring
- Step-based execution framework

## Implementation Steps

### 1. Enhance Step Model

```typescript
// Update models/step.ts to support structured highlighting
interface HighlightNodes {
  nodes?: string[];
  intermediary?: string[];
  source?: string[];
  destination?: string[];
}
```

### 2. Modify FW Algorithm

```typescript
// In floydWarshall.ts, update step creation
steps.push(createStep('matrix-update', {
  state: { 
    fwMatrix: copyMatrix(dist),
    fwNodes: [...nodes],
    comment: `dist[${nodes[i]}][${nodes[j]}] = ${throughK} (via ${nodes[k]})` 
  },
  highlightNodes: {
    intermediary: [nodes[k]],
    source: [nodes[i]],
    destination: [nodes[j]]
  },
}));
```

### 3. Extend Node Component

```typescript
// Add new states to Node.tsx
case 'fw-intermediary': return 'graph-node-fw-intermediary';
case 'fw-source': return 'graph-node-fw-source';
case 'fw-destination': return 'graph-node-fw-destination';
```

### 4. Update GraphCanvas

```typescript
// Modify node rendering to handle structured highlighting
const getNodeState = (nodeId: string) => {
  if (highlightNodes?.intermediary?.includes(nodeId)) return 'fw-intermediary';
  if (highlightNodes?.source?.includes(nodeId)) return 'fw-source';
  if (highlightNodes?.destination?.includes(nodeId)) return 'fw-destination';
  // fallback logic
};
```

### 5. Add CSS Classes

```css
/* In your CSS file */
.graph-node-fw-intermediary {
  fill: #8b5cf6;
  stroke: #a855f7;
}

.graph-node-fw-source {
  fill: #f97316;
  stroke: #ea580c;
}

.graph-node-fw-destination {
  fill: #f97316;
  stroke: #ea580c;
}
```

## Testing

- Run FW algorithm on sample graph
- Verify intermediary node shows different color
- Check source/destination nodes have consistent color
- Ensure colors update correctly between steps

## Verification

- ✅ FW produces correct shortest paths
- ✅ Intermediary node visually distinct
- ✅ Source/destination nodes clearly marked
- ✅ Smooth transitions between steps
- ✅ No performance impact