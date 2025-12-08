import React from 'react';
import { useGraph } from '@/context/GraphContext';
import { cn } from '@/lib/utils';

export const StatePanel: React.FC = () => {
  const { steps, currentStepIndex, isRunning, directed } = useGraph();

  const currentStep = currentStepIndex >= 0 ? steps[currentStepIndex] : null;
  const state = currentStep?.state;

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
