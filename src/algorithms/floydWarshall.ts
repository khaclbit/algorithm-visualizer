import { GraphModel } from '@/models/graph';
import { Step, createStep } from '@/models/step';

export function floydWarshall(graph: GraphModel): Step[] {
  const steps: Step[] = [];
  const nodes = graph.nodes.map(n => n.id);
  const n = nodes.length;
  const nodeIndex: Record<string, number> = {};
  
  nodes.forEach((id, i) => nodeIndex[id] = i);

  // Initialize distance matrix
  const dist: number[][] = Array(n).fill(null).map(() => Array(n).fill(Infinity));
  
  // Distance to self is 0
  for (let i = 0; i < n; i++) {
    dist[i][i] = 0;
  }

  // Add edge weights
  for (const edge of graph.edges) {
    const i = nodeIndex[edge.from];
    const j = nodeIndex[edge.to];
    const w = edge.weight ?? 1;
    dist[i][j] = w;
    if (!graph.directed) {
      dist[j][i] = w;
    }
  }

  const copyMatrix = (m: number[][]): number[][] => m.map(row => [...row]);

  steps.push(createStep('custom', {
    state: { 
      fwMatrix: copyMatrix(dist),
      fwNodes: [...nodes],
      comment: 'Initialized distance matrix with direct edges' 
    },
  }));

  // Floyd-Warshall main loop
  for (let k = 0; k < n; k++) {
    steps.push(createStep('custom', {
      state: { 
        fwMatrix: copyMatrix(dist),
        fwNodes: [...nodes],
        comment: `Considering paths through node ${nodes[k]} (k=${k})` 
      },
      highlightNodes: [nodes[k]],
    }));

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i === j || i === k || j === k) continue;
        
        const throughK = dist[i][k] + dist[k][j];
        
        if (throughK < dist[i][j]) {
          dist[i][j] = throughK;
          
          steps.push(createStep('matrix-update', {
            state: { 
              fwMatrix: copyMatrix(dist),
              fwNodes: [...nodes],
              comment: `dist[${nodes[i]}][${nodes[j]}] = ${throughK} (via ${nodes[k]})` 
            },
            highlightNodes: [nodes[i], nodes[j], nodes[k]],
          }));
        }
      }
    }
  }

  steps.push(createStep('custom', {
    state: { 
      fwMatrix: copyMatrix(dist),
      fwNodes: [...nodes],
      comment: 'Floyd-Warshall complete!' 
    },
  }));

  return steps;
}
