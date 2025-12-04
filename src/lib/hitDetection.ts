import { EdgeModel, NodeModel } from '../models/graph';

/**
 * Calculates the perpendicular distance from a point to a line segment
 */
export const pointToLineDistance = (
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.sqrt(dx * dx + dy * dy);

  if (length === 0) return Math.sqrt((px - x1) ** 2 + (py - y1) ** 2);

  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (length * length)));
  const closestX = x1 + t * dx;
  const closestY = y1 + t * dy;

  return Math.sqrt((px - closestX) ** 2 + (py - closestY) ** 2);
};

/**
 * Finds the edge at the given position within tolerance
 */
export const findEdgeAtPosition = (
  x: number,
  y: number,
  edges: EdgeModel[],
  nodes: NodeModel[],
  tolerance: number = 5
): EdgeModel | undefined => {
  const getNodeById = (id: string) => nodes.find(node => node.id === id);

  for (const edge of edges) {
    const source = getNodeById(edge.from);
    const target = getNodeById(edge.to);
    if (!source || !target) continue;

    const distance = pointToLineDistance(x, y, source.x, source.y, target.x, target.y);
    if (distance <= tolerance) return edge;
  }
  return undefined;
};