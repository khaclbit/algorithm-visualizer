import { GraphModel, getNeighbors } from '@/models/graph';
import { Step, createStep, EdgePointer } from '@/models/step';

export function dfs(graph: GraphModel, startNode: string): Step[] {
  const steps: Step[] = [];
  const visited = new Set<string>();
  const visitedEdges: EdgePointer[] = [];
  const stack: string[] = [];
  const predecessors: Record<string, string | null> = {};

  predecessors[startNode] = null;
  stack.push(startNode);

  steps.push(createStep('custom', {
    state: { 
      stack: [...stack], 
      predecessors: { ...predecessors },
      comment: `Starting DFS from node ${startNode}` 
    },
    currentNode: startNode,
    visitedNodes: [],
    visitedEdges: [],
    queuedNodes: [startNode],
  }));

  while (stack.length > 0) {
    const current = stack.pop()!;
    
    if (visited.has(current)) {
      steps.push(createStep('custom', {
        state: { 
          stack: [...stack],
          comment: `Node ${current} already visited, skipping` 
        },
        visitedNodes: Array.from(visited),
        visitedEdges: [...visitedEdges],
        queuedNodes: [...stack],
      }));
      continue;
    }

    visited.add(current);
    
    steps.push(createStep('visit-node', {
      state: { 
        stack: [...stack],
        comment: `Visiting node ${current}` 
      },
      currentNode: current,
      visitedNodes: Array.from(visited),
      visitedEdges: [...visitedEdges],
      queuedNodes: [...stack],
    }));

    const neighbors = getNeighbors(graph, current).reverse();
    
    for (const neighbor of neighbors) {
      steps.push(createStep('inspect-edge', {
        state: { 
          stack: [...stack],
          comment: `Checking edge ${current} → ${neighbor}` 
        },
        currentNode: current,
        highlightEdges: [{ from: current, to: neighbor }],
        visitedNodes: Array.from(visited),
        visitedEdges: [...visitedEdges],
        queuedNodes: [...stack],
      }));

      if (!visited.has(neighbor)) {
        stack.push(neighbor);
        if (!(neighbor in predecessors)) {
          predecessors[neighbor] = current;
        }
        visitedEdges.push({ from: current, to: neighbor });

        steps.push(createStep('discover-node', {
          state: { 
            stack: [...stack],
            predecessors: { ...predecessors },
            comment: `Pushed ${neighbor} onto stack` 
          },
          currentNode: current,
          highlightNodes: [neighbor],
          highlightEdges: [{ from: current, to: neighbor }],
          visitedNodes: Array.from(visited),
          visitedEdges: [...visitedEdges],
          queuedNodes: [...stack],
        }));
      }
    }
  }

  steps.push(createStep('custom', {
    state: { 
      predecessors: { ...predecessors },
      comment: 'DFS complete!' 
    },
    visitedNodes: Array.from(visited),
    visitedEdges: [...visitedEdges],
    queuedNodes: [],
  }));

  return steps;
}
