# Research: Floyd-Warshall Intermediary Node Coloring

## Current FW Implementation Analysis

### Decision: Extend existing FW algorithm with intermediary tracking
**Rationale**: Current FW implementation already tracks matrix updates and highlights nodes, but doesn't distinguish between intermediary and optimized pair. Need to add k, i, j tracking to step data.

**Current Structure**:
- FW algorithm creates steps with matrix state and highlightNodes
- Steps include comments about current operations
- Node highlighting uses single highlightNodes array

**Enhancement Needed**:
- Add currentK, currentI, currentJ to step state
- Modify highlighting to support different colors for different roles

**Alternatives Considered**:
- Track intermediary state separately: More complex, harder to integrate
- Use different highlight arrays: Cleaner, follows existing pattern

### Node Coloring System Analysis

### Decision: Extend Node component state system
**Rationale**: Current Node component supports multiple states ('default', 'current', 'visited', 'queued', 'start') with corresponding CSS classes. Can add new states for FW visualization.

**Current States**:
- default: Standard appearance
- current: Currently processing
- visited: Already processed
- queued: Waiting to process
- start: Starting point

**New States Needed**:
- fw-intermediary: For FW k node
- fw-source: For FW i node
- fw-destination: For FW j node

**Color Scheme**:
- intermediary: Distinct color (e.g., purple/blue)
- source/destination: Different color (e.g., orange/red)
- Ensure good contrast and accessibility

**Alternatives Considered**:
- Override colors globally: Less flexible for multiple algorithms
- Use CSS variables: Good, but need component state support

### Integration Strategy

### Decision: Modify FW steps to include role-specific highlighting
**Rationale**: Instead of single highlightNodes array, use structured highlighting with roles.

**Proposed Structure**:
```typescript
highlightNodes: {
  intermediary: [nodeId],
  source: [nodeId], 
  destination: [nodeId]
}
```

**Implementation**:
- Update Step model to support structured highlighting
- Modify GraphCanvas to apply appropriate colors
- Extend Node component with new state types

**Alternatives Considered**:
- Keep flat array with metadata: More complex parsing
- Use separate arrays: Simpler but less extensible