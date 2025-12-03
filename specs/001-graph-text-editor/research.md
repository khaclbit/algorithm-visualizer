# Research: Graph Text Editor Implementation

**Date**: December 4, 2025  
**Feature**: Graph Text Editor (001-graph-text-editor)  
**Status**: Phase 0 Complete

This document resolves all NEEDS CLARIFICATION items identified in the technical context.

## Testing Framework Selection

### Decision: Vitest + React Testing Library

**Rationale**: 
- Native Vite integration with minimal configuration
- 10x faster test execution than Jest for Vite projects
- First-class TypeScript support without transform layers
- Jest-compatible API for easy adoption
- Perfect alignment with existing Vite build system

**Alternatives considered**:
- Jest + React Testing Library: Rejected due to configuration complexity and performance penalties
- Native browser testing: Rejected due to setup complexity and CI/CD integration challenges

**Setup**: 
```bash
npm install -D vitest @vitest/ui jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

## Text Parsing Performance Strategy

### Decision: Debounced Input + Incremental Parsing + useDeferredValue

**Rationale**:
- Debouncing (300ms) reduces parse operations by 60-90% during active typing
- Incremental parsing achieves 80-95% performance improvement for text edits
- useDeferredValue maintains input responsiveness during heavy parsing
- Combined approach reliably meets <500ms parsing and <200ms sync requirements

**Alternatives considered**:
- Throttling: Rejected as it provides less benefit for text-to-graph conversion workflow
- Web Workers: Considered for future optimization if graphs exceed 500 edges
- Full re-parse on every change: Rejected due to performance requirements

**Implementation Pattern**:
```javascript
const debouncedText = useDebouncedValue(inputText, 300);
const graphData = useMemo(() => parseGraph(debouncedText), [debouncedText]);
```

## Graph Layout Algorithm Selection

### Decision: D3-Force with Custom React Wrapper

**Rationale**:
- Industry standard with proven stability for React applications
- Excellent performance characteristics for 100-1000 node range
- Maximum customization flexibility for specific requirements
- Force-directed algorithms ideal for undirected graphs
- Strong ecosystem support and community

**Alternatives considered**:
- Cytoscape.js: Excellent but potentially over-featured for current requirements
- React-Force-Graph: Good for rapid prototyping but less customizable
- ngraph.forcelayout: Best performance but steeper learning curve

**Performance optimizations**:
- Barnes-Hut optimization for graphs approaching 1000 nodes
- Spatial indexing for efficient hit detection
- Alpha decay tuning for faster layout stabilization

## Technology Integration Strategy

### React State Management
- Granular state separation (text, nodes, edges) to minimize re-renders
- React.memo for graph components to optimize virtual DOM updates
- Object pooling for graph elements to reduce garbage collection

### Parser Architecture
- Incremental parsing with diff detection for minor changes
- LRU cache (50 entries) for frequently accessed graph states
- Early return optimization for identical text inputs

### Synchronization Pattern
- Bidirectional sync using shared state in GraphContext
- Event-driven updates to maintain consistency
- Validation layer to prevent invalid graph states

## Implementation Dependencies

**Core libraries**:
- `d3-force`: Force-directed layout engine
- `@testing-library/react`: Component testing
- `vitest`: Test runner and framework

**Development approach**:
1. Extend existing `GraphContext` with text parsing methods
2. Create dedicated parser modules (`textParser.ts`, `graphSerializer.ts`)
3. Enhance `TextEditorModal` component with real-time validation
4. Add synchronization hooks for bidirectional updates

## Performance Benchmarks Target

Based on research findings, target metrics are achievable:
- **Parse time**: <500ms for 100-edge graphs (achievable with incremental parsing)
- **Sync time**: <200ms for text-to-visual updates (achievable with useDeferredValue)
- **Memory usage**: <100MB (achievable with object pooling and cache management)
- **Responsiveness**: Maintain 60fps during text input (achievable with debouncing)

All NEEDS CLARIFICATION items resolved. Ready for Phase 1 design.