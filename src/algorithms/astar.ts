import { GraphModel, getEdgeBetween } from '@/models/graph';
import { Step, createStep, EdgePointer } from '@/models/step';

interface AStarNode {
  id: string;
  g: number; // Cost from start to this node
  h: number; // Heuristic (estimated cost to goal)
  f: number; // Total cost (g + h)
  parent: string | null;
}

// Reconstruct path from predecessors
function reconstructPath(
  predecessors: Record<string, string | null>,
  target: string
): string[] {
  const path: string[] = [];
  let current: string | null = target;
  
  while (current !== null) {
    path.unshift(current);
    current = predecessors[current];
  }
  
  return path;
}

// Get edges for the final path
function getPathEdges(path: string[]): EdgePointer[] {
  const edges: EdgePointer[] = [];
  for (let i = 0; i < path.length - 1; i++) {
    edges.push({ from: path[i], to: path[i + 1] });
  }
  return edges;
}

// Get all edges currently in the shortest path tree
function getShortestPathEdges(predecessors: Record<string, string | null>): EdgePointer[] {
  const edges: EdgePointer[] = [];
  for (const [node, pred] of Object.entries(predecessors)) {
    if (pred !== null) {
      edges.push({ from: pred, to: node });
    }
  }
  return edges;
}

export interface AStarResult {
  steps: Step[];
  pathFound: boolean;
  path: string[];
  totalCost: number;
  visitedCount: number;
}

export function astar(
  graph: GraphModel,
  startNode: string,
  targetNode: string
): AStarResult {
  const steps: Step[] = [];
  
  // Validate inputs
  const startExists = graph.nodes.some(n => n.id === startNode);
  const targetExists = graph.nodes.some(n => n.id === targetNode);
  
  if (!startExists || !targetExists) {
    steps.push(createStep('custom', {
      state: { comment: 'Error: Start or target node not found in graph' }
    }));
    return { steps, pathFound: false, path: [], totalCost: Infinity, visitedCount: 0 };
  }

  // Handle edge case: start === target
  if (startNode === targetNode) {
    steps.push(createStep('custom', {
      state: { comment: `Start equals target. Path found: [${startNode}]` },
      highlightNodes: [startNode],
      visitedNodes: [startNode],
    }));
    return { steps, pathFound: true, path: [startNode], totalCost: 0, visitedCount: 1 };
  }

  // Initialize data structures
  const openSet = new Map<string, AStarNode>();
  const closedSet = new Set<string>();
  const predecessors: Record<string, string | null> = {};
  const gScores: Record<string, number> = {};
  const fScores: Record<string, number> = {};

  // Get heuristic values (node weights) 
  const heuristics: Record<string, number> = {};
  for (const node of graph.nodes) {
    heuristics[node.id] = node.weight ?? 0;
    gScores[node.id] = Infinity;
    fScores[node.id] = Infinity;
    predecessors[node.id] = null;
  }

  // Initialize start node
  const startH = heuristics[startNode];
  gScores[startNode] = 0;
  fScores[startNode] = startH;
  
  openSet.set(startNode, {
    id: startNode,
    g: 0,
    h: startH,
    f: startH,
    parent: null,
  });

  steps.push(createStep('custom', {
    state: {
      distances: { ...gScores },
      predecessors: { ...predecessors },
      comment: `Starting A* from ${startNode} to ${targetNode}. h(${startNode})=${startH}`,
    },
    currentNode: startNode,
    visitedNodes: [],
    queuedNodes: [startNode],
  }));

  while (openSet.size > 0) {
    // Find node in open set with lowest f score
    let current: AStarNode | null = null;
    let lowestF = Infinity;
    
    for (const node of openSet.values()) {
      if (node.f < lowestF) {
        lowestF = node.f;
        current = node;
      }
    }

    if (!current) break;

    // Check if we reached the target
    if (current.id === targetNode) {
      const path = reconstructPath(predecessors, targetNode);
      const pathEdges = getPathEdges(path);
      
      steps.push(createStep('custom', {
        state: {
          distances: { ...gScores },
          predecessors: { ...predecessors },
          comment: `🎯 Target reached! Path: ${path.join(' → ')}. Total cost: ${current.g}`,
        },
        highlightNodes: path,
        highlightEdges: pathEdges,
        visitedNodes: Array.from(closedSet),
        queuedNodes: Array.from(openSet.keys()),
      }));

      return {
        steps,
        pathFound: true,
        path,
        totalCost: current.g,
        visitedCount: closedSet.size + 1,
      };
    }

    // Move current from open to closed set
    openSet.delete(current.id);
    closedSet.add(current.id);

    steps.push(createStep('visit-node', {
      state: {
        distances: { ...gScores },
        predecessors: { ...predecessors },
        comment: `Evaluating ${current.id}: g=${current.g}, h=${current.h}, f=${current.f}`,
      },
      currentNode: current.id,
      visitedNodes: Array.from(closedSet),
      visitedEdges: getShortestPathEdges(predecessors),
      queuedNodes: Array.from(openSet.keys()),
    }));

    // Get neighbors
    const neighbors = graph.edges
      .filter(e => e.from === current!.id || (!graph.directed && e.to === current!.id))
      .map(e => ({
        id: e.from === current!.id ? e.to : e.from,
        edgeWeight: e.weight ?? 1,
      }));

    for (const neighbor of neighbors) {
      // Skip if in closed set
      if (closedSet.has(neighbor.id)) {
        steps.push(createStep('custom', {
          state: {
            distances: { ...gScores },
            predecessors: { ...predecessors },
            comment: `Neighbor ${neighbor.id} already in closed set, skipping`,
          },
          currentNode: current.id,
          highlightEdges: [{ from: current.id, to: neighbor.id }],
          visitedNodes: Array.from(closedSet),
          visitedEdges: getShortestPathEdges(predecessors),
          queuedNodes: Array.from(openSet.keys()),
          rejectedNodes: [neighbor.id],
        }));
        continue;
      }

      // Calculate tentative g score
      const tentativeG = gScores[current.id] + neighbor.edgeWeight;
      const neighborH = heuristics[neighbor.id];
      const tentativeF = tentativeG + neighborH;

      steps.push(createStep('inspect-edge', {
        state: {
          distances: { ...gScores },
          predecessors: { ...predecessors },
          comment: `Checking ${current.id} → ${neighbor.id}: edge=${neighbor.edgeWeight}, tentative g=${tentativeG}, h=${neighborH}, f=${tentativeF}`,
        },
        currentNode: current.id,
        highlightNodes: [neighbor.id],
        highlightEdges: [{ from: current.id, to: neighbor.id }],
        visitedNodes: Array.from(closedSet),
        visitedEdges: getShortestPathEdges(predecessors),
        queuedNodes: Array.from(openSet.keys()),
      }));

      // Check if this path is better
      if (tentativeG < gScores[neighbor.id]) {
        // This is a better path
        predecessors[neighbor.id] = current.id;
        gScores[neighbor.id] = tentativeG;
        fScores[neighbor.id] = tentativeF;

        const isNew = !openSet.has(neighbor.id);
        
        openSet.set(neighbor.id, {
          id: neighbor.id,
          g: tentativeG,
          h: neighborH,
          f: tentativeF,
          parent: current.id,
        });

        const actionWord = isNew ? 'Added' : 'Updated';
        
        steps.push(createStep('relax-edge', {
          state: {
            distances: { ...gScores },
            predecessors: { ...predecessors },
            comment: `${actionWord} ${neighbor.id}: g=${tentativeG}, h=${neighborH}, f=${tentativeF}`,
          },
          currentNode: current.id,
          highlightNodes: [neighbor.id],
          highlightEdges: [{ from: current.id, to: neighbor.id }],
          visitedNodes: Array.from(closedSet),
          visitedEdges: getShortestPathEdges(predecessors),
          queuedNodes: Array.from(openSet.keys()),
        }));
      }
    }
  }

  // No path found
  steps.push(createStep('custom', {
    state: {
      distances: { ...gScores },
      predecessors: { ...predecessors },
      comment: `❌ No path found from ${startNode} to ${targetNode}`,
    },
    visitedNodes: Array.from(closedSet),
    queuedNodes: [],
  }));

  return {
    steps,
    pathFound: false,
    path: [],
    totalCost: Infinity,
    visitedCount: closedSet.size,
  };
}

// Helper to get A* steps only (for compatibility with existing runner)
export function astarSteps(
  graph: GraphModel,
  startNode: string,
  targetNode: string
): Step[] {
  return astar(graph, startNode, targetNode).steps;
}
