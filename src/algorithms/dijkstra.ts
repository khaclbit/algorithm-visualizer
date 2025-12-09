import { GraphModel, getEdgeBetween } from '@/models/graph';
import { Step, createStep, EdgePointer } from '@/models/step';

// Helper to compute current shortest path edges from predecessors map
function getShortestPathEdges(predecessors: Record<string, string | null>): EdgePointer[] {
  const edges: EdgePointer[] = [];
  for (const [node, pred] of Object.entries(predecessors)) {
    if (pred !== null) {
      edges.push({ from: pred, to: node });
    }
  }
  return edges;
}

export function dijkstra(graph: GraphModel, startNode: string): Step[] {
  const steps: Step[] = [];
  const distances: Record<string, number> = {};
  const predecessors: Record<string, string | null> = {};
  const visited = new Set<string>();
  const queue: string[] = [];

  // Initialize distances
  for (const node of graph.nodes) {
    distances[node.id] = node.id === startNode ? 0 : Infinity;
    predecessors[node.id] = null;
  }
  queue.push(startNode);

  steps.push(createStep('custom', {
    state: { 
      distances: { ...distances },
      predecessors: { ...predecessors },
      comment: `Starting Dijkstra from node ${startNode}` 
    },
    currentNode: startNode,
    visitedNodes: [],
    visitedEdges: [],
    queuedNodes: [startNode],
  }));

  while (queue.length > 0) {
    // Find node with minimum distance in queue
    queue.sort((a, b) => distances[a] - distances[b]);
    const current = queue.shift()!;

    if (visited.has(current)) continue;
    if (distances[current] === Infinity) break;

    visited.add(current);

    steps.push(createStep('visit-node', {
      state: { 
        distances: { ...distances },
        predecessors: { ...predecessors },
        comment: `Processing node ${current} (distance: ${distances[current]})` 
      },
      currentNode: current,
      visitedNodes: Array.from(visited),
      visitedEdges: getShortestPathEdges(predecessors),
      queuedNodes: [...queue],
    }));

    // Check all neighbors
    const neighbors = graph.edges
      .filter(e => e.from === current || (!graph.directed && e.to === current))
      .map(e => ({
        node: e.from === current ? e.to : e.from,
        weight: e.weight ?? 1
      }));

    for (const { node: neighbor, weight } of neighbors) {
      steps.push(createStep('inspect-edge', {
        state: { 
          distances: { ...distances },
          predecessors: { ...predecessors },
          comment: `Checking edge ${current} → ${neighbor} (weight: ${weight})` 
        },
        currentNode: current,
        highlightEdges: [{ from: current, to: neighbor }],
        visitedNodes: Array.from(visited),
        visitedEdges: getShortestPathEdges(predecessors),
        queuedNodes: [...queue],
      }));

      if (visited.has(neighbor)) {
        // Node already processed - show rejection
        steps.push(createStep('custom', {
          state: { 
            distances: { ...distances },
            predecessors: { ...predecessors },
            comment: `Node ${neighbor} already processed, skipping` 
          },
          currentNode: current,
          highlightEdges: [{ from: current, to: neighbor }],
          visitedNodes: Array.from(visited),
          visitedEdges: getShortestPathEdges(predecessors),
          queuedNodes: [...queue],
          rejectedNodes: [neighbor],
        }));
        continue;
      }

      const newDist = distances[current] + weight;
      
      if (newDist < distances[neighbor]) {
        const oldPredecessor = predecessors[neighbor];
        const hadPreviousPath = oldPredecessor !== null;
        
        // Update to the new shorter path
        distances[neighbor] = newDist;
        predecessors[neighbor] = current;
        
        if (!queue.includes(neighbor)) {
          queue.push(neighbor);
        }

        // Create appropriate comment based on whether this is an update or first discovery
        const comment = hadPreviousPath
          ? `Found shorter path to ${neighbor}: ${newDist} (was via ${oldPredecessor}, now via ${current})`
          : `Discovered path to ${neighbor}: ${newDist} (via ${current})`;

        steps.push(createStep('relax-edge', {
          state: { 
            distances: { ...distances },
            predecessors: { ...predecessors },
            comment
          },
          currentNode: current,
          highlightNodes: [neighbor],
          highlightEdges: [{ from: current, to: neighbor }],
          visitedNodes: Array.from(visited),
          // visitedEdges now reflects the updated shortest path tree
          visitedEdges: getShortestPathEdges(predecessors),
          queuedNodes: [...queue],
        }));
      }
    }
  }

  steps.push(createStep('custom', {
    state: { 
      distances: { ...distances },
      predecessors: { ...predecessors },
      comment: 'Dijkstra complete!' 
    },
    visitedNodes: Array.from(visited),
    visitedEdges: getShortestPathEdges(predecessors),
    queuedNodes: [],
  }));

  return steps;
}
