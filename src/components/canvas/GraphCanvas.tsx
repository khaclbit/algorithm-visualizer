import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useGraph } from '@/context/GraphContext';
import { Node } from './Node';
import { Edge } from './Edge';

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
  } = useGraph();

  const svgRef = useRef<SVGSVGElement>(null);
  const [dragNode, setDragNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });

  // Update canvas size on mount and resize
  useEffect(() => {
    const updateSize = () => {
      if (svgRef.current) {
        const rect = svgRef.current.getBoundingClientRect();
        setCanvasSize({ width: rect.width, height: rect.height });
      }
    };
    
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const currentStep = currentStepIndex >= 0 ? steps[currentStepIndex] : null;

  const getNodeState = (nodeId: string) => {
    if (!currentStep) return 'default';
    if (nodeId === startNode && currentStepIndex === 0) return 'start';
    if (currentStep.currentNode === nodeId) return 'current';
    if (currentStep.highlightNodes?.includes(nodeId)) return 'queued';
    if (currentStep.visitedNodes?.includes(nodeId)) return 'visited';
    if (currentStep.queuedNodes?.includes(nodeId)) return 'queued';
    return 'default';
  };

  const isEdgeHighlighted = (from: string, to: string) => {
    if (!currentStep?.highlightEdges) return false;
    return currentStep.highlightEdges.some(
      e => (e.from === from && e.to === to) || (e.from === to && e.to === from)
    );
  };

  const getSvgCoords = useCallback((e: React.MouseEvent) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }, []);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target !== svgRef.current) return;
    
    if (mode === 'add-node') {
      const { x, y } = getSvgCoords(e);
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
    
    const { x, y } = getSvgCoords(e);
    setDragNode(nodeId);
    setDragOffset({ x: x - node.x, y: y - node.y });
  }, [mode, graph.nodes, getSvgCoords]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragNode) return;
    const { x, y } = getSvgCoords(e);
    const nodeRadius = 24;
    const padding = nodeRadius + 4;
    updateNode(dragNode, {
      x: Math.max(padding, Math.min(canvasSize.width - padding, x - dragOffset.x)),
      y: Math.max(padding, Math.min(canvasSize.height - padding, y - dragOffset.y)),
    });
  }, [dragNode, dragOffset, getSvgCoords, updateNode, canvasSize]);

  const handleMouseUp = useCallback(() => {
    setDragNode(null);
  }, []);

  return (
    <svg
      ref={svgRef}
      className="w-full h-full canvas-grid"
      onClick={handleCanvasClick}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="10"
          refY="3.5"
          orient="auto"
        >
          <polygon
            points="0 0, 10 3.5, 0 7"
            fill="hsl(var(--edge-default))"
          />
        </marker>
        <marker
          id="arrowhead-highlight"
          markerWidth="10"
          markerHeight="7"
          refX="10"
          refY="3.5"
          orient="auto"
        >
          <polygon
            points="0 0, 10 3.5, 0 7"
            fill="hsl(var(--edge-highlight))"
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
          onClick={() => handleEdgeClick(edge.id)}
          onWeightChange={updateEdgeWeight}
          mode={mode}
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
          onClick={() => handleNodeClick(node.id)}
          onMouseDown={(e) => handleNodeMouseDown(node.id, e)}
        />
      ))}
    </svg>
  );
};
