import React from 'react';
import { NodeModel } from '@/models/graph';
import { cn } from '@/lib/utils';

interface NodeProps {
  node: NodeModel;
  state: 'default' | 'current' | 'visited' | 'queued' | 'start' | 'fw-intermediary' | 'fw-source' | 'fw-destination';
  isSelected: boolean;
  isEdgeStart: boolean;
  isStartNode: boolean;
  onClick: () => void;
  onMouseDown: (e: React.MouseEvent) => void;
}

export const Node: React.FC<NodeProps> = ({
  node,
  state,
  isSelected,
  isEdgeStart,
  isStartNode,
  onClick,
  onMouseDown,
}) => {
  const radius = 24;
  
  const getStateClass = () => {
    switch (state) {
      case 'current': return 'graph-node-current';
      case 'visited': return 'graph-node-visited';
      case 'queued': return 'graph-node-queued';
      case 'start': return 'graph-node-start';
      case 'fw-intermediary': return 'graph-node-fw-intermediary';
      case 'fw-source': return 'graph-node-fw-source';
      case 'fw-destination': return 'graph-node-fw-destination';
      default: return 'graph-node-default';
    }
  };

  return (
    <g
      className="cursor-pointer"
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
    </g>
  );
};
