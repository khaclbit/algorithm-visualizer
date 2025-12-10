import React, { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { useGraph } from '@/context/GraphContext';
import { Node } from './Node';
import { Edge } from './Edge';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  isEdgeHighlighted as checkEdgeHighlighted, 
  isEdgeVisited as checkEdgeVisited, 
  getEdgeHighlightInfo 
} from '@/lib/stepHelpers';
import { reconstructFWPath } from '@/algorithms/floydWarshall';
import { getPairColor } from '@/lib/pairColorHash';
interface ViewBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const GraphCanvas: React.FC = () => {
  const {
    graph,
    addNode,
    updateNode,
    removeNode,
    addEdge,
    removeEdge,
    updateEdgeWeight,
    mode,
    selectedNode,
    setSelectedNode,
    edgeStartNode,
    setEdgeStartNode,
    steps,
    currentStepIndex,
    startNode,
    selectedAlgorithm,
    pathInspectionMode,
    inspectedPath,
  } = useGraph();

  const svgRef = useGraph().canvasSvgRef;
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragNode, setDragNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 });
  
  // Pan/zoom state
  const [viewBox, setViewBox] = useState<ViewBox>({ x: 0, y: 0, width: 800, height: 600 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [lastTouchDistance, setLastTouchDistance] = useState<number | null>(null);

  // Update container size and viewBox on mount and resize
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({ width: rect.width, height: rect.height });
        // Initialize viewBox to match container aspect ratio
        setViewBox(prev => ({
          ...prev,
          width: rect.width,
          height: rect.height
        }));
      }
    };
    
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Auto-fit when graph changes significantly (e.g., on load)
  const fitToView = useCallback(() => {
    if (graph.nodes.length === 0) {
      setViewBox({ x: 0, y: 0, width: containerSize.width, height: containerSize.height });
      return;
    }

    const padding = 60;
    const minX = Math.min(...graph.nodes.map(n => n.x)) - padding;
    const maxX = Math.max(...graph.nodes.map(n => n.x)) + padding;
    const minY = Math.min(...graph.nodes.map(n => n.y)) - padding;
    const maxY = Math.max(...graph.nodes.map(n => n.y)) + padding;

    const graphWidth = maxX - minX;
    const graphHeight = maxY - minY;
    
    // Maintain aspect ratio
    const containerAspect = containerSize.width / containerSize.height;
    const graphAspect = graphWidth / graphHeight;
    
    let newWidth, newHeight;
    if (graphAspect > containerAspect) {
      newWidth = graphWidth;
      newHeight = graphWidth / containerAspect;
    } else {
      newHeight = graphHeight;
      newWidth = graphHeight * containerAspect;
    }

    // Center the graph
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    setViewBox({
      x: centerX - newWidth / 2,
      y: centerY - newHeight / 2,
      width: newWidth,
      height: newHeight
    });
  }, [graph.nodes, containerSize]);

  const currentStep = currentStepIndex >= 0 ? steps[currentStepIndex] : null;

  // Get final step for path inspection
  const finalStep = steps.length > 0 ? steps[steps.length - 1] : null;

  // Compute inspected path edges
  const inspectedPathEdges = useMemo(() => {
    if (!pathInspectionMode || !inspectedPath.from || !inspectedPath.to) return null;
    if (!finalStep?.state?.fwNext || !finalStep?.state?.fwNodes) return null;

    const path = reconstructFWPath(
      finalStep.state.fwNext,
      finalStep.state.fwNodes,
      inspectedPath.from,
      inspectedPath.to
    );

    if (path.length < 2) return null;

    // Convert path to edge set for quick lookup
    const edges = new Set<string>();
    for (let i = 0; i < path.length - 1; i++) {
      // Store both directions for undirected graph lookup
      edges.add(`${path[i]}-${path[i + 1]}`);
      edges.add(`${path[i + 1]}-${path[i]}`);
    }

    const color = getPairColor(inspectedPath.from, inspectedPath.to);
    const pathNodes = new Set(path);

    return { edges, color, pathNodes };
  }, [pathInspectionMode, inspectedPath, finalStep]);

  const getNodeState = (nodeId: string) => {
    if (!currentStep) return 'default';
    if (nodeId === startNode && currentStepIndex === 0) return 'start';
    if (currentStep.currentNode === nodeId) return 'current';

    // Check for rejected nodes (already visited)
    if (currentStep.rejectedNodes?.includes(nodeId)) return 'rejected';

    // Handle structured highlighting (new format)
    if (typeof currentStep.highlightNodes === 'object' && currentStep.highlightNodes !== null) {
      const highlights = currentStep.highlightNodes as any; // Type assertion for now
      if (highlights.intermediary?.includes(nodeId)) return 'fw-intermediary';
      if (highlights.source?.includes(nodeId)) return 'fw-source';
      if (highlights.destination?.includes(nodeId)) return 'fw-destination';
      if (highlights.nodes?.includes(nodeId)) return 'queued';
    }

    // Handle legacy array format
    if (Array.isArray(currentStep.highlightNodes) && currentStep.highlightNodes.includes(nodeId)) return 'queued';

    if (currentStep.visitedNodes?.includes(nodeId)) return 'visited';
    if (currentStep.queuedNodes?.includes(nodeId)) return 'queued';
    return 'default';
  };

  const isEdgeHighlighted = (from: string, to: string) => {
    return checkEdgeHighlighted(currentStep, from, to);
  };

  const isEdgeVisited = (from: string, to: string) => {
    return checkEdgeVisited(currentStep, from, to);
  };

  const getEdgeInfo = (from: string, to: string) => {
    // Path inspection mode takes precedence
    if (inspectedPathEdges) {
      const key = `${from}-${to}`;
      if (inspectedPathEdges.edges.has(key)) {
        return {
          isHighlighted: true,
          isNewPath: true,
          color: inspectedPathEdges.color
        };
      }
    }
    return getEdgeHighlightInfo(currentStep, from, to);
  };

  const isEdgeDimmed = (from: string, to: string) => {
    if (!inspectedPathEdges) return false;
    const key = `${from}-${to}`;
    return !inspectedPathEdges.edges.has(key);
  };

  const isNodeDimmed = (nodeId: string) => {
    if (!inspectedPathEdges) return false;
    return !inspectedPathEdges.pathNodes.has(nodeId);
  };

  // Convert screen coordinates to SVG viewBox coordinates
  const getSvgCoords = useCallback((clientX: number, clientY: number) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = viewBox.width / rect.width;
    const scaleY = viewBox.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX + viewBox.x,
      y: (clientY - rect.top) * scaleY + viewBox.y,
    };
  }, [viewBox]);

  const handleZoom = useCallback((delta: number, centerX?: number, centerY?: number) => {
    const zoomFactor = delta > 0 ? 1.2 : 0.8;
    const minZoom = 100;
    const maxZoom = 5000;
    
    setViewBox(prev => {
      const newWidth = Math.max(minZoom, Math.min(maxZoom, prev.width * zoomFactor));
      const newHeight = Math.max(minZoom, Math.min(maxZoom, prev.height * zoomFactor));
      
      // Zoom toward center point if provided, otherwise zoom toward viewBox center
      const cx = centerX ?? (prev.x + prev.width / 2);
      const cy = centerY ?? (prev.y + prev.height / 2);
      
      const ratioX = (cx - prev.x) / prev.width;
      const ratioY = (cy - prev.y) / prev.height;
      
      return {
        x: cx - newWidth * ratioX,
        y: cy - newHeight * ratioY,
        width: newWidth,
        height: newHeight
      };
    });
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const { x, y } = getSvgCoords(e.clientX, e.clientY);
    handleZoom(e.deltaY, x, y);
  }, [getSvgCoords, handleZoom]);

  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    // Only start panning on middle mouse button or when in select mode and clicking empty space
    if (e.button === 1 || (e.target === svgRef.current && mode === 'select' && e.shiftKey)) {
      e.preventDefault();
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  }, [mode]);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target !== svgRef.current) return;
    
    if (mode === 'add-node') {
      const { x, y } = getSvgCoords(e.clientX, e.clientY);
      addNode(x, y);
    } else if (mode === 'add-edge' && edgeStartNode) {
      setEdgeStartNode(null);
    } else if (mode === 'select') {
      setSelectedNode(null);
    }
  }, [mode, edgeStartNode, getSvgCoords, addNode, setEdgeStartNode, setSelectedNode]);

  const handleNodeClick = useCallback((nodeId: string) => {
    if (mode === 'select') {
      setSelectedNode(nodeId === selectedNode ? null : nodeId);
    } else if (mode === 'add-edge') {
      if (!edgeStartNode) {
        setEdgeStartNode(nodeId);
      } else if (edgeStartNode !== nodeId) {
        addEdge(edgeStartNode, nodeId);
        setEdgeStartNode(null);
      }
    } else if (mode === 'delete') {
      removeNode(nodeId);
    }
  }, [mode, selectedNode, edgeStartNode, setSelectedNode, setEdgeStartNode, addEdge, removeNode]);

  const handleEdgeClick = useCallback((edgeId: string) => {
    if (mode === 'delete') {
      removeEdge(edgeId);
    }
  }, [mode, removeEdge]);

  const handleNodeMouseDown = useCallback((nodeId: string, e: React.MouseEvent) => {
    if (mode !== 'select') return;
    const node = graph.nodes.find(n => n.id === nodeId);
    if (!node) return;
    
    const { x, y } = getSvgCoords(e.clientX, e.clientY);
    setDragNode(nodeId);
    setDragOffset({ x: x - node.x, y: y - node.y });
  }, [mode, graph.nodes, getSvgCoords]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      const dx = e.clientX - panStart.x;
      const dy = e.clientY - panStart.y;
      const scaleX = viewBox.width / containerSize.width;
      const scaleY = viewBox.height / containerSize.height;
      
      setViewBox(prev => ({
        ...prev,
        x: prev.x - dx * scaleX,
        y: prev.y - dy * scaleY
      }));
      setPanStart({ x: e.clientX, y: e.clientY });
      return;
    }
    
    if (!dragNode) return;
    const { x, y } = getSvgCoords(e.clientX, e.clientY);
    updateNode(dragNode, {
      x: x - dragOffset.x,
      y: y - dragOffset.y,
    });
  }, [dragNode, dragOffset, getSvgCoords, updateNode, isPanning, panStart, viewBox, containerSize]);

  const handleMouseUp = useCallback(() => {
    setDragNode(null);
    setIsPanning(false);
  }, []);

  // Touch handlers for mobile pan/zoom
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      // Single touch - check if we're touching a node or empty space
      const touch = e.touches[0];
      if (e.target === svgRef.current) {
        setIsPanning(true);
        setPanStart({ x: touch.clientX, y: touch.clientY });
      }
    } else if (e.touches.length === 2) {
      // Two finger pinch - start zoom
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      setLastTouchDistance(distance);
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1 && isPanning) {
      const touch = e.touches[0];
      const dx = touch.clientX - panStart.x;
      const dy = touch.clientY - panStart.y;
      const scaleX = viewBox.width / containerSize.width;
      const scaleY = viewBox.height / containerSize.height;
      
      setViewBox(prev => ({
        ...prev,
        x: prev.x - dx * scaleX,
        y: prev.y - dy * scaleY
      }));
      setPanStart({ x: touch.clientX, y: touch.clientY });
    } else if (e.touches.length === 2 && lastTouchDistance !== null) {
      const newDistance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const delta = lastTouchDistance - newDistance;
      
      // Get center point between two fingers
      const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      const { x, y } = getSvgCoords(centerX, centerY);
      
      if (Math.abs(delta) > 5) {
        handleZoom(delta, x, y);
        setLastTouchDistance(newDistance);
      }
    }
  }, [isPanning, panStart, viewBox, containerSize, lastTouchDistance, getSvgCoords, handleZoom]);

  const handleTouchEnd = useCallback(() => {
    setIsPanning(false);
    setLastTouchDistance(null);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden">
      {/* Zoom controls */}
      <div className="absolute top-2 right-2 z-10 flex flex-col gap-1">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 bg-background/80 backdrop-blur-sm"
          onClick={() => handleZoom(-1)}
          title="Zoom In"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 bg-background/80 backdrop-blur-sm"
          onClick={() => handleZoom(1)}
          title="Zoom Out"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 bg-background/80 backdrop-blur-sm"
          onClick={fitToView}
          title="Fit to View"
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>

      <svg
        ref={svgRef}
        className="w-full h-full canvas-grid touch-none"
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
        preserveAspectRatio="xMidYMid meet"
        onClick={handleCanvasClick}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <defs>
          <marker
            id="arrowhead"
            markerWidth="6"
            markerHeight="4"
            refX="6"
            refY="2"
            orient="auto"
          >
            <polygon
              points="0 0, 6 2, 0 4"
              fill="hsl(var(--edge-default))"
            />
          </marker>
          <marker
            id="arrowhead-highlight"
            markerWidth="6"
            markerHeight="4"
            refX="6"
            refY="2"
            orient="auto"
          >
            <polygon
              points="0 0, 6 2, 0 4"
              fill="hsl(var(--edge-highlight))"
            />
          </marker>
          <marker
            id="arrowhead-visited"
            markerWidth="6"
            markerHeight="4"
            refX="6"
            refY="2"
            orient="auto"
          >
            <polygon
              points="0 0, 6 2, 0 4"
              fill="hsl(var(--edge-visited))"
            />
          </marker>
        </defs>

        {/* Edges */}
        {graph.edges.map(edge => (
          <Edge
            key={edge.id}
            edge={edge}
            nodes={graph.nodes}
            isHighlighted={isEdgeHighlighted(edge.from, edge.to)}
            isVisited={isEdgeVisited(edge.from, edge.to)}
            highlightInfo={getEdgeInfo(edge.from, edge.to)}
            onClick={() => handleEdgeClick(edge.id)}
            onWeightChange={updateEdgeWeight}
            mode={mode}
            isDimmed={isEdgeDimmed(edge.from, edge.to)}
          />
        ))}

        {/* Edge creation preview */}
        {edgeStartNode && mode === 'add-edge' && (
          <line
            x1={graph.nodes.find(n => n.id === edgeStartNode)?.x ?? 0}
            y1={graph.nodes.find(n => n.id === edgeStartNode)?.y ?? 0}
            x2={graph.nodes.find(n => n.id === edgeStartNode)?.x ?? 0}
            y2={graph.nodes.find(n => n.id === edgeStartNode)?.y ?? 0}
            className="graph-edge opacity-50"
            strokeDasharray="5,5"
          />
        )}

        {/* Nodes */}
        {graph.nodes.map(node => (
          <Node
            key={node.id}
            node={node}
            state={getNodeState(node.id)}
            isSelected={node.id === selectedNode}
            isEdgeStart={node.id === edgeStartNode}
            isStartNode={node.id === startNode}
            isDimmed={isNodeDimmed(node.id)}
            highlightColor={inspectedPathEdges?.pathNodes.has(node.id) ? inspectedPathEdges.color : undefined}
            onClick={() => handleNodeClick(node.id)}
            onMouseDown={(e) => handleNodeMouseDown(node.id, e)}
          />
        ))}
      </svg>
    </div>
  );
};
