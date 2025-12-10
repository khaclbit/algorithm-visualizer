import GIF from 'gif.js';
import { GraphModel } from '@/models/graph';
import { Step, HighlightEdges } from '@/models/step';

interface GifExportOptions {
  width?: number;
  height?: number;
  delay?: number; // ms between frames
  quality?: number; // 1-30, lower is better
}

/**
 * Calculate the bounding box that contains all nodes with padding
 */
const calculateGraphBounds = (graph: GraphModel, padding: number = 60) => {
  if (graph.nodes.length === 0) {
    return { minX: 0, minY: 0, maxX: 800, maxY: 600 };
  }

  const minX = Math.min(...graph.nodes.map(n => n.x)) - padding;
  const maxX = Math.max(...graph.nodes.map(n => n.x)) + padding;
  const minY = Math.min(...graph.nodes.map(n => n.y)) - padding;
  const maxY = Math.max(...graph.nodes.map(n => n.y)) + padding;

  return { minX, minY, maxX, maxY };
};

/**
 * Get node state for a specific step (mirrors GraphCanvas logic)
 */
const getNodeStateForStep = (
  nodeId: string,
  step: Step | null,
  startNode: string | null,
  stepIndex: number
): string => {
  if (!step) return 'default';
  if (nodeId === startNode && stepIndex === 0) return 'start';
  if (step.currentNode === nodeId) return 'current';

  if (step.rejectedNodes?.includes(nodeId)) return 'rejected';

  if (typeof step.highlightNodes === 'object' && step.highlightNodes !== null) {
    const highlights = step.highlightNodes as any;
    if (highlights.intermediary?.includes(nodeId)) return 'fw-intermediary';
    if (highlights.source?.includes(nodeId)) return 'fw-source';
    if (highlights.destination?.includes(nodeId)) return 'fw-destination';
    if (highlights.nodes?.includes(nodeId)) return 'queued';
  }

  if (Array.isArray(step.highlightNodes) && step.highlightNodes.includes(nodeId)) return 'queued';
  if (step.visitedNodes?.includes(nodeId)) return 'visited';
  if (step.queuedNodes?.includes(nodeId)) return 'queued';
  return 'default';
};

/**
 * Check if edge is highlighted for a specific step
 */
const isEdgeHighlightedForStep = (from: string, to: string, step: Step | null): boolean => {
  if (!step?.highlightEdges) return false;
  
  // Handle legacy array format
  if (Array.isArray(step.highlightEdges)) {
    return step.highlightEdges.some(
      e => (e.from === from && e.to === to) || (e.from === to && e.to === from)
    );
  }
  
  // Handle new structured format
  const highlights = step.highlightEdges as HighlightEdges;
  const allEdges = [
    ...(highlights.edges || []),
    ...(highlights.oldPath || []),
    ...(highlights.newPath || [])
  ];
  
  return allEdges.some(
    e => (e.from === from && e.to === to) || (e.from === to && e.to === from)
  );
};

/**
 * Check if edge is visited for a specific step
 */
const isEdgeVisitedForStep = (from: string, to: string, step: Step | null): boolean => {
  if (!step?.visitedEdges) return false;
  return step.visitedEdges.some(
    e => (e.from === from && e.to === to) || (e.from === to && e.to === from)
  );
};

/**
 * Get the fill color for a node state
 */
const getNodeFillColor = (state: string): string => {
  const colors: Record<string, string> = {
    'default': '#e2e8f0',
    'current': '#22c55e',
    'start': '#a855f7',
    'queued': '#eab308',
    'visited': '#0ea5e9',
    'rejected': '#ef4444',
    'fw-source': '#22c55e',
    'fw-destination': '#a855f7',
    'fw-intermediary': '#f97316',
  };
  return colors[state] || colors.default;
};

/**
 * Create an SVG string for a specific algorithm step
 */
const createStepSvg = (
  graph: GraphModel,
  step: Step | null,
  stepIndex: number,
  startNode: string | null,
  bounds: { minX: number; minY: number; maxX: number; maxY: number },
  width: number,
  height: number
): string => {
  const viewBoxWidth = bounds.maxX - bounds.minX;
  const viewBoxHeight = bounds.maxY - bounds.minY;

  let edgesSvg = '';
  let nodesSvg = '';

  // Render edges
  graph.edges.forEach(edge => {
    const fromNode = graph.nodes.find(n => n.id === edge.from);
    const toNode = graph.nodes.find(n => n.id === edge.to);
    if (!fromNode || !toNode) return;

    const isHighlighted = isEdgeHighlightedForStep(edge.from, edge.to, step);
    const isVisited = isEdgeVisitedForStep(edge.from, edge.to, step);

    let strokeColor = '#94a3b8'; // default
    let strokeWidth = 2;
    if (isHighlighted) {
      strokeColor = '#22c55e';
      strokeWidth = 3;
    } else if (isVisited) {
      strokeColor = '#0ea5e9';
      strokeWidth = 2.5;
    }

    // Calculate edge line (shortened to not overlap with nodes)
    const dx = toNode.x - fromNode.x;
    const dy = toNode.y - fromNode.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const nodeRadius = 24;
    
    if (length > 0) {
      const startX = fromNode.x + (dx / length) * nodeRadius;
      const startY = fromNode.y + (dy / length) * nodeRadius;
      const endX = toNode.x - (dx / length) * nodeRadius;
      const endY = toNode.y - (dy / length) * nodeRadius;

      edgesSvg += `<line x1="${startX}" y1="${startY}" x2="${endX}" y2="${endY}" stroke="${strokeColor}" stroke-width="${strokeWidth}" />`;

      // Edge weight label
      if (edge.weight !== undefined) {
        const midX = (fromNode.x + toNode.x) / 2;
        const midY = (fromNode.y + toNode.y) / 2;
        edgesSvg += `<text x="${midX}" y="${midY - 8}" text-anchor="middle" font-size="12" fill="#64748b">${edge.weight}</text>`;
      }

      // Arrow for directed edges
      if (graph.directed || edge.directed) {
        const arrowSize = 8;
        const angle = Math.atan2(dy, dx);
        const arrowX = endX;
        const arrowY = endY;
        
        const p1x = arrowX - arrowSize * Math.cos(angle - Math.PI / 6);
        const p1y = arrowY - arrowSize * Math.sin(angle - Math.PI / 6);
        const p2x = arrowX - arrowSize * Math.cos(angle + Math.PI / 6);
        const p2y = arrowY - arrowSize * Math.sin(angle + Math.PI / 6);
        
        edgesSvg += `<polygon points="${arrowX},${arrowY} ${p1x},${p1y} ${p2x},${p2y}" fill="${strokeColor}" />`;
      }
    }
  });

  // Render nodes
  graph.nodes.forEach(node => {
    const state = getNodeStateForStep(node.id, step, startNode, stepIndex);
    const fillColor = getNodeFillColor(state);
    const isStart = node.id === startNode;

    nodesSvg += `<circle cx="${node.x}" cy="${node.y}" r="24" fill="${fillColor}" stroke="#1e293b" stroke-width="${isStart ? 3 : 2}" />`;
    nodesSvg += `<text x="${node.x}" y="${node.y + 5}" text-anchor="middle" font-size="14" font-weight="bold" fill="#1e293b">${node.label || node.id}</text>`;
  });

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="${bounds.minX} ${bounds.minY} ${viewBoxWidth} ${viewBoxHeight}">
      <rect x="${bounds.minX}" y="${bounds.minY}" width="${viewBoxWidth}" height="${viewBoxHeight}" fill="#ffffff" />
      ${edgesSvg}
      ${nodesSvg}
    </svg>
  `;
};

/**
 * Convert SVG string to canvas ImageData
 */
const svgToCanvas = (
  svgString: string,
  width: number,
  height: number
): Promise<HTMLCanvasElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error('Could not get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      resolve(canvas);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load SVG image'));
    };

    img.src = url;
  });
};

/**
 * Export algorithm visualization as animated GIF
 */
export const exportVisualizationToGif = async (
  graph: GraphModel,
  steps: Step[],
  startNode: string | null,
  options: GifExportOptions = {},
  onProgress?: (progress: number) => void
): Promise<void> => {
  const {
    width = 800,
    height = 600,
    delay = 500,
    quality = 10,
  } = options;

  if (steps.length === 0) {
    throw new Error('No algorithm steps to export. Please run an algorithm first.');
  }

  // Calculate bounds that fit the entire graph
  const bounds = calculateGraphBounds(graph);

  // Create GIF encoder
  const gif = new GIF({
    workers: 2,
    quality,
    width,
    height,
    workerScript: '/gif.worker.js',
  });

  // Generate frames for each step
  const totalSteps = steps.length;
  
  for (let i = 0; i < totalSteps; i++) {
    const step = steps[i];
    const svgString = createStepSvg(graph, step, i, startNode, bounds, width, height);
    
    try {
      const canvas = await svgToCanvas(svgString, width, height);
      gif.addFrame(canvas, { delay, copy: true });
      
      if (onProgress) {
        onProgress((i + 1) / totalSteps * 0.7); // 70% for frame generation
      }
    } catch (error) {
      console.error(`Failed to generate frame ${i}:`, error);
    }
  }

  // Add a longer delay on the last frame
  const lastStep = steps[steps.length - 1];
  const lastSvg = createStepSvg(graph, lastStep, steps.length - 1, startNode, bounds, width, height);
  try {
    const lastCanvas = await svgToCanvas(lastSvg, width, height);
    gif.addFrame(lastCanvas, { delay: delay * 3, copy: true }); // 3x delay on last frame
  } catch (error) {
    console.error('Failed to add final frame:', error);
  }

  // Render and download
  return new Promise((resolve, reject) => {
    gif.on('progress', (p: number) => {
      if (onProgress) {
        onProgress(0.7 + p * 0.3); // Last 30% for encoding
      }
    });

    gif.on('finished', (blob: Blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'algorithm-visualization.gif';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      resolve();
    });

    gif.on('error', (error: Error) => {
      reject(error);
    });

    gif.render();
  });
};
