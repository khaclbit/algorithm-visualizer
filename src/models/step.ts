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
  comment?: string;
}

export interface HighlightNodes {
  nodes?: string[];
  intermediary?: string[];
  source?: string[];
  destination?: string[];
}

export interface Step {
  id: string;
  type: StepType;
  highlightNodes?: string[] | HighlightNodes;
  highlightEdges?: EdgePointer[];
  visitedNodes?: string[];
  visitedEdges?: EdgePointer[];
  queuedNodes?: string[];
  rejectedNodes?: string[];
  currentNode?: string;
  state?: AlgorithmState;
}

export const createStep = (
  type: StepType,
  overrides: Partial<Step> = {}
): Step => ({
  id: `step-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
  type,
  ...overrides,
});
