import { GraphModel } from '@/models/graph';
import { 
  EdgeDefinition,
  SerializeOptions 
} from '@/types/graphText';

/**
 * IGraphSerializer interface implementation
 * Converts graph data back to text format
 */
export class GraphSerializer {
  private static readonly DEFAULT_OPTIONS: Required<SerializeOptions> = {
    sortEdges: true,
    includeComments: false,
    precision: 2,
    format: 'compact',
  };

  /**
   * Convert graph model to text representation
   */
  public serialize(graph: GraphModel, options: SerializeOptions = {}): string {
    const config = { ...GraphSerializer.DEFAULT_OPTIONS, ...options };
    const edgeDefinitions = this.extractEdgeDefinitions(graph);
    
    if (edgeDefinitions.length === 0) {
      return config.includeComments 
        ? '# Empty graph - no edges defined\n' 
        : '';
    }
    
    // Sort edges if requested
    const sortedEdges = config.sortEdges 
      ? this.sortEdgeDefinitions(edgeDefinitions)
      : edgeDefinitions;
    
    // Generate text lines
    const lines: string[] = [];
    
    if (config.includeComments) {
      lines.push(`# Graph with ${graph.nodes.length} nodes and ${graph.edges.length} edges`);
      lines.push(`# Format: source_vertex target_vertex weight`);
      lines.push('');
    }
    
    for (const edge of sortedEdges) {
      const line = this.formatEdgeLine(edge, config);
      lines.push(line);
    }
    
    return lines.join('\n');
  }

  /**
   * Convert graph model to structured edge definitions
   */
  public extractEdgeDefinitions(graph: GraphModel): EdgeDefinition[] {
    const edgeDefinitions: EdgeDefinition[] = [];
    
    for (const edge of graph.edges) {
      // Find source and target nodes to get their labels
      const sourceNode = graph.nodes.find(n => n.id === edge.from);
      const targetNode = graph.nodes.find(n => n.id === edge.to);
      
      if (!sourceNode || !targetNode) {
        // Skip edges with missing nodes
        continue;
      }
      
      const edgeDefinition: EdgeDefinition = {
        sourceVertex: sourceNode.label || sourceNode.id,
        targetVertex: targetNode.label || targetNode.id,
        weight: edge.weight,
        lineNumber: 0, // Will be set when converting to text
        rawText: '', // Will be set when converting to text
      };
      
      edgeDefinitions.push(edgeDefinition);
    }
    
    return edgeDefinitions;
  }

  /**
   * Sort edge definitions for consistent output
   */
  private sortEdgeDefinitions(edgeDefinitions: EdgeDefinition[]): EdgeDefinition[] {
    return [...edgeDefinitions].sort((a, b) => {
      // First sort by source vertex
      const sourceCompare = a.sourceVertex.localeCompare(b.sourceVertex);
      if (sourceCompare !== 0) return sourceCompare;
      
      // Then by target vertex
      const targetCompare = a.targetVertex.localeCompare(b.targetVertex);
      if (targetCompare !== 0) return targetCompare;
      
      // Finally by weight
      return a.weight - b.weight;
    });
  }

  /**
   * Format a single edge definition as a text line
   */
  private formatEdgeLine(edge: EdgeDefinition, config: Required<SerializeOptions>): string {
    const weightStr = this.formatWeight(edge.weight, config.precision);
    
    if (config.format === 'compact') {
      return `${edge.sourceVertex} ${edge.targetVertex} ${weightStr}`;
    } else {
      // 'readable' format with consistent spacing
      const maxVertexLength = Math.max(
        edge.sourceVertex.length,
        edge.targetVertex.length,
        8 // minimum width for readability
      );
      
      const sourceFormatted = edge.sourceVertex.padEnd(maxVertexLength);
      const targetFormatted = edge.targetVertex.padEnd(maxVertexLength);
      
      return `${sourceFormatted} ${targetFormatted} ${weightStr}`;
    }
  }

  /**
   * Format weight value with specified precision
   */
  private formatWeight(weight: number, precision: number): string {
    // If weight is an integer, don't show decimal places
    if (weight % 1 === 0) {
      return weight.toString();
    }
    
    // Use specified precision for decimals
    return weight.toFixed(precision).replace(/\.?0+$/, '');
  }
}

// Export singleton instance for convenience
export const graphSerializer = new GraphSerializer();

/**
 * Utility function to quickly convert a graph to text
 */
export function graphToText(graph: GraphModel, options?: SerializeOptions): string {
  return graphSerializer.serialize(graph, options);
}

/**
 * Utility function to get edge definitions from a graph
 */
export function getGraphEdgeDefinitions(graph: GraphModel): EdgeDefinition[] {
  return graphSerializer.extractEdgeDefinitions(graph);
}

/**
 * Utility function to check if a graph can be serialized
 */
export function canSerializeGraph(graph: GraphModel): boolean {
  // Check if graph has valid structure
  if (!graph.nodes || !graph.edges) {
    return false;
  }
  
  // Check if all edges reference valid nodes
  const nodeIds = new Set(graph.nodes.map(n => n.id));
  return graph.edges.every(edge => 
    nodeIds.has(edge.from) && nodeIds.has(edge.to)
  );
}