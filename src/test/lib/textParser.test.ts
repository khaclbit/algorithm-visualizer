import { describe, it, expect } from 'vitest';
import { GraphTextParser, createGraphTextRepresentation } from '@/lib/textParser';
import { GraphSerializer } from '@/lib/graphSerializer';
import { GraphModel, createNode, createEdge } from '@/models/graph';

describe('GraphTextParser', () => {
  const parser = new GraphTextParser();

  describe('parseText', () => {
    it('should parse valid single edge correctly', () => {
      const text = 'A B 5';
      const result = parser.parseText(text);

      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.graph).toBeDefined();
      
      if (result.graph) {
        expect(result.graph.vertices.size).toBe(2);
        expect(result.graph.vertices.has('A')).toBe(true);
        expect(result.graph.vertices.has('B')).toBe(true);
        expect(result.graph.edgeDefinitions).toHaveLength(1);
        
        const edge = result.graph.edgeDefinitions[0];
        expect(edge.sourceVertex).toBe('A');
        expect(edge.targetVertex).toBe('B');
        expect(edge.weight).toBe(5);
      }
    });

    it('should parse multiple edges correctly', () => {
      const text = `A B 5
B C 3.5
C A 2`;
      const result = parser.parseText(text);

      expect(result.success).toBe(true);
      expect(result.graph?.vertices.size).toBe(3);
      expect(result.graph?.edgeDefinitions).toHaveLength(3);
    });

    it('should handle empty lines and whitespace', () => {
      const text = `A B 5

B C 3
   
C A 2`;
      const result = parser.parseText(text);

      expect(result.success).toBe(true);
      expect(result.graph?.edgeDefinitions).toHaveLength(3);
    });

    it('should handle decimal weights', () => {
      const text = 'node1 node2 3.14159';
      const result = parser.parseText(text);

      expect(result.success).toBe(true);
      expect(result.graph?.edgeDefinitions[0].weight).toBe(3.14159);
    });

    it('should handle alphanumeric vertex names', () => {
      const text = `A1 B2 1
node_1 node_2 2
vertex123 vertex456 3`;
      const result = parser.parseText(text);

      expect(result.success).toBe(true);
      expect(result.graph?.vertices.size).toBe(6);
    });

    it('should reject invalid format', () => {
      const text = 'A B'; // Missing weight
      const result = parser.parseText(text);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].type).toBe('format_error');
    });

    it('should reject invalid vertex names', () => {
      const text = 'A@ B# 5'; // Invalid characters
      const result = parser.parseText(text);

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].type).toBe('vertex_invalid');
    });

    it('should reject negative weights', () => {
      const text = 'A B -5';
      const result = parser.parseText(text);

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].type).toBe('weight_invalid');
    });

    it('should reject zero weights', () => {
      const text = 'A B 0';
      const result = parser.parseText(text);

      expect(result.success).toBe(false);
      expect(result.errors[0].type).toBe('weight_invalid');
    });

    it('should reject invalid weight values', () => {
      const text = 'A B NaN';
      const result = parser.parseText(text);

      expect(result.success).toBe(false);
      expect(result.errors[0].type).toBe('weight_invalid');
    });

    it('should reject self-loops by default', () => {
      const text = 'A A 5';
      const result = parser.parseText(text);

      expect(result.success).toBe(false);
      expect(result.errors[0].type).toBe('vertex_invalid');
      expect(result.errors[0].message).toContain('Self-loops are not allowed');
    });

    it('should allow self-loops when configured', () => {
      const text = 'A A 5';
      const result = parser.parseText(text, { allowSelfLoops: true });

      expect(result.success).toBe(true);
      expect(result.graph?.edgeDefinitions).toHaveLength(1);
    });

    it('should handle duplicate edges (last wins)', () => {
      const text = `A B 5
A B 10`;
      const result = parser.parseText(text);

      expect(result.success).toBe(true);
      expect(result.graph?.edgeDefinitions).toHaveLength(1);
      expect(result.graph?.edgeDefinitions[0].weight).toBe(10);
    });

    it('should respect node and edge limits', () => {
      // Create text with too many nodes
      const manyNodesText = Array.from({length: 11}, (_, i) => `A${i} B${i} 1`).join('\n');
      const result = parser.parseText(manyNodesText, { maxNodes: 10 });

      expect(result.success).toBe(false);
      expect(result.errors.some(e => e.message.includes('Too many nodes'))).toBe(true);
    });

    it('should track parse performance metrics', () => {
      const text = 'A B 5';
      const result = parser.parseText(text);

      expect(result.metadata.parseTime).toBeGreaterThan(0);
      expect(result.metadata.vertexCount).toBe(2);
      expect(result.metadata.edgeCount).toBe(1);
      expect(result.metadata.errorCount).toBe(0);
    });
  });

  describe('validateText', () => {
    it('should validate correct format', () => {
      const text = `A B 5
B C 3`;
      const errors = parser.validateText(text);

      expect(errors).toHaveLength(0);
    });

    it('should detect format errors', () => {
      const text = `A B 5
INVALID LINE
C D 2`;
      const errors = parser.validateText(text);

      expect(errors).toHaveLength(1);
      expect(errors[0].lineNumber).toBe(2);
    });
  });
});

describe('GraphSerializer', () => {
  const serializer = new GraphSerializer();

  describe('serialize', () => {
    it('should serialize simple graph correctly', () => {
      const graph: GraphModel = {
        nodes: [
          createNode('A', 0, 0),
          createNode('B', 100, 100)
        ],
        edges: [
          createEdge('A', 'B', 5)
        ]
      };

      const result = serializer.serialize(graph);
      expect(result).toBe('A B 5');
    });

    it('should handle multiple edges with sorting', () => {
      const graph: GraphModel = {
        nodes: [
          createNode('C', 0, 0),
          createNode('A', 50, 50),
          createNode('B', 100, 100)
        ],
        edges: [
          createEdge('C', 'A', 2),
          createEdge('A', 'B', 5),
          createEdge('B', 'C', 3)
        ]
      };

      const result = serializer.serialize(graph, { sortEdges: true });
      const lines = result.split('\n');
      
      expect(lines[0]).toContain('A B 5');
      expect(lines[1]).toContain('B C 3');
      expect(lines[2]).toContain('C A 2');
    });

    it('should format weights correctly', () => {
      const graph: GraphModel = {
        nodes: [
          createNode('A', 0, 0),
          createNode('B', 100, 100)
        ],
        edges: [
          createEdge('A', 'B', 3.14159)
        ]
      };

      const result = serializer.serialize(graph, { precision: 2 });
      expect(result).toBe('A B 3.14');
    });

    it('should handle integer weights without decimals', () => {
      const graph: GraphModel = {
        nodes: [
          createNode('A', 0, 0),
          createNode('B', 100, 100)
        ],
        edges: [
          createEdge('A', 'B', 5)
        ]
      };

      const result = serializer.serialize(graph);
      expect(result).toBe('A B 5');
    });

    it('should include comments when requested', () => {
      const graph: GraphModel = {
        nodes: [createNode('A', 0, 0), createNode('B', 100, 100)],
        edges: [createEdge('A', 'B', 5)]
      };

      const result = serializer.serialize(graph, { includeComments: true });
      expect(result).toContain('# Graph with 2 nodes and 1 edges');
      expect(result).toContain('A B 5');
    });

    it('should return empty string for empty graph', () => {
      const graph: GraphModel = { nodes: [], edges: [] };
      const result = serializer.serialize(graph);
      expect(result).toBe('');
    });
  });

  describe('extractEdgeDefinitions', () => {
    it('should extract edge definitions correctly', () => {
      const graph: GraphModel = {
        nodes: [
          createNode('A', 0, 0),
          createNode('B', 100, 100)
        ],
        edges: [
          createEdge('A', 'B', 5)
        ]
      };

      const edgeDefs = serializer.extractEdgeDefinitions(graph);
      expect(edgeDefs).toHaveLength(1);
      expect(edgeDefs[0].sourceVertex).toBe('A');
      expect(edgeDefs[0].targetVertex).toBe('B');
      expect(edgeDefs[0].weight).toBe(5);
    });

    it('should skip edges with missing nodes', () => {
      const graph: GraphModel = {
        nodes: [createNode('A', 0, 0)],
        edges: [
          createEdge('A', 'B', 5), // B doesn't exist
          createEdge('X', 'Y', 3)  // Neither exists
        ]
      };

      const edgeDefs = serializer.extractEdgeDefinitions(graph);
      expect(edgeDefs).toHaveLength(0);
    });
  });
});

describe('createGraphTextRepresentation', () => {
  it('should create valid text representation', () => {
    const text = 'A B 5\nB C 3';
    const representation = createGraphTextRepresentation(text);

    expect(representation.content).toBe(text);
    expect(representation.lines).toEqual(['A B 5', 'B C 3']);
    expect(representation.isValid).toBe(true);
    expect(representation.errors).toHaveLength(0);
  });

  it('should detect invalid text representation', () => {
    const text = 'INVALID FORMAT';
    const representation = createGraphTextRepresentation(text);

    expect(representation.isValid).toBe(false);
    expect(representation.errors.length).toBeGreaterThan(0);
  });
});

// Integration tests
describe('Parser and Serializer Integration', () => {
  it('should maintain round-trip consistency', () => {
    const originalText = `A B 5
B C 3.5
C A 2`;

    const parser = new GraphTextParser();
    const serializer = new GraphSerializer();

    // Parse text to graph
    const parseResult = parser.parseText(originalText);
    expect(parseResult.success).toBe(true);

    // Create a simple GraphModel from parsed data
    const graph: GraphModel = {
      nodes: Array.from(parseResult.graph!.vertices).map(vertex => createNode(vertex, 0, 0)),
      edges: parseResult.graph!.edgeDefinitions.map(edgeDef => 
        createEdge(edgeDef.sourceVertex, edgeDef.targetVertex, edgeDef.weight)
      )
    };

    // Serialize back to text
    const serializedText = serializer.serialize(graph, { sortEdges: true });
    
    // Parse again to verify consistency
    const reParseResult = parser.parseText(serializedText);
    expect(reParseResult.success).toBe(true);
    expect(reParseResult.graph!.edgeDefinitions).toHaveLength(3);
  });
});