import React, { useState, useMemo } from 'react';
import { useGraph } from '@/context/GraphContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { reconstructFWPath, getFWDistance } from '@/algorithms/floydWarshall';
import { getPairColor } from '@/lib/pairColorHash';
import { Route, X } from 'lucide-react';

export const StatePanel: React.FC = () => {
  const { 
    steps, 
    currentStepIndex, 
    isRunning, 
    directed,
    selectedAlgorithm,
    graph,
    pathInspectionMode,
    setPathInspectionMode,
    inspectedPath,
    setInspectedPath
  } = useGraph();

  const currentStep = currentStepIndex >= 0 ? steps[currentStepIndex] : null;
  const state = currentStep?.state;

  // Get the final step's fwNext matrix for path reconstruction
  const finalStep = steps.length > 0 ? steps[steps.length - 1] : null;
  const canInspectPath = selectedAlgorithm === 'floyd-warshall' && 
                         finalStep?.state?.fwNext && 
                         currentStepIndex === steps.length - 1;

  // Calculate the inspected path
  const inspectedPathData = useMemo(() => {
    if (!pathInspectionMode || !inspectedPath.from || !inspectedPath.to || !finalStep?.state?.fwNext || !finalStep?.state?.fwNodes) {
      return null;
    }

    const path = reconstructFWPath(
      finalStep.state.fwNext,
      finalStep.state.fwNodes,
      inspectedPath.from,
      inspectedPath.to
    );

    const distance = getFWDistance(
      finalStep.state.fwMatrix!,
      finalStep.state.fwNodes,
      inspectedPath.from,
      inspectedPath.to
    );

    const color = getPairColor(inspectedPath.from, inspectedPath.to);

    return { path, distance, color };
  }, [pathInspectionMode, inspectedPath, finalStep]);

  const handleEnterInspectionMode = () => {
    setPathInspectionMode(true);
    setInspectedPath({ from: null, to: null });
  };

  const handleExitInspectionMode = () => {
    setPathInspectionMode(false);
    setInspectedPath({ from: null, to: null });
  };

  if (!isRunning || !currentStep) {
    return (
      <div className="panel h-full">
        <div className="panel-header">Algorithm State</div>
        <div className="p-4 text-center text-muted-foreground text-sm">
          Run an algorithm to see its state
        </div>
      </div>
    );
  }

  const renderQueue = () => {
    const items = state?.queue || state?.stack;
    const label = state?.queue ? 'Queue' : 'Stack';
    
    if (!items) return null;

    return (
      <div className="space-y-2">
        <div className="text-xs text-muted-foreground uppercase tracking-wider">{label}</div>
        <div className="flex flex-wrap gap-1">
          {items.length === 0 ? (
            <span className="text-muted-foreground text-sm">Empty</span>
          ) : (
            items.map((item, i) => (
              <span
                key={`${item}-${i}`}
                className={cn(
                  "state-badge",
                  i === 0 ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
                )}
              >
                {item}
              </span>
            ))
          )}
        </div>
      </div>
    );
  };

  const renderDistances = () => {
    if (!state?.distances) return null;

    return (
      <div className="space-y-2">
        <div className="text-xs text-muted-foreground uppercase tracking-wider">Distances</div>
        <div className="grid grid-cols-3 gap-1 text-sm font-mono">
          {Object.entries(state.distances).map(([node, dist]) => (
            <div key={node} className="flex items-center justify-between bg-muted/50 px-2 py-1 rounded">
              <span className="text-muted-foreground">{node}:</span>
              <span className={cn(
                dist === Infinity ? "text-destructive" : "text-primary"
              )}>
                {dist === Infinity ? '∞' : dist}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderMatrix = () => {
    if (!state?.fwMatrix || !state?.fwNodes) return null;

    const nodes = state.fwNodes;
    const matrix = state.fwMatrix;

    return (
      <div className="space-y-2">
        <div className="text-xs text-muted-foreground uppercase tracking-wider">Distance Matrix</div>
        <div className="overflow-x-auto">
          <table className="text-xs font-mono">
            <thead>
              <tr>
                <th className="p-1"></th>
                {nodes.map(n => (
                  <th key={n} className="p-1 text-primary">{n}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.map((row, i) => (
                <tr key={nodes[i]}>
                  <td className="p-1 text-primary">{nodes[i]}</td>
                  {row.map((val, j) => (
                    <td
                      key={j}
                      className={cn(
                        "p-1 text-center min-w-[24px]",
                        val === Infinity ? "text-muted-foreground" : "text-foreground"
                      )}
                    >
                      {val === Infinity ? '∞' : val}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderPathInspection = () => {
    if (!canInspectPath) return null;

    const nodeOptions = graph.nodes.map(n => n.id);

    return (
      <div className="space-y-3 p-3 bg-secondary/30 rounded-lg border border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Route className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Path Inspection</span>
          </div>
          {pathInspectionMode && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExitInspectionMode}
              className="h-6 px-2 text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              Exit
            </Button>
          )}
        </div>

        {!pathInspectionMode ? (
          <Button
            variant="outline"
            size="sm"
            onClick={handleEnterInspectionMode}
            className="w-full"
          >
            <Route className="h-4 w-4 mr-2" />
            Inspect Shortest Paths
          </Button>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">From</label>
                <Select
                  value={inspectedPath.from || ''}
                  onValueChange={(value) => setInspectedPath({ ...inspectedPath, from: value })}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {nodeOptions.map(node => (
                      <SelectItem key={node} value={node} disabled={node === inspectedPath.to}>
                        {node}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">To</label>
                <Select
                  value={inspectedPath.to || ''}
                  onValueChange={(value) => setInspectedPath({ ...inspectedPath, to: value })}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {nodeOptions.map(node => (
                      <SelectItem key={node} value={node} disabled={node === inspectedPath.from}>
                        {node}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {inspectedPathData && (
              <div className="space-y-2 p-2 bg-card rounded border border-border">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Path:</span>
                  <div 
                    className="flex items-center gap-1"
                    style={{ color: inspectedPathData.color }}
                  >
                    {inspectedPathData.path.length > 0 ? (
                      inspectedPathData.path.map((node, i) => (
                        <span key={i} className="font-mono text-sm font-semibold">
                          {node}{i < inspectedPathData.path.length - 1 && ' → '}
                        </span>
                      ))
                    ) : (
                      <span className="text-destructive text-sm">No path exists</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Distance:</span>
                  <span 
                    className="font-mono text-sm font-semibold"
                    style={{ color: inspectedPathData.color }}
                  >
                    {inspectedPathData.distance === Infinity ? '∞' : inspectedPathData.distance}
                  </span>
                </div>
                {/* Color indicator */}
                <div className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded-full border-2 border-foreground/20"
                    style={{ backgroundColor: inspectedPathData.color }}
                  />
                  <span className="text-xs text-muted-foreground">Pair color</span>
                </div>
              </div>
            )}

            {inspectedPath.from && inspectedPath.to && !inspectedPathData && (
              <div className="text-xs text-muted-foreground text-center py-2">
                Select both nodes to see the path
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Render FW path update info
  const renderPathUpdate = () => {
    const pathUpdate = currentStep?.fwPathUpdate;
    if (!pathUpdate) return null;

    const color = getPairColor(pathUpdate.from, pathUpdate.to);

    return (
      <div className="space-y-2 p-2 bg-primary/5 rounded border border-primary/20">
        <div className="text-xs text-muted-foreground uppercase tracking-wider">Path Update</div>
        <div className="text-xs space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Pair:</span>
            <span className="font-mono font-semibold" style={{ color }}>
              ({pathUpdate.from}, {pathUpdate.to})
            </span>
          </div>
          {pathUpdate.oldPath.length > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Old:</span>
              <span className="font-mono opacity-50 line-through">
                {pathUpdate.oldPath.join(' → ')}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">New:</span>
            <span className="font-mono font-semibold" style={{ color }}>
              {pathUpdate.newPath.join(' → ')}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="panel h-full flex flex-col">
      <div className="panel-header flex items-center justify-between">
        <span>Algorithm State</span>
        <span className="text-xs text-muted-foreground">
          {directed ? 'Directed' : 'Undirected'}
        </span>
      </div>
      <div className="p-4 space-y-4 flex-1 overflow-y-auto">
        {/* Comment/Message */}
        {state?.comment && (
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
            <p className="text-sm text-primary">{state.comment}</p>
          </div>
        )}

        {/* FW Path Update Info */}
        {renderPathUpdate()}

        {/* Path Inspection Mode */}
        {renderPathInspection()}

        {/* Queue/Stack */}
        {renderQueue()}

        {/* Distances */}
        {renderDistances()}

        {/* Matrix (Floyd-Warshall) */}
        {renderMatrix()}

        {/* Current step type */}
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground uppercase tracking-wider">Step Type</div>
          <span className="state-badge bg-secondary text-secondary-foreground">
            {currentStep.type}
          </span>
        </div>
      </div>
    </div>
  );
};
