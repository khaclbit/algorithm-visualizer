import { GraphModel } from '@/models/graph';
import { Step, createStep, EdgePointer, HighlightEdge } from '@/models/step';
import { getPairColor, getDimmedPairColor } from '@/lib/pairColorHash';

export function floydWarshall(graph: GraphModel): Step[] {
  const steps: Step[] = [];
  const nodes = graph.nodes.map(n => n.id);
  const n = nodes.length;
  const nodeIndex: Record<string, number> = {};
  
  nodes.forEach((id, i) => nodeIndex[id] = i);

  // Initialize distance matrix
  const dist: number[][] = Array(n).fill(null).map(() => Array(n).fill(Infinity));
  
  // Initialize next matrix for path reconstruction
  // next[i][j] = the next node after i on the shortest path from i to j
  const next: (string | null)[][] = Array(n).fill(null).map(() => Array(n).fill(null));
  
  // Distance to self is 0
  for (let i = 0; i < n; i++) {
    dist[i][i] = 0;
  }

  // Add edge weights and initialize next matrix
  for (const edge of graph.edges) {
    const i = nodeIndex[edge.from];
    const j = nodeIndex[edge.to];
    const w = edge.weight ?? 1;
    dist[i][j] = w;
    next[i][j] = nodes[j];
    if (!graph.directed) {
      dist[j][i] = w;
      next[j][i] = nodes[i];
    }
  }

  const copyMatrix = (m: number[][]): number[][] => m.map(row => [...row]);
  const copyNextMatrix = (m: (string | null)[][]): (string | null)[][] => m.map(row => [...row]);

  /**
   * Reconstruct path from i to j using the next matrix
   */
  const reconstructPath = (from: number, to: number, nextMatrix: (string | null)[][]): string[] => {
    if (nextMatrix[from][to] === null) return [];
    
    const path: string[] = [nodes[from]];
    let current = from;
    
    while (current !== to) {
      const nextNode = nextMatrix[current][to];
      if (nextNode === null) break;
      path.push(nextNode);
      current = nodeIndex[nextNode];
    }
    
    return path;
  };

  /**
   * Convert a path to edge pointers
   */
  const pathToEdges = (path: string[]): EdgePointer[] => {
    const edges: EdgePointer[] = [];
    for (let i = 0; i < path.length - 1; i++) {
      edges.push({ from: path[i], to: path[i + 1] });
    }
    return edges;
  };

  steps.push(createStep('custom', {
    state: { 
      fwMatrix: copyMatrix(dist),
      fwNodes: [...nodes],
      fwNext: copyNextMatrix(next),
      comment: 'Initialized distance matrix with direct edges' 
    },
  }));

  // Floyd-Warshall main loop
  for (let k = 0; k < n; k++) {
    steps.push(createStep('custom', {
      state: { 
        fwMatrix: copyMatrix(dist),
        fwNodes: [...nodes],
        fwNext: copyNextMatrix(next),
        comment: `Considering paths through node ${nodes[k]} (k=${k})` 
      },
      highlightNodes: {
        intermediary: [nodes[k]]
      },
    }));

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i === j || i === k || j === k) continue;
        
        const throughK = dist[i][k] + dist[k][j];
        
        if (throughK < dist[i][j]) {
          // Get the old path before updating (if exists)
          const oldPath = reconstructPath(i, j, next);
          const oldEdges = pathToEdges(oldPath);
          
          // Update the distance
          const oldDist = dist[i][j];
          dist[i][j] = throughK;
          
          // Update the next matrix: path from i to j now goes through k
          next[i][j] = next[i][k];
          
          // Get the new path after updating
          const newPath = reconstructPath(i, j, next);
          const newEdges = pathToEdges(newPath);
          
          // Generate pair color for this (i,j) pair
          const pairColor = getPairColor(nodes[i], nodes[j]);
          const dimmedColor = getDimmedPairColor(nodes[i], nodes[j]);
          
          // Create highlighted edges with styling
          const oldPathHighlight: HighlightEdge[] = oldEdges.map(e => ({
            ...e,
            style: 'path-old' as const,
            color: dimmedColor
          }));
          
          const newPathHighlight: HighlightEdge[] = newEdges.map(e => ({
            ...e,
            style: 'path-new' as const,
            color: pairColor
          }));
          
          steps.push(createStep('matrix-update', {
            state: { 
              fwMatrix: copyMatrix(dist),
              fwNodes: [...nodes],
              fwNext: copyNextMatrix(next),
              comment: `dist[${nodes[i]}][${nodes[j]}] improved: ${oldDist === Infinity ? '∞' : oldDist} → ${throughK} (via ${nodes[k]})` 
            },
            highlightNodes: {
              intermediary: [nodes[k]],
              source: [nodes[i]],
              destination: [nodes[j]]
            },
            highlightEdges: {
              oldPath: oldPath.length > 1 ? oldPathHighlight : [],
              newPath: newPathHighlight
            },
            fwPathUpdate: {
              from: nodes[i],
              to: nodes[j],
              oldPath,
              newPath,
              oldEdges,
              newEdges
            }
          }));
        }
      }
    }
  }

  steps.push(createStep('custom', {
    state: { 
      fwMatrix: copyMatrix(dist),
      fwNodes: [...nodes],
      fwNext: copyNextMatrix(next),
      comment: 'Floyd-Warshall complete! Select two nodes to inspect their shortest path.' 
    },
  }));

  return steps;
}

/**
 * Reconstruct the shortest path between two nodes using the fwNext matrix from the final step
 */
export function reconstructFWPath(
  fwNext: (string | null)[][],
  fwNodes: string[],
  from: string,
  to: string
): string[] {
  const nodeIndex: Record<string, number> = {};
  fwNodes.forEach((id, i) => nodeIndex[id] = i);
  
  const fromIdx = nodeIndex[from];
  const toIdx = nodeIndex[to];
  
  if (fromIdx === undefined || toIdx === undefined) return [];
  if (fwNext[fromIdx][toIdx] === null) return [];
  
  const path: string[] = [from];
  let current = fromIdx;
  
  // Safety limit to prevent infinite loops
  const maxIterations = fwNodes.length + 1;
  let iterations = 0;
  
  while (current !== toIdx && iterations < maxIterations) {
    const nextNode = fwNext[current][toIdx];
    if (nextNode === null) break;
    path.push(nextNode);
    current = nodeIndex[nextNode];
    iterations++;
  }
  
  return path;
}

/**
 * Get the shortest path distance between two nodes from the final matrix
 */
export function getFWDistance(
  fwMatrix: number[][],
  fwNodes: string[],
  from: string,
  to: string
): number {
  const nodeIndex: Record<string, number> = {};
  fwNodes.forEach((id, i) => nodeIndex[id] = i);
  
  const fromIdx = nodeIndex[from];
  const toIdx = nodeIndex[to];
  
  if (fromIdx === undefined || toIdx === undefined) return Infinity;
  return fwMatrix[fromIdx][toIdx];
}
