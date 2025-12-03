import { GraphModel, NodeModel, EdgeModel, createNode, createEdge } from '@/models/graph';
import { ParsedGraph, EdgeDefinition } from '@/types/graphText';

/**
 * Transform parsed graph data into GraphModel format
 */
export class GraphModelTransformer {
  /**
   * Convert ParsedGraph to GraphModel
   */
  public static parsedGraphToModel(parsedGraph: ParsedGraph): GraphModel {
    const { vertices, edgeDefinitions } = parsedGraph;
    
    // Create nodes from vertices
    const nodes: NodeModel[] = this.createNodesFromVertices(vertices);
    
    // Create edges from edge definitions
    const edges: EdgeModel[] = this.createEdgesFromDefinitions(edgeDefinitions);
    
    return {
      nodes,
      edges,
      directed: false, // Our text format assumes undirected graphs
    };
  }

  /**
   * Create node models from vertex set with automatic positioning
   */
  private static createNodesFromVertices(vertices: Set<string>): NodeModel[] {
    const vertexArray = Array.from(vertices).sort(); // Sort for consistent ordering
    const nodes: NodeModel[] = [];
    
    // Simple circular layout for initial positioning
    const centerX = 400; // Center of typical canvas
    const centerY = 300;
    const radius = Math.min(200, 50 + vertexArray.length * 10); // Adaptive radius
    
    vertexArray.forEach((vertex, index) => {
      const angle = (2 * Math.PI * index) / vertexArray.length;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      
      nodes.push(createNode(vertex, x, y));
    });
    
    return nodes;
  }

  /**
   * Create edge models from edge definitions
   */
  private static createEdgesFromDefinitions(edgeDefinitions: EdgeDefinition[]): EdgeModel[] {
    const edges: EdgeModel[] = [];
    
    edgeDefinitions.forEach((edgeDef) => {
      try {
        const edge = createEdge(
          edgeDef.sourceVertex,
          edgeDef.targetVertex,
          edgeDef.weight,
          false // Undirected
        );
        edges.push(edge);
      } catch (error) {
        // Log error but continue with other edges
        console.warn(`Failed to create edge from ${edgeDef.sourceVertex} to ${edgeDef.targetVertex}:`, error);
      }
    });
    
    return edges;
  }

  /**
   * Update existing GraphModel with new parsed data
   * Preserves existing node positions when possible
   */
  public static updateGraphModel(
    existingGraph: GraphModel,
    parsedGraph: ParsedGraph
  ): GraphModel {
    const { vertices, edgeDefinitions } = parsedGraph;
    
    // Create a map of existing nodes for position preservation
    const existingNodes = new Map<string, NodeModel>();
    existingGraph.nodes.forEach(node => {
      existingNodes.set(node.id, node);
    });
    
    // Create nodes, preserving existing positions
    const nodes: NodeModel[] = this.createNodesPreservingPositions(vertices, existingNodes);
    
    // Create edges from definitions
    const edges: EdgeModel[] = this.createEdgesFromDefinitions(edgeDefinitions);
    
    return {
      nodes,
      edges,
      directed: existingGraph.directed ?? false,
    };
  }

  /**
   * Create nodes while preserving existing positions
   */
  private static createNodesPreservingPositions(
    vertices: Set<string>,
    existingNodes: Map<string, NodeModel>
  ): NodeModel[] {
    const vertexArray = Array.from(vertices).sort();
    const nodes: NodeModel[] = [];
    
    // Layout parameters for new nodes
    const centerX = 400;
    const centerY = 300;
    const radius = Math.min(200, 50 + vertexArray.length * 10);
    
    let newNodeIndex = 0;
    
    vertexArray.forEach((vertex) => {
      const existingNode = existingNodes.get(vertex);
      
      if (existingNode) {
        // Preserve existing node position
        nodes.push({
          ...existingNode,
          label: vertex, // Ensure label matches vertex name
        });
      } else {
        // Create new node with calculated position
        const angle = (2 * Math.PI * newNodeIndex) / vertexArray.length;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        
        nodes.push(createNode(vertex, x, y));
        newNodeIndex++;
      }
    });
    
    return nodes;
  }
}

/**
 * Utility function for quick conversion
 */
export function parsedGraphToModel(parsedGraph: ParsedGraph): GraphModel {
  return GraphModelTransformer.parsedGraphToModel(parsedGraph);
}

/**
 * Utility function for updating existing graphs
 */
export function updateGraphModel(existingGraph: GraphModel, parsedGraph: ParsedGraph): GraphModel {
  return GraphModelTransformer.updateGraphModel(existingGraph, parsedGraph);
}