import React, { useState } from 'react';
import { useGraph, AlgorithmType } from '@/context/GraphContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Play, RotateCcw, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { bfs } from '@/algorithms/bfs';
import { dfs } from '@/algorithms/dfs';
import { dijkstra } from '@/algorithms/dijkstra';
import { floydWarshall } from '@/algorithms/floydWarshall';
import { astar, AStarResult } from '@/algorithms/astar';

const algorithms: { id: AlgorithmType; name: string; needsStart: boolean; needsTarget: boolean }[] = [
  { id: 'bfs', name: 'Breadth-First Search', needsStart: true, needsTarget: false },
  { id: 'dfs', name: 'Depth-First Search', needsStart: true, needsTarget: false },
  { id: 'dijkstra', name: "Dijkstra's Algorithm", needsStart: true, needsTarget: false },
  { id: 'floyd-warshall', name: 'Floyd-Warshall', needsStart: false, needsTarget: false },
  { id: 'astar', name: 'A* Algorithm', needsStart: true, needsTarget: true },
];

export const AlgorithmPanel: React.FC = () => {
  const {
    graph,
    startNode,
    setStartNode,
    targetNode,
    setTargetNode,
    setSteps,
    setCurrentStepIndex,
    isRunning,
    setIsRunning,
    selectedAlgorithm,
    setSelectedAlgorithm,
  } = useGraph();

  // A* result state for summary display
  const [astarResult, setAstarResult] = useState<AStarResult | null>(null);

  const currentAlgo = algorithms.find(a => a.id === selectedAlgorithm)!;
  const isAstar = selectedAlgorithm === 'astar';

  // Check if all nodes have weights (required for A*)
  const nodesWithoutWeight = graph.nodes.filter(n => n.weight === undefined || n.weight === null);
  const hasAllNodeWeights = nodesWithoutWeight.length === 0;

  const handleRun = () => {
    if (currentAlgo.needsStart && !startNode) return;
    if (currentAlgo.needsTarget && !targetNode) return;
    if (isAstar && !hasAllNodeWeights) return;
    if (graph.nodes.length === 0) return;

    let steps;
    setAstarResult(null); // Clear previous A* result

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
      case 'astar':
        const result = astar(graph, startNode!, targetNode!);
        steps = result.steps;
        setAstarResult(result);
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
    setAstarResult(null);
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
                    {isAstar && node.weight !== undefined && ` (h=${node.weight})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {currentAlgo.needsTarget && (
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Target Node</Label>
            <Select
              value={targetNode || ''}
              onValueChange={setTargetNode}
              disabled={isRunning}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select target node" />
              </SelectTrigger>
              <SelectContent>
                {graph.nodes.map(node => (
                  <SelectItem key={node.id} value={node.id}>
                    {node.label || node.id}
                    {isAstar && node.weight !== undefined && ` (h=${node.weight})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {isAstar && !hasAllNodeWeights && (
          <Alert variant="destructive" className="py-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              A* requires heuristic weights for all nodes. 
              {nodesWithoutWeight.length > 0 && (
                <span className="block mt-1">
                  Missing: {nodesWithoutWeight.slice(0, 3).map(n => n.label || n.id).join(', ')}
                  {nodesWithoutWeight.length > 3 && ` +${nodesWithoutWeight.length - 3} more`}
                </span>
              )}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2">
          <Button
            onClick={handleRun}
            disabled={
              isRunning || 
              (currentAlgo.needsStart && !startNode) || 
              (currentAlgo.needsTarget && !targetNode) ||
              (isAstar && !hasAllNodeWeights) ||
              graph.nodes.length === 0
            }
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

        {/* A* Result Summary */}
        {isAstar && astarResult && (
          <div className={cn(
            "rounded-lg border p-3 space-y-2 animate-fade-in",
            astarResult.pathFound 
              ? "border-green-500/50 bg-green-500/10" 
              : "border-destructive/50 bg-destructive/10"
          )}>
            <div className="flex items-center gap-2">
              {astarResult.pathFound ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-destructive" />
              )}
              <span className="text-sm font-medium">
                {astarResult.pathFound ? 'Path Found!' : 'No Path Found'}
              </span>
            </div>
            
            {astarResult.pathFound && (
              <>
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium">Path:</span>{' '}
                  <span className="font-mono">{astarResult.path.join(' → ')}</span>
                </div>
                <div className="flex gap-4 text-xs">
                  <div>
                    <span className="text-muted-foreground">Total Cost:</span>{' '}
                    <span className="font-semibold">{astarResult.totalCost}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Visited:</span>{' '}
                    <span className="font-semibold">{astarResult.visitedCount} nodes</span>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
