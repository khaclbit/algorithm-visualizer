import React, { useState } from 'react';
import { EdgeModel, NodeModel } from '@/models/graph';
import { cn } from '@/lib/utils';

interface EdgeProps {
  edge: EdgeModel;
  nodes: NodeModel[];
  isHighlighted: boolean;
  onClick: () => void;
  onWeightChange?: (edgeId: string, newWeight: number) => void;
  mode?: string;
}

export const Edge: React.FC<EdgeProps> = ({
  edge,
  nodes,
  isHighlighted,
  onClick,
  onWeightChange,
  mode = 'select',
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(edge.weight.toString());
  const [hasError, setHasError] = useState(false);

  const fromNode = nodes.find(n => n.id === edge.from);
  const toNode = nodes.find(n => n.id === edge.to);
  
  if (!fromNode || !toNode) return null;

  const nodeRadius = 24;
  
  // Calculate direction vector
  const dx = toNode.x - fromNode.x;
  const dy = toNode.y - fromNode.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  
  if (length === 0) return null;

  // Normalize and adjust start/end points to node edges
  const nx = dx / length;
  const ny = dy / length;
  
  const startX = fromNode.x + nx * nodeRadius;
  const startY = fromNode.y + ny * nodeRadius;
  const endX = toNode.x - nx * (nodeRadius + (edge.directed ? 10 : 0));
  const endY = toNode.y - ny * (nodeRadius + (edge.directed ? 10 : 0));

  // Calculate midpoint for weight label
  const midX = (fromNode.x + toNode.x) / 2;
  const midY = (fromNode.y + toNode.y) / 2;

  // Offset weight label perpendicular to the edge
  const perpX = -ny * 15;
  const perpY = nx * 15;

  const handleClick = (e: React.MouseEvent) => {
    if (mode === 'delete') {
      onClick();
    } else if (mode === 'select' && !isEditing) {
      setIsEditing(true);
    }
  };

  const handleSubmit = async () => {
    const newWeight = parseFloat(editValue);
    if (!isNaN(newWeight) && newWeight >= 0 && isFinite(newWeight)) {
      const success = await onWeightChange?.(edge.id, newWeight);
      if (success) {
        setIsEditing(false);
        setHasError(false);
      } else {
        setHasError(true);
      }
    } else {
      setHasError(true);
      // Keep editing mode to allow correction
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    } else if (e.key === 'Escape') {
      setEditValue(edge.weight.toString());
      setIsEditing(false);
    }
  };

  return (
    <g className="cursor-pointer" onClick={handleClick}>
      {/* Edge line */}
      <line
        x1={startX}
        y1={startY}
        x2={endX}
        y2={endY}
        className={cn(
          'graph-edge',
          isHighlighted && 'graph-edge-highlight',
          isEditing && 'stroke-blue-500'
        )}
        markerEnd={edge.directed ? (isHighlighted ? 'url(#arrowhead-highlight)' : 'url(#arrowhead)') : undefined}
      />
      
      {/* Invisible wider hitbox for easier clicking */}
      <line
        x1={startX}
        y1={startY}
        x2={endX}
        y2={endY}
        stroke="transparent"
        strokeWidth={12}
      />
      
      {/* Weight label or input */}
      {isEditing ? (
        <foreignObject
          x={midX + perpX - 20}
          y={midY + perpY - 12}
          width={40}
          height={24}
        >
          <input
            type="number"
            min="0"
            step="1"
            value={editValue}
            onChange={(e) => {
              setEditValue(e.target.value);
              setHasError(false); // Clear error on change
            }}
            onKeyDown={handleKeyDown}
            onBlur={handleSubmit}
            className={cn(
              "w-full h-full text-xs text-center border rounded bg-card",
              hasError ? "border-red-500" : "border-border"
            )}
            autoFocus
            aria-label={`Edit weight for edge from ${fromNode.label || fromNode.id} to ${toNode.label || toNode.id}`}
            aria-invalid={hasError}
          />
        </foreignObject>
      ) : (
        edge.weight !== undefined && (
          <g>
            <rect
              x={midX + perpX - 12}
              y={midY + perpY - 10}
              width={24}
              height={20}
              rx={4}
              fill="hsl(var(--card))"
              stroke="hsl(var(--border))"
              strokeWidth={1}
            />
            <text
              x={midX + perpX}
              y={midY + perpY}
              textAnchor="middle"
              dominantBaseline="central"
              className="fill-muted-foreground font-mono text-xs pointer-events-none select-none"
            >
              {edge.weight}
            </text>
          </g>
        )
      )}
    </g>
  );
};
