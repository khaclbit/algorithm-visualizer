import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect, useRef, RefObject } from 'react';
import { GraphModel, NodeModel, EdgeModel, createNode, createEdge } from '@/models/graph';
import { Step } from '@/models/step';
import { isValidWeight } from '@/lib/validation';
import { saveGraphState, loadGraphState } from '@/lib/graphPersistence';
import { exportCanvasToPng } from '@/lib/canvasExport';
import { exportVisualizationToGif } from '@/lib/gifExport';

export type InteractionMode = 'select' | 'add-node' | 'add-edge' | 'delete';

export type AlgorithmType = 'bfs' | 'dfs' | 'dijkstra' | 'floyd-warshall' | 'astar';

interface GraphContextType {
  graph: GraphModel;
  setGraph: (graph: GraphModel) => void;
  addNode: (x: number, y: number) => void;
  removeNode: (id: string) => void;
  updateNode: (id: string, updates: Partial<NodeModel>) => void;
  addEdge: (from: string, to: string, weight?: number) => void;
  removeEdge: (id: string) => void;
  updateEdge: (id: string, updates: Partial<EdgeModel>) => void;
  updateEdgeWeight: (edgeId: string, weight: number) => Promise<boolean>;
  updateNodeWeight: (nodeId: string, weight: number) => Promise<boolean>;
  clearGraph: () => void;
  
  mode: InteractionMode;
  setMode: (mode: InteractionMode) => void;
  
  selectedNode: string | null;
  setSelectedNode: (id: string | null) => void;
  edgeStartNode: string | null;
  setEdgeStartNode: (id: string | null) => void;
  
  steps: Step[];
  setSteps: (steps: Step[]) => void;
  currentStepIndex: number;
  setCurrentStepIndex: (index: number) => void;
  isRunning: boolean;
  setIsRunning: (running: boolean) => void;
  
  startNode: string | null;
  setStartNode: (id: string | null) => void;
  targetNode: string | null;
  setTargetNode: (id: string | null) => void;

  // Algorithm selection
  selectedAlgorithm: AlgorithmType;
  setSelectedAlgorithm: (algorithm: AlgorithmType) => void;

  // Direction toggle
  directed: boolean;
  setDirected: (directed: boolean) => void;
  toggleDirection: () => Promise<void>;

  // Canvas export
  canvasSvgRef: RefObject<SVGSVGElement>;
  exportCanvasAsImage: () => void;
  exportAsGif: () => Promise<void>;
  isExportingGif: boolean;
  gifExportProgress: number;

  // Path inspection mode (for Floyd-Warshall)
  pathInspectionMode: boolean;
  setPathInspectionMode: (mode: boolean) => void;
  inspectedPath: { from: string | null; to: string | null };
  setInspectedPath: (path: { from: string | null; to: string | null }) => void;
}

const GraphContext = createContext<GraphContextType | null>(null);

const generateNodeId = (existingNodes: NodeModel[]): string => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let i = 0; i < 26; i++) {
    const id = alphabet[i];
    if (!existingNodes.find(n => n.id === id)) return id;
  }
  return `N${existingNodes.length + 1}`;
};

const defaultGraph: GraphModel = {
  nodes: [
    { id: 'A', label: 'A', x: 150, y: 100 },
    { id: 'B', label: 'B', x: 300, y: 100 },
    { id: 'C', label: 'C', x: 450, y: 100 },
    { id: 'D', label: 'D', x: 150, y: 250 },
    { id: 'E', label: 'E', x: 300, y: 250 },
    { id: 'F', label: 'F', x: 450, y: 250 },
  ],
  edges: [
    { id: 'e1', from: 'A', to: 'B', weight: 1 },
    { id: 'e2', from: 'B', to: 'C', weight: 2 },
    { id: 'e3', from: 'A', to: 'D', weight: 3 },
    { id: 'e4', from: 'B', to: 'E', weight: 1 },
    { id: 'e5', from: 'C', to: 'F', weight: 2 },
    { id: 'e6', from: 'D', to: 'E', weight: 1 },
    { id: 'e7', from: 'E', to: 'F', weight: 1 },
  ],
  directed: false,
};

export const GraphProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [graph, setGraph] = useState<GraphModel>(() => {
    const saved = loadGraphState();
    return saved || defaultGraph;
  });
  const [mode, setMode] = useState<InteractionMode>('select');
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [edgeStartNode, setEdgeStartNode] = useState<string | null>(null);
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [isRunning, setIsRunning] = useState(false);
  const [startNode, setStartNode] = useState<string | null>('A');
  const [targetNode, setTargetNode] = useState<string | null>(null);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<AlgorithmType>('bfs');
  const canvasSvgRef = useRef<SVGSVGElement>(null);
  const [isExportingGif, setIsExportingGif] = useState(false);
  const [gifExportProgress, setGifExportProgress] = useState(0);

  // Path inspection mode state
  const [pathInspectionMode, setPathInspectionMode] = useState(false);
  const [inspectedPath, setInspectedPath] = useState<{ from: string | null; to: string | null }>({ from: null, to: null });

  const exportCanvasAsImage = useCallback(() => {
    if (canvasSvgRef.current) {
      exportCanvasToPng(canvasSvgRef.current, 'graph.png');
    }
  }, []);

  const exportAsGif = useCallback(async () => {
    if (steps.length === 0) {
      throw new Error('No algorithm steps to export. Please run an algorithm first.');
    }
    
    setIsExportingGif(true);
    setGifExportProgress(0);
    
    try {
      await exportVisualizationToGif(
        graph,
        steps,
        startNode,
        { width: 800, height: 600, delay: 500 },
        (progress) => setGifExportProgress(progress)
      );
    } finally {
      setIsExportingGif(false);
      setGifExportProgress(0);
    }
  }, [graph, steps, startNode]);

  // Save graph state to localStorage whenever it changes
  useEffect(() => {
    saveGraphState(graph);
  }, [graph]);

  const addNode = useCallback((x: number, y: number) => {
    const id = generateNodeId(graph.nodes);
    const newNode = createNode(id, x, y);
    setGraph(prev => ({
      ...prev,
      nodes: [...prev.nodes, newNode],
    }));
  }, [graph.nodes]);

  const removeNode = useCallback((id: string) => {
    setGraph(prev => ({
      ...prev,
      nodes: prev.nodes.filter(n => n.id !== id),
      edges: prev.edges.filter(e => e.from !== id && e.to !== id),
    }));
    if (selectedNode === id) setSelectedNode(null);
    if (startNode === id) setStartNode(null);
    if (targetNode === id) setTargetNode(null);
  }, [selectedNode, startNode, targetNode]);

  const updateNode = useCallback((id: string, updates: Partial<NodeModel>) => {
    setGraph(prev => ({
      ...prev,
      nodes: prev.nodes.map(n => n.id === id ? { ...n, ...updates } : n),
    }));
  }, []);

  const addEdge = useCallback((from: string, to: string, weight = 1) => {
    const existingEdge = graph.edges.find(
      e => (e.from === from && e.to === to) || (!graph.directed && e.from === to && e.to === from)
    );
    if (existingEdge || from === to) return;
    
    const newEdge = createEdge(from, to, weight, graph.directed);
    setGraph(prev => ({
      ...prev,
      edges: [...prev.edges, newEdge],
    }));
  }, [graph.edges, graph.directed]);

  const removeEdge = useCallback((id: string) => {
    setGraph(prev => ({
      ...prev,
      edges: prev.edges.filter(e => e.id !== id),
    }));
  }, []);

  const updateEdge = useCallback((id: string, updates: Partial<EdgeModel>) => {
    setGraph(prev => ({
      ...prev,
      edges: prev.edges.map(e => e.id === id ? { ...e, ...updates } : e),
    }));
  }, []);

  const updateEdgeWeight = useCallback(async (edgeId: string, weight: number): Promise<boolean> => {
    if (!isValidWeight(weight)) {
      return false;
    }

    const edgeExists = graph.edges.some(e => e.id === edgeId);
    if (!edgeExists) {
      return false;
    }

    setGraph(prev => ({
      ...prev,
      edges: prev.edges.map(e => e.id === edgeId ? { ...e, weight } : e),
    }));

    // Reset algorithm state since weights changed
    setSteps([]);
    setCurrentStepIndex(-1);
    setIsRunning(false);

    return true;
  }, [graph.edges]);

  const updateNodeWeight = useCallback(async (nodeId: string, weight: number): Promise<boolean> => {
    if (weight < 0 || !isFinite(weight) || isNaN(weight)) {
      return false;
    }

    const nodeExists = graph.nodes.some(n => n.id === nodeId);
    if (!nodeExists) {
      return false;
    }

    setGraph(prev => ({
      ...prev,
      nodes: prev.nodes.map(n => n.id === nodeId ? { ...n, weight } : n),
    }));

    // Reset algorithm state since weights changed
    setSteps([]);
    setCurrentStepIndex(-1);
    setIsRunning(false);

    return true;
  }, [graph.nodes]);

  const clearGraph = useCallback(() => {
    setGraph({ nodes: [], edges: [], directed: false });
    setSelectedNode(null);
    setStartNode(null);
    setSteps([]);
    setCurrentStepIndex(-1);
  }, []);

  const setDirected = useCallback((directed: boolean) => {
    setGraph(prev => ({ ...prev, directed }));
  }, []);

  const toggleDirection = useCallback(async () => {
    const newDirected = !graph.directed;
    
    if (newDirected) {
      // Undirected → Directed: All edges become directed
      setGraph(prev => ({
        ...prev,
        directed: true,
        edges: prev.edges.map(edge => ({ ...edge, directed: true }))
      }));
    } else {
      // Directed → Undirected: Merge conflicting edges
      const edgeMap = new Map<string, EdgeModel>();
      
      graph.edges.forEach(edge => {
        const key = [edge.from, edge.to].sort().join('-');
        if (!edgeMap.has(key)) {
          edgeMap.set(key, { ...edge, directed: false });
        }
        // If conflict exists, keep the first edge encountered
      });
      
      setGraph(prev => ({
        ...prev,
        directed: false,
        edges: Array.from(edgeMap.values())
      }));
    }
    
    // Reset algorithm state when direction changes
    setSteps([]);
    setCurrentStepIndex(-1);
    setIsRunning(false);
  }, [graph.directed, graph.edges]);

  return (
    <GraphContext.Provider value={{
      graph,
      setGraph,
      addNode,
      removeNode,
      updateNode,
      addEdge,
      removeEdge,
      updateEdge,
      updateEdgeWeight,
      updateNodeWeight,
      clearGraph,
      mode,
      setMode,
      selectedNode,
      setSelectedNode,
      edgeStartNode,
      setEdgeStartNode,
      steps,
      setSteps,
      currentStepIndex,
      setCurrentStepIndex,
      isRunning,
      setIsRunning,
      startNode,
      setStartNode,
      targetNode,
      setTargetNode,
      directed: graph.directed ?? false,
      setDirected,
      toggleDirection,
      selectedAlgorithm,
      setSelectedAlgorithm,
      canvasSvgRef,
      exportCanvasAsImage,
      exportAsGif,
      isExportingGif,
      gifExportProgress,
      pathInspectionMode,
      setPathInspectionMode,
      inspectedPath,
      setInspectedPath,
    }}>
      {children}
    </GraphContext.Provider>
  );
};

export const useGraph = () => {
  const context = useContext(GraphContext);
  if (!context) throw new Error('useGraph must be used within GraphProvider');
  return context;
};
