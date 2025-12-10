export type StepType =
  | 'visit-node'
  | 'discover-node'
  | 'relax-edge'
  | 'inspect-edge'
  | 'update-distance'
  | 'matrix-update'
  | 'custom';

export interface EdgePointer {
  from: string;
  to: string;
}

export interface AlgorithmState {
  queue?: string[];
  stack?: string[];
  distances?: Record<string, number>;
  predecessors?: Record<string, string | null>;
  fwMatrix?: number[][];
  fwNodes?: string[];
  fwNext?: (string | null)[][];  // Predecessor matrix for path reconstruction
  comment?: string;
}

// Floyd-Warshall path update info
export interface FWPathUpdate {
  from: string;
  to: string;
  oldPath: string[];
  newPath: string[];
  oldEdges: EdgePointer[];
  newEdges: EdgePointer[];
}

export interface HighlightNodes {
  nodes?: string[];
  intermediary?: string[];
  source?: string[];
  destination?: string[];
}

// Edge highlight with styling info
export interface HighlightEdge extends EdgePointer {
  style?: 'default' | 'dashed' | 'path-old' | 'path-new';
  color?: string;  // Dynamic pair color
}

export interface HighlightEdges {
  edges?: HighlightEdge[];
  oldPath?: HighlightEdge[];  // Faded/dashed old path
  newPath?: HighlightEdge[];  // Highlighted new path
}

export interface Step {
  id: string;
  type: StepType;
  highlightNodes?: string[] | HighlightNodes;
  highlightEdges?: EdgePointer[] | HighlightEdges;
  visitedNodes?: string[];
  visitedEdges?: EdgePointer[];
  queuedNodes?: string[];
  rejectedNodes?: string[];
  currentNode?: string;
  state?: AlgorithmState;
  fwPathUpdate?: FWPathUpdate;  // Path update info for FW visualization
}

export const createStep = (
  type: StepType,
  overrides: Partial<Step> = {}
): Step => ({
  id: `step-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
  type,
  ...overrides,
});
