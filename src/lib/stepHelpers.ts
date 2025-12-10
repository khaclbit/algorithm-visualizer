/**
 * Helper functions for working with Step data structures
 */

import { Step, EdgePointer, HighlightEdges, HighlightEdge } from '@/models/step';

/**
 * Check if an edge is highlighted in a step (handles both legacy array and new object format)
 */
export function isEdgeHighlighted(
  step: Step | null, 
  from: string, 
  to: string
): boolean {
  if (!step?.highlightEdges) return false;
  
  // Handle legacy array format
  if (Array.isArray(step.highlightEdges)) {
    return step.highlightEdges.some(
      e => (e.from === from && e.to === to) || (e.from === to && e.to === from)
    );
  }
  
  // Handle new structured format
  const highlights = step.highlightEdges as HighlightEdges;
  const allEdges = [
    ...(highlights.edges || []),
    ...(highlights.oldPath || []),
    ...(highlights.newPath || [])
  ];
  
  return allEdges.some(
    e => (e.from === from && e.to === to) || (e.from === to && e.to === from)
  );
}

/**
 * Get the highlight info for an edge (for styling purposes)
 */
export function getEdgeHighlightInfo(
  step: Step | null,
  from: string,
  to: string
): { isHighlighted: boolean; style?: string; color?: string; isOldPath?: boolean; isNewPath?: boolean } {
  if (!step?.highlightEdges) {
    return { isHighlighted: false };
  }
  
  // Handle legacy array format
  if (Array.isArray(step.highlightEdges)) {
    const found = step.highlightEdges.some(
      e => (e.from === from && e.to === to) || (e.from === to && e.to === from)
    );
    return { isHighlighted: found };
  }
  
  // Handle new structured format
  const highlights = step.highlightEdges as HighlightEdges;
  
  // Check old path first
  const oldPathEdge = highlights.oldPath?.find(
    e => (e.from === from && e.to === to) || (e.from === to && e.to === from)
  );
  if (oldPathEdge) {
    return {
      isHighlighted: true,
      style: oldPathEdge.style || 'path-old',
      color: oldPathEdge.color,
      isOldPath: true
    };
  }
  
  // Check new path
  const newPathEdge = highlights.newPath?.find(
    e => (e.from === from && e.to === to) || (e.from === to && e.to === from)
  );
  if (newPathEdge) {
    return {
      isHighlighted: true,
      style: newPathEdge.style || 'path-new',
      color: newPathEdge.color,
      isNewPath: true
    };
  }
  
  // Check general edges
  const generalEdge = highlights.edges?.find(
    e => (e.from === from && e.to === to) || (e.from === to && e.to === from)
  );
  if (generalEdge) {
    return {
      isHighlighted: true,
      style: generalEdge.style,
      color: generalEdge.color
    };
  }
  
  return { isHighlighted: false };
}

/**
 * Check if an edge is visited in a step
 */
export function isEdgeVisited(step: Step | null, from: string, to: string): boolean {
  if (!step?.visitedEdges) return false;
  return step.visitedEdges.some(
    e => (e.from === from && e.to === to) || (e.from === to && e.to === from)
  );
}
