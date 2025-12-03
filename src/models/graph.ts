export type NodeId = string;

export interface NodeModel {
  id: NodeId;
  label?: string;
  x: number;
  y: number;
}

export interface EdgeModel {
  id: string;
  from: NodeId;
  to: NodeId;
  weight?: number;
  directed?: boolean;
}

export interface GraphModel {
  nodes: NodeModel[];
  edges: EdgeModel[];
  directed?: boolean;
}

export const createNode = (id: string, x: number, y: number): NodeModel => ({
  id,
  label: id,
  x,
  y,
});

export const createEdge = (from: NodeId, to: NodeId, weight = 1, directed = false): EdgeModel => ({
  id: `e-${from}-${to}-${Date.now()}`,
  from,
  to,
  weight,
  directed,
});

export const getNeighbors = (graph: GraphModel, nodeId: string): string[] => {
  const neighbors = graph.edges
    .filter(e => e.from === nodeId || (!graph.directed && e.to === nodeId))
    .map(e => (e.from === nodeId ? e.to : e.from));
  return Array.from(new Set(neighbors));
};

export const getEdgeBetween = (graph: GraphModel, from: string, to: string): EdgeModel | undefined => {
  return graph.edges.find(
    e => (e.from === from && e.to === to) || (!graph.directed && e.from === to && e.to === from)
  );
};
