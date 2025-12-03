import React from 'react';
import { useGraph } from '@/context/GraphContext';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Play, RotateCcw } from 'lucide-react';
import { bfs } from '@/algorithms/bfs';
import { dfs } from '@/algorithms/dfs';
import { dijkstra } from '@/algorithms/dijkstra';
import { floydWarshall } from '@/algorithms/floydWarshall';

type AlgorithmType = 'bfs' | 'dfs' | 'dijkstra' | 'floyd-warshall';

const algorithms: { id: AlgorithmType; name: string; needsStart: boolean }[] = [
  { id: 'bfs', name: 'Breadth-First Search', needsStart: true },
  { id: 'dfs', name: 'Depth-First Search', needsStart: true },
  { id: 'dijkstra', name: "Dijkstra's Algorithm", needsStart: true },
  { id: 'floyd-warshall', name: 'Floyd-Warshall', needsStart: false },
];

export const AlgorithmPanel: React.FC = () => {
  const {
    graph,
    startNode,
    setStartNode,
    setSteps,
    setCurrentStepIndex,
    isRunning,
    setIsRunning,
  } = useGraph();

  const [selectedAlgorithm, setSelectedAlgorithm] = React.useState<AlgorithmType>('bfs');

  const currentAlgo = algorithms.find(a => a.id === selectedAlgorithm)!;

  const handleRun = () => {
    if (currentAlgo.needsStart && !startNode) return;
    if (graph.nodes.length === 0) return;

    let steps;
    switch (selectedAlgorithm) {
      case 'bfs':
        steps = bfs(graph, startNode!);
        break;
      case 'dfs':
        steps = dfs(graph, startNode!);
        break;
      case 'dijkstra':
        steps = dijkstra(graph, startNode!);
        break;
      case 'floyd-warshall':
        steps = floydWarshall(graph);
        break;
    }

    setSteps(steps);
    setCurrentStepIndex(0);
    setIsRunning(true);
  };

  const handleReset = () => {
    setSteps([]);
    setCurrentStepIndex(-1);
    setIsRunning(false);
  };

  return (
    <div className="panel">
      <div className="panel-header">Algorithm</div>
      <div className="p-4 space-y-4">
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Select Algorithm</Label>
          <Select
            value={selectedAlgorithm}
            onValueChange={(v) => setSelectedAlgorithm(v as AlgorithmType)}
            disabled={isRunning}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {algorithms.map(algo => (
                <SelectItem key={algo.id} value={algo.id}>
                  {algo.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {currentAlgo.needsStart && (
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Start Node</Label>
            <Select
              value={startNode || ''}
              onValueChange={setStartNode}
              disabled={isRunning}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select start node" />
              </SelectTrigger>
              <SelectContent>
                {graph.nodes.map(node => (
                  <SelectItem key={node.id} value={node.id}>
                    {node.label || node.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={handleRun}
            disabled={isRunning || (currentAlgo.needsStart && !startNode) || graph.nodes.length === 0}
            className="flex-1"
          >
            <Play className="h-4 w-4 mr-2" />
            Run
          </Button>
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={!isRunning}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
