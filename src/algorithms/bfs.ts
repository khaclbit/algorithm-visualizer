import { GraphModel, getNeighbors } from '@/models/graph';
import { Step, createStep } from '@/models/step';

export function bfs(graph: GraphModel, startNode: string): Step[] {
  const steps: Step[] = [];
  const visited = new Set<string>();
  const queue: string[] = [];
  const distances: Record<string, number> = {};
  const predecessors: Record<string, string | null> = {};

  // Initialize
  distances[startNode] = 0;
  predecessors[startNode] = null;
  visited.add(startNode);
  queue.push(startNode);

  steps.push(createStep('custom', {
    state: { 
      queue: [...queue], 
      distances: { ...distances }, 
      predecessors: { ...predecessors },
      comment: `Starting BFS from node ${startNode}` 
    },
    currentNode: startNode,
    visitedNodes: [],
    queuedNodes: [startNode],
  }));

  while (queue.length > 0) {
    const current = queue.shift()!;
    
    steps.push(createStep('visit-node', {
      state: { 
        queue: [...queue], 
        distances: { ...distances },
        comment: `Visiting node ${current} (distance: ${distances[current]})` 
      },
      currentNode: current,
      visitedNodes: Array.from(visited),
      queuedNodes: [...queue],
    }));

    const neighbors = getNeighbors(graph, current);
    
    for (const neighbor of neighbors) {
      steps.push(createStep('inspect-edge', {
        state: { 
          queue: [...queue], 
          distances: { ...distances },
          comment: `Checking edge ${current} → ${neighbor}` 
        },
        currentNode: current,
        highlightEdges: [{ from: current, to: neighbor }],
        visitedNodes: Array.from(visited),
        queuedNodes: [...queue],
      }));

      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
        distances[neighbor] = distances[current] + 1;
        predecessors[neighbor] = current;

        steps.push(createStep('discover-node', {
          state: { 
            queue: [...queue], 
            distances: { ...distances },
            predecessors: { ...predecessors },
            comment: `Discovered ${neighbor}, distance: ${distances[neighbor]}` 
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
      comment: 'BFS complete!' 
    },
    visitedNodes: Array.from(visited),
    queuedNodes: [],
  }));

  return steps;
}
