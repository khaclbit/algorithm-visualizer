import { GraphModel, getEdgeBetween } from '@/models/graph';
import { Step, createStep } from '@/models/step';

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
        comment: `Processing node ${current} (distance: ${distances[current]})` 
      },
      currentNode: current,
      visitedNodes: Array.from(visited),
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
      if (visited.has(neighbor)) continue;

      steps.push(createStep('inspect-edge', {
        state: { 
          distances: { ...distances },
          comment: `Checking edge ${current} → ${neighbor} (weight: ${weight})` 
        },
        currentNode: current,
        highlightEdges: [{ from: current, to: neighbor }],
        visitedNodes: Array.from(visited),
        queuedNodes: [...queue],
      }));

      const newDist = distances[current] + weight;
      
      if (newDist < distances[neighbor]) {
        distances[neighbor] = newDist;
        predecessors[neighbor] = current;
        
        if (!queue.includes(neighbor)) {
          queue.push(neighbor);
        }

        steps.push(createStep('relax-edge', {
          state: { 
            distances: { ...distances },
            predecessors: { ...predecessors },
            comment: `Updated distance to ${neighbor}: ${newDist}` 
          },
          currentNode: current,
          highlightNodes: [neighbor],
          highlightEdges: [{ from: current, to: neighbor }],
          visitedNodes: Array.from(visited),
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
    queuedNodes: [],
  }));

  return steps;
}
