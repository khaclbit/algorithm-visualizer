import React, { useState } from 'react';
import { NodeModel } from '@/models/graph';
import { cn } from '@/lib/utils';

interface NodeProps {
  node: NodeModel;
  state: 'default' | 'current' | 'visited' | 'queued' | 'rejected' | 'start' | 'fw-intermediary' | 'fw-source' | 'fw-destination';
  isSelected: boolean;
  isEdgeStart: boolean;
  isStartNode: boolean;
  isTargetNode?: boolean;
  isDimmed?: boolean;
  highlightColor?: string;
  showWeight?: boolean; // Show heuristic weight (for A*)
  onWeightChange?: (nodeId: string, newWeight: number) => void;
  mode?: string;
  onClick: () => void;
  onMouseDown: (e: React.MouseEvent) => void;
}

export const Node: React.FC<NodeProps> = ({
  node,
  state,
  isSelected,
  isEdgeStart,
  isStartNode,
  isTargetNode = false,
  isDimmed = false,
  highlightColor,
  showWeight = false,
  onWeightChange,
  mode = 'select',
  onClick,
  onMouseDown,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState((node.weight ?? 0).toString());
  const [hasError, setHasError] = useState(false);

  const radius = 24;
  
  const getStateClass = () => {
    switch (state) {
      case 'current': return 'graph-node-current';
      case 'visited': return 'graph-node-visited';
      case 'queued': return 'graph-node-queued';
      case 'rejected': return 'graph-node-rejected';
      case 'start': return 'graph-node-start';
      case 'fw-intermediary': return 'graph-node-fw-intermediary';
      case 'fw-source': return 'graph-node-fw-source';
      case 'fw-destination': return 'graph-node-fw-destination';
      default: return 'graph-node-default';
    }
  };

  const handleWeightClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (mode === 'select' && showWeight) {
      setEditValue((node.weight ?? 0).toString());
      setIsEditing(true);
    }
  };

  const handleSubmit = () => {
    const newWeight = parseFloat(editValue);
    if (!isNaN(newWeight) && newWeight >= 0 && isFinite(newWeight)) {
      onWeightChange?.(node.id, newWeight);
      setIsEditing(false);
      setHasError(false);
    } else {
      setHasError(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();
    if (e.key === 'Enter') {
      handleSubmit();
    } else if (e.key === 'Escape') {
      setEditValue((node.weight ?? 0).toString());
      setIsEditing(false);
      setHasError(false);
    }
  };

  // Position for weight badge (bottom-right of node)
  const weightBadgeX = node.x + radius - 8;
  const weightBadgeY = node.y + radius - 8;

  return (
    <g
      className={cn("cursor-pointer", isDimmed && "opacity-20")}
      onClick={onClick}
      onMouseDown={onMouseDown}
    >
      {/* Selection ring */}
      {(isSelected || isEdgeStart) && (
        <circle
          cx={node.x}
          cy={node.y}
          r={radius + 6}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          strokeDasharray={isEdgeStart ? "4,4" : "none"}
          className="animate-pulse-glow"
        />
      )}
      
      {/* Start node indicator */}
      {isStartNode && state === 'default' && (
        <circle
          cx={node.x}
          cy={node.y}
          r={radius + 4}
          fill="none"
          stroke="hsl(var(--node-start))"
          strokeWidth={2}
        />
      )}

      {/* Target node indicator (for A*) */}
      {isTargetNode && state === 'default' && (
        <circle
          cx={node.x}
          cy={node.y}
          r={radius + 4}
          fill="none"
          stroke="hsl(var(--destructive))"
          strokeWidth={2}
          strokeDasharray="4,4"
        />
      )}
      
      {/* Main node circle */}
      <circle
        cx={node.x}
        cy={node.y}
        r={radius}
        className={cn('graph-node', getStateClass())}
      />
      
      {/* Node label */}
      <text
        x={node.x}
        y={node.y}
        textAnchor="middle"
        dominantBaseline="central"
        className="fill-foreground font-mono font-semibold text-sm pointer-events-none select-none"
      >
        {node.label || node.id}
      </text>

      {/* Heuristic weight badge (for A*) - clickable to edit */}
      {showWeight && (
        <g onClick={handleWeightClick} className="cursor-pointer">
          {isEditing ? (
            <foreignObject
              x={weightBadgeX - 20}
              y={weightBadgeY - 10}
              width={44}
              height={24}
            >
              <input
                type="number"
                min="0"
                step="1"
                value={editValue}
                onChange={(e) => {
                  setEditValue(e.target.value);
                  setHasError(false);
                }}
                onKeyDown={handleKeyDown}
                onBlur={handleSubmit}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                className={cn(
                  "w-full h-full text-xs text-center border rounded bg-card",
                  hasError ? "border-destructive" : "border-border"
                )}
                autoFocus
                aria-label={`Edit heuristic weight for node ${node.label || node.id}`}
                aria-invalid={hasError}
              />
            </foreignObject>
          ) : (
            <>
              {/* Weight badge background */}
              <rect
                x={weightBadgeX - 14}
                y={weightBadgeY - 10}
                width={28}
                height={20}
                rx={4}
                fill="hsl(var(--card))"
                stroke="hsl(var(--border))"
                strokeWidth={1}
                className="hover:stroke-primary transition-colors"
              />
              {/* Weight text */}
              <text
                x={weightBadgeX}
                y={weightBadgeY}
                textAnchor="middle"
                dominantBaseline="central"
                className="fill-muted-foreground font-mono text-[10px] pointer-events-none select-none"
              >
                h={node.weight ?? '?'}
              </text>
            </>
          )}
        </g>
      )}
    </g>
  );
};
