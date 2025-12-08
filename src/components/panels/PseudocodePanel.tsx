import React from 'react';
import { useGraph } from '@/context/GraphContext';
import { StepType } from '@/models/step';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PseudocodeLine {
  line: string;
  indent: number;
  stepTypes?: StepType[];
}

const bfsPseudocode: PseudocodeLine[] = [
  { line: 'BFS(G, start):', indent: 0 },
  { line: 'queue ← [start]', indent: 1, stepTypes: ['custom'] },
  { line: 'visited ← {start}', indent: 1, stepTypes: ['custom'] },
  { line: 'while queue is not empty:', indent: 1 },
  { line: 'u ← queue.dequeue()', indent: 2, stepTypes: ['visit-node'] },
  { line: 'for each neighbor v of u:', indent: 2, stepTypes: ['inspect-edge'] },
  { line: 'if v not in visited:', indent: 3, stepTypes: ['discover-node'] },
  { line: 'visited.add(v)', indent: 4 },
  { line: 'queue.enqueue(v)', indent: 4 },
];

const dfsPseudocode: PseudocodeLine[] = [
  { line: 'DFS(G, start):', indent: 0 },
  { line: 'stack ← [start]', indent: 1, stepTypes: ['custom'] },
  { line: 'visited ← {}', indent: 1, stepTypes: ['custom'] },
  { line: 'while stack is not empty:', indent: 1 },
  { line: 'u ← stack.pop()', indent: 2, stepTypes: ['visit-node'] },
  { line: 'if u not in visited:', indent: 2 },
  { line: 'visited.add(u)', indent: 3 },
  { line: 'for each neighbor v of u:', indent: 3, stepTypes: ['inspect-edge'] },
  { line: 'if v not in visited:', indent: 4, stepTypes: ['discover-node'] },
  { line: 'stack.push(v)', indent: 5 },
];

const dijkstraPseudocode: PseudocodeLine[] = [
  { line: "Dijkstra(G, start):", indent: 0 },
  { line: 'dist[v] ← ∞ for all v', indent: 1, stepTypes: ['custom'] },
  { line: 'dist[start] ← 0', indent: 1, stepTypes: ['custom'] },
  { line: 'pq ← [(0, start)]', indent: 1 },
  { line: 'while pq is not empty:', indent: 1 },
  { line: 'u ← pq.extractMin()', indent: 2, stepTypes: ['visit-node'] },
  { line: 'for each neighbor v of u:', indent: 2, stepTypes: ['inspect-edge'] },
  { line: 'alt ← dist[u] + weight(u, v)', indent: 3, stepTypes: ['relax-edge'] },
  { line: 'if alt < dist[v]:', indent: 3, stepTypes: ['update-distance'] },
  { line: 'dist[v] ← alt', indent: 4 },
  { line: 'pq.decreaseKey(v, alt)', indent: 4 },
];

const floydWarshallPseudocode: PseudocodeLine[] = [
  { line: 'FloydWarshall(G):', indent: 0 },
  { line: 'dist ← |V| × |V| matrix', indent: 1, stepTypes: ['custom'] },
  { line: 'dist[i][j] ← weight(i,j) or ∞', indent: 1 },
  { line: 'dist[i][i] ← 0 for all i', indent: 1 },
  { line: 'for k from 1 to |V|:', indent: 1 },
  { line: 'for i from 1 to |V|:', indent: 2 },
  { line: 'for j from 1 to |V|:', indent: 3 },
  { line: 'if dist[i][k] + dist[k][j] < dist[i][j]:', indent: 4, stepTypes: ['matrix-update'] },
  { line: 'dist[i][j] ← dist[i][k] + dist[k][j]', indent: 5 },
];

const pseudocodeMap: Record<string, PseudocodeLine[]> = {
  bfs: bfsPseudocode,
  dfs: dfsPseudocode,
  dijkstra: dijkstraPseudocode,
  'floyd-warshall': floydWarshallPseudocode,
};

export const PseudocodePanel: React.FC = () => {
  const { selectedAlgorithm, steps, currentStepIndex } = useGraph();
  
  const pseudocode = pseudocodeMap[selectedAlgorithm] || bfsPseudocode;
  const currentStep = currentStepIndex >= 0 && currentStepIndex < steps.length 
    ? steps[currentStepIndex] 
    : null;

  const isLineHighlighted = (line: PseudocodeLine): boolean => {
    if (!currentStep || !line.stepTypes) return false;
    return line.stepTypes.includes(currentStep.type);
  };

  return (
    <div className="panel h-full flex flex-col">
      <div className="panel-header">Pseudocode</div>
      <ScrollArea className="flex-1">
        <div className="p-3 font-mono text-xs space-y-0.5">
          {pseudocode.map((line, index) => (
            <div
              key={index}
              className={`py-1 px-2 rounded transition-colors duration-200 ${
                isLineHighlighted(line)
                  ? 'bg-primary/20 text-primary font-medium border-l-2 border-primary'
                  : 'text-muted-foreground hover:bg-muted/50'
              }`}
              style={{ paddingLeft: `${line.indent * 16 + 8}px` }}
            >
              {line.line}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
