import {
  GraphTextRepresentation,
  EdgeDefinition,
  VertexDefinition,
  ParsedGraph,
  ParseMetadata,
  ValidationError,
  ParseOptions,
  ParseResult
} from '@/types/graphText';

/**
 * IGraphTextParser interface implementation
 * Parses text input in "vertex1 vertex2 weight" format into graph data structures
 * Also supports "vertex weight" format for A* algorithm vertex definitions
 */
export class GraphTextParser {
  private static readonly DEFAULT_OPTIONS: Required<ParseOptions> = {
    allowSelfLoops: false,
    allowDuplicateEdges: true,
    strictWhitespace: false,
    maxNodes: 1000,
    maxEdges: 1000,
    parseMode: 'edges',
    requireVertexWeights: false,
  };

  private static readonly VERTEX_REGEX = /^[a-zA-Z0-9_]+$/;
  private static readonly LINE_FORMAT_REGEX = /^(\S+)\s+(\S+)\s+(\S+)$/;
  private static readonly VERTEX_ONLY_REGEX = /^(\S+)$/;
  private static readonly VERTEX_WEIGHT_REGEX = /^(\S+)\s+(\S+)$/;

  /**
   * Parse text input into graph representation
   * Supports two modes:
   * - 'edges': Parse "vertex1 vertex2 weight" edge format (default)
   * - 'vertices': Parse "vertex weight" vertex definition format (for A*)
   */
  public parseText(text: string, options: ParseOptions = {}): ParseResult {
    const startTime = performance.now();
    const config = { ...GraphTextParser.DEFAULT_OPTIONS, ...options };
    const errors: ValidationError[] = [];
    const edgeDefinitions: EdgeDefinition[] = [];
    const vertexDefinitions: VertexDefinition[] = [];
    const vertices = new Set<string>();
    
    try {
      const lines = this.splitIntoLines(text);
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        const lineNumber = i + 1;
        
        // Skip empty lines
        if (line === '') continue;

        // Parse based on mode
        if (config.parseMode === 'vertices') {
          const vertexResult = this.parseVertexLine(line, lineNumber, config);
          
          if (vertexResult.error) {
            errors.push(vertexResult.error);
            continue;
          }
          
          if (vertexResult.vertex) {
            const { vertex } = vertexResult;
            
            // Check for duplicate vertex definitions
            if (vertices.has(vertex.id)) {
              // Update existing vertex definition (last wins)
              const existingIndex = vertexDefinitions.findIndex(v => v.id === vertex.id);
              if (existingIndex >= 0) {
                vertexDefinitions.splice(existingIndex, 1);
              }
            }
            
            vertices.add(vertex.id);
            vertexDefinitions.push(vertex);
          }
        } else {
          // Parse as edge definition (default)
          const edgeResult = this.parseEdgeLine(line, lineNumber, config);
          
          if (edgeResult.error) {
            errors.push(edgeResult.error);
            continue;
          }
          
          if (edgeResult.edge) {
            const { edge } = edgeResult;
            
            // Check for self-loops if not allowed
            if (!config.allowSelfLoops && edge.sourceVertex === edge.targetVertex) {
              errors.push(this.createValidationError(
                'vertex_invalid',
                lineNumber,
                `Self-loops are not allowed: ${edge.sourceVertex} → ${edge.targetVertex}`,
                'Use different source and target vertices'
              ));
              continue;
            }
            
            vertices.add(edge.sourceVertex);
            vertices.add(edge.targetVertex);
            
            // Handle duplicate edges
            if (config.allowDuplicateEdges) {
              // Remove previous edge with same vertices (last definition wins)
              const existingIndex = edgeDefinitions.findIndex(
                e => e.sourceVertex === edge.sourceVertex && e.targetVertex === edge.targetVertex
              );
              if (existingIndex >= 0) {
                edgeDefinitions.splice(existingIndex, 1);
              }
            }
            
            edgeDefinitions.push(edge);
          }
        }
      }

      // Validate vertex weights if required (for A*)
      if (config.requireVertexWeights && config.parseMode === 'vertices') {
        const verticesWithoutWeight = vertexDefinitions.filter(v => v.weight === undefined);
        if (verticesWithoutWeight.length > 0) {
          errors.push(this.createValidationError(
            'weight_invalid',
            0,
            `Missing weights for vertices: ${verticesWithoutWeight.map(v => v.id).join(', ')}`,
            'Add weight to each vertex using "VERTEX WEIGHT" format (e.g., "A 5")'
          ));
        }
      }
      
      // Check limits
      if (vertices.size > config.maxNodes) {
        errors.push(this.createValidationError(
          'format_error',
          0,
          `Too many nodes: ${vertices.size} exceeds limit of ${config.maxNodes}`,
          `Reduce the number of unique vertex names`
        ));
      }
      
      if (edgeDefinitions.length > config.maxEdges) {
        errors.push(this.createValidationError(
          'format_error',
          0,
          `Too many edges: ${edgeDefinitions.length} exceeds limit of ${config.maxEdges}`,
          `Reduce the number of edge definitions`
        ));
      }
      
      const parseTime = performance.now() - startTime;
      const metadata: ParseMetadata = {
        parseTime,
        vertexCount: vertices.size,
        edgeCount: edgeDefinitions.length,
        errorCount: errors.length,
        isIncremental: false,
      };
      
      const adjacencyMap = this.buildAdjacencyMap(edgeDefinitions);
      
      const parsedGraph: ParsedGraph = {
        vertices,
        vertexDefinitions: config.parseMode === 'vertices' ? vertexDefinitions : undefined,
        edgeDefinitions,
        adjacencyMap,
        metadata,
      };
      
      return {
        success: errors.length === 0,
        graph: parsedGraph,
        errors,
        metadata,
      };
      
    } catch (error) {
      const parseTime = performance.now() - startTime;
      return {
        success: false,
        errors: [this.createValidationError(
          'format_error',
          0,
          `Unexpected parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          'Check text format and try again'
        )],
        metadata: {
          parseTime,
          vertexCount: 0,
          edgeCount: 0,
          errorCount: 1,
          isIncremental: false,
        },
      };
    }
  }

  /**
   * Validate text format without full parsing
   */
  public validateText(text: string): ValidationError[] {
    const errors: ValidationError[] = [];
    const lines = this.splitIntoLines(text);
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const lineNumber = i + 1;
      
      if (line === '') continue;
      
      const edgeResult = this.parseEdgeLine(line, lineNumber);
      if (edgeResult.error) {
        errors.push(edgeResult.error);
      }
    }
    
    return errors;
  }

  /**
   * Perform incremental parse for performance optimization
   */
  public incrementalParse(_previousResult: ParseResult, newText: string): ParseResult {
    // For now, perform full parse
    // TODO: Implement true incremental parsing in Phase 3
    const result = this.parseText(newText);
    return {
      ...result,
      metadata: {
        ...result.metadata,
        isIncremental: true,
      },
    };
  }

  /**
   * Split text into lines, handling different line endings
   */
  private splitIntoLines(text: string): string[] {
    return text.split(/\r\n|\r|\n/);
  }

  /**
   * Parse a single line into a VertexDefinition (for A* mode)
   * Format: "VERTEX" or "VERTEX WEIGHT"
   */
  private parseVertexLine(
    line: string,
    lineNumber: number,
    config: Required<ParseOptions>
  ): { vertex?: VertexDefinition; error?: ValidationError } {
    const trimmedLine = line.trim();
    
    // Try "VERTEX WEIGHT" format first
    const weightMatch = trimmedLine.match(GraphTextParser.VERTEX_WEIGHT_REGEX);
    if (weightMatch) {
      const [, vertexId, weightStr] = weightMatch;
      
      // Validate vertex name
      if (!GraphTextParser.VERTEX_REGEX.test(vertexId)) {
        return {
          error: this.createValidationError(
            'vertex_invalid',
            lineNumber,
            `Invalid vertex "${vertexId}". Use only letters, numbers, and underscores`,
            'Rename vertex to use alphanumeric characters only'
          ),
        };
      }
      
      // Validate weight
      const weight = parseFloat(weightStr);
      if (isNaN(weight) || !isFinite(weight) || weight < 0) {
        return {
          error: this.createValidationError(
            'weight_invalid',
            lineNumber,
            `Invalid weight "${weightStr}". Must be a non-negative number`,
            'Use a numeric value like 0, 5, or 10.5'
          ),
        };
      }
      
      return {
        vertex: { id: vertexId, weight, lineNumber, rawText: line },
      };
    }
    
    // Try vertex-only format
    const vertexMatch = trimmedLine.match(GraphTextParser.VERTEX_ONLY_REGEX);
    if (vertexMatch) {
      const [, vertexId] = vertexMatch;
      
      if (!GraphTextParser.VERTEX_REGEX.test(vertexId)) {
        return {
          error: this.createValidationError(
            'vertex_invalid',
            lineNumber,
            `Invalid vertex "${vertexId}". Use only letters, numbers, and underscores`,
            'Rename vertex to use alphanumeric characters only'
          ),
        };
      }
      
      // If weights are required, this is an error
      if (config.requireVertexWeights) {
        return {
          error: this.createValidationError(
            'weight_invalid',
            lineNumber,
            `Missing weight for vertex "${vertexId}"`,
            'Add weight using "VERTEX WEIGHT" format (e.g., "A 5")'
          ),
        };
      }
      
      return {
        vertex: { id: vertexId, lineNumber, rawText: line },
      };
    }
    
    return {
      error: this.createValidationError(
        'format_error',
        lineNumber,
        'Invalid line format. Expected: "VERTEX" or "VERTEX WEIGHT"',
        'Use format like "A" or "A 5"',
        [0, line.length]
      ),
    };
  }

  /**
   * Parse a single line into an EdgeDefinition
   */
  private parseEdgeLine(
    line: string, 
    lineNumber: number, 
    _config: Required<ParseOptions> = GraphTextParser.DEFAULT_OPTIONS
  ): { edge?: EdgeDefinition; error?: ValidationError } {
    const trimmedLine = line.trim();
    
    // Check basic format
    const match = trimmedLine.match(GraphTextParser.LINE_FORMAT_REGEX);
    if (!match) {
      return {
        error: this.createValidationError(
          'format_error',
          lineNumber,
          'Invalid line format. Expected: "vertex1 vertex2 weight"',
          'Use format like "A B 5" or "node1 node2 3.14"',
          [0, line.length]
        ),
      };
    }
    
    const [, sourceVertex, targetVertex, weightStr] = match;
    
    // Validate vertex names first (before checking weight format)
    if (!GraphTextParser.VERTEX_REGEX.test(sourceVertex)) {
      return {
        error: this.createValidationError(
          'vertex_invalid',
          lineNumber,
          `Invalid source vertex "${sourceVertex}". Use only letters, numbers, and underscores`,
          'Rename vertex to use alphanumeric characters only'
        ),
      };
    }
    
    if (!GraphTextParser.VERTEX_REGEX.test(targetVertex)) {
      return {
        error: this.createValidationError(
          'vertex_invalid',
          lineNumber,
          `Invalid target vertex "${targetVertex}". Use only letters, numbers, and underscores`,
          'Rename vertex to use alphanumeric characters only'
        ),
      };
    }
    
    // Validate weight - check various invalid cases
    // First check for negative weights
    if (weightStr.startsWith('-')) {
      return {
        error: this.createValidationError(
          'weight_invalid',
          lineNumber,
          `Weight "${weightStr}" cannot be negative`,
          'Use a positive number greater than 0'
        ),
      };
    }
    
    // Check for obviously non-numeric strings
    if (weightStr === 'NaN' || weightStr === 'Infinity' || weightStr === '-Infinity') {
      return {
        error: this.createValidationError(
          'weight_invalid',
          lineNumber,
          `Invalid weight "${weightStr}". Must be a valid number`,
          'Use a numeric value like 1, 2.5, or 10'
        ),
      };
    }
    
    // Check if it contains only valid numeric characters
    if (!/^[\d.]+$/.test(weightStr)) {
      return {
        error: this.createValidationError(
          'weight_invalid',
          lineNumber,
          `Invalid weight "${weightStr}". Must be a valid number`,
          'Use a numeric value like 1, 2.5, or 10'
        ),
      };
    }
    
    const weight = parseFloat(weightStr);
    if (isNaN(weight) || !isFinite(weight)) {
      return {
        error: this.createValidationError(
          'weight_invalid',
          lineNumber,
          `Invalid weight "${weightStr}". Must be a valid number`,
          'Use a numeric value like 1, 2.5, or 10'
        ),
      };
    }
    
    if (weight <= 0) {
      return {
        error: this.createValidationError(
          'weight_invalid',
          lineNumber,
          `Weight "${weight}" must be positive`,
          'Use a positive number greater than 0'
        ),
      };
    }
    
    return {
      edge: {
        sourceVertex,
        targetVertex,
        weight,
        lineNumber,
        rawText: line,
      },
    };
  }

  /**
   * Build adjacency map for quick neighbor lookups
   */
  private buildAdjacencyMap(edgeDefinitions: EdgeDefinition[]): Map<string, string[]> {
    const adjacencyMap = new Map<string, string[]>();
    
    for (const edge of edgeDefinitions) {
      // Add forward edge
      if (!adjacencyMap.has(edge.sourceVertex)) {
        adjacencyMap.set(edge.sourceVertex, []);
      }
      adjacencyMap.get(edge.sourceVertex)!.push(edge.targetVertex);
      
      // For undirected graphs, add reverse edge
      // Note: Our spec says we support undirected graphs only
      if (!adjacencyMap.has(edge.targetVertex)) {
        adjacencyMap.set(edge.targetVertex, []);
      }
      adjacencyMap.get(edge.targetVertex)!.push(edge.sourceVertex);
    }
    
    return adjacencyMap;
  }

  /**
   * Create a standardized validation error
   */
  private createValidationError(
    type: ValidationError['type'],
    lineNumber: number,
    message: string,
    suggestion?: string,
    columnRange?: [number, number]
  ): ValidationError {
    return {
      type,
      lineNumber,
      message,
      suggestion,
      severity: 'error',
      columnRange,
    };
  }
}

// Export singleton instance for convenience
export const graphTextParser = new GraphTextParser();

/**
 * Utility function to create a GraphTextRepresentation from raw text
 */
export function createGraphTextRepresentation(content: string): GraphTextRepresentation {
  const lines = content.split(/\r\n|\r|\n/);
  const parser = new GraphTextParser();
  const validation = parser.validateText(content);
  
  return {
    content,
    lines,
    lastModified: new Date(),
    isValid: validation.length === 0,
    errors: validation,
  };
}