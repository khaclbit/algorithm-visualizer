import { describe, it, expect } from 'vitest';
import { graphTextParser } from '@/lib/textParser';
import { GraphModelTransformer } from '@/lib/graphModelTransformer';
import { floydWarshall } from '@/algorithms/floydWarshall';

describe('Graph Text Editor Integration', () => {
  it('should complete text-to-visual workflow', () => {
    // Test input matching User Story 1 acceptance scenarios
    const testInput = `A B 5
B C 3
C A 2`;

    // Step 1: Parse text
    const parseResult = graphTextParser.parseText(testInput);
    expect(parseResult.success).toBe(true);
    expect(parseResult.graph).toBeDefined();

    if (!parseResult.graph) return;

    // Verify parsing results
    expect(parseResult.graph.vertices.size).toBe(3);
    expect(parseResult.graph.edgeDefinitions).toHaveLength(3);
    expect(Array.from(parseResult.graph.vertices).sort()).toEqual(['A', 'B', 'C']);

    // Step 2: Transform to GraphModel
    const graphModel = GraphModelTransformer.parsedGraphToModel(parseResult.graph);

    // Verify transformation
    expect(graphModel.nodes).toHaveLength(3);
    expect(graphModel.edges).toHaveLength(3);
    expect(graphModel.directed).toBe(false);

    // Verify nodes are created correctly
    const nodeIds = graphModel.nodes.map(n => n.id).sort();
    expect(nodeIds).toEqual(['A', 'B', 'C']);

    // Verify edges are created correctly
    const edges = graphModel.edges.map(e => ({
      from: e.from,
      to: e.to,
      weight: e.weight
    })).sort((a, b) => a.from.localeCompare(b.from));

    expect(edges[0]).toEqual({ from: 'A', to: 'B', weight: 5 });
    expect(edges[1]).toEqual({ from: 'B', to: 'C', weight: 3 });
    expect(edges[2]).toEqual({ from: 'C', to: 'A', weight: 2 });

    // Verify nodes have positions (for layout)
    graphModel.nodes.forEach(node => {
      expect(typeof node.x).toBe('number');
      expect(typeof node.y).toBe('number');
      expect(node.label).toBe(node.id);
    });
  });

  it('should handle User Story 1 Scenario 1: single edge', () => {
    // Given an empty algorithm visualizer, When user enters "1 2 5"
    const input = '1 2 5';
    const parseResult = graphTextParser.parseText(input);
    
    expect(parseResult.success).toBe(true);
    
    if (!parseResult.graph) return;
    const graphModel = GraphModelTransformer.parsedGraphToModel(parseResult.graph);
    
    // Then two nodes labeled "1" and "2" appear connected by an edge with weight "5"
    expect(graphModel.nodes).toHaveLength(2);
    expect(graphModel.nodes.map(n => n.id).sort()).toEqual(['1', '2']);
    expect(graphModel.edges).toHaveLength(1);
    expect(graphModel.edges[0].weight).toBe(5);
  });

  it('should handle User Story 1 Scenario 2: multiple edges', () => {
    // Given the text editor contains "A B 3", When user enters a new line with "B C 7"
    const input = `A B 3
B C 7`;
    const parseResult = graphTextParser.parseText(input);
    
    expect(parseResult.success).toBe(true);
    
    if (!parseResult.graph) return;
    const graphModel = GraphModelTransformer.parsedGraphToModel(parseResult.graph);
    
    // Then three nodes (A, B, C) appear with two edges: A-B (weight 3) and B-C (weight 7)
    expect(graphModel.nodes).toHaveLength(3);
    expect(graphModel.nodes.map(n => n.id).sort()).toEqual(['A', 'B', 'C']);
    expect(graphModel.edges).toHaveLength(2);
    
    const sortedEdges = graphModel.edges.sort((a, b) => a.from.localeCompare(b.from));
    expect(sortedEdges[0].from).toBe('A');
    expect(sortedEdges[0].to).toBe('B');
    expect(sortedEdges[0].weight).toBe(3);
    
    expect(sortedEdges[1].from).toBe('B');
    expect(sortedEdges[1].to).toBe('C');
    expect(sortedEdges[1].weight).toBe(7);
  });

  it('should handle User Story 1 Scenario 3: weight modification', () => {
    // Given multiple edge definitions, When user modifies one line from "1 2 5" to "1 2 10"
    const originalInput = `1 2 5
2 3 3`;
    const modifiedInput = `1 2 10
2 3 3`;

    // Parse both versions
    const originalResult = graphTextParser.parseText(originalInput);
    const modifiedResult = graphTextParser.parseText(modifiedInput);
    
    expect(originalResult.success).toBe(true);
    expect(modifiedResult.success).toBe(true);
    
    if (!originalResult.graph || !modifiedResult.graph) return;
    
    const originalModel = GraphModelTransformer.parsedGraphToModel(originalResult.graph);
    const modifiedModel = GraphModelTransformer.parsedGraphToModel(modifiedResult.graph);
    
    // Then the corresponding edge weight updates from 5 to 10 in the visual graph
    const originalEdge = originalModel.edges.find(e => e.from === '1' && e.to === '2');
    const modifiedEdge = modifiedModel.edges.find(e => e.from === '1' && e.to === '2');
    
    expect(originalEdge?.weight).toBe(5);
    expect(modifiedEdge?.weight).toBe(10);
  });

  it('should handle position preservation during updates', () => {
    // Test that existing node positions are preserved when updating
    const initialInput = 'A B 5';
    const parseResult = graphTextParser.parseText(initialInput);
    
    if (!parseResult.graph) return;
    
    const initialModel = GraphModelTransformer.parsedGraphToModel(parseResult.graph);
    
    // Modify node positions to simulate user interaction
    const modifiedModel = {
      ...initialModel,
      nodes: initialModel.nodes.map(node => ({
        ...node,
        x: node.id === 'A' ? 100 : 200,
        y: node.id === 'A' ? 150 : 250,
      }))
    };
    
    // Now update with new text that includes a new edge
    const newInput = `A B 5
A C 3`;
    const newParseResult = graphTextParser.parseText(newInput);
    
    if (!newParseResult.graph) return;
    
    const updatedModel = GraphModelTransformer.updateGraphModel(modifiedModel, newParseResult.graph);
    
    // Verify that A and B positions were preserved
    const nodeA = updatedModel.nodes.find(n => n.id === 'A');
    const nodeB = updatedModel.nodes.find(n => n.id === 'B');
    const nodeC = updatedModel.nodes.find(n => n.id === 'C');
    
    expect(nodeA?.x).toBe(100);
    expect(nodeA?.y).toBe(150);
    expect(nodeB?.x).toBe(200);
    expect(nodeB?.y).toBe(250);
    
    // New node C should have a calculated position
    expect(typeof nodeC?.x).toBe('number');
    expect(typeof nodeC?.y).toBe('number');
  });

  it('should handle performance requirements', () => {
    // Test parsing a larger graph (approaching the 100-edge target from tasks)
    const edges: string[] = [];
    for (let i = 1; i <= 50; i++) {
      edges.push(`node${i} node${i + 1} ${i}`);
    }
    const largeInput = edges.join('\n');
    
    const startTime = performance.now();
    const parseResult = graphTextParser.parseText(largeInput);
    const parseTime = performance.now() - startTime;
    
    // Should parse within reasonable time (much less than 500ms target)
    expect(parseTime).toBeLessThan(100);
    expect(parseResult.success).toBe(true);
    
    if (!parseResult.graph) return;
    
    const transformStart = performance.now();
    const graphModel = GraphModelTransformer.parsedGraphToModel(parseResult.graph);
    const transformTime = performance.now() - transformStart;
    
    // Transformation should also be fast
    expect(transformTime).toBeLessThan(100);
    expect(graphModel.nodes).toHaveLength(51); // node1 to node51
    expect(graphModel.edges).toHaveLength(50);
  });

  it('should generate FW steps with structured highlighting', () => {
    // Create a simple test graph
    const testInput = `A B 1
B C 2
A C 4`;
    const parseResult = graphTextParser.parseText(testInput);
    
    expect(parseResult.success).toBe(true);
    if (!parseResult.graph) return;
    
    const graphModel = GraphModelTransformer.parsedGraphToModel(parseResult.graph);
    
    // Run FW algorithm
    const steps = floydWarshall(graphModel);
    
    // Should have steps for initialization + k loops + final
    expect(steps.length).toBeGreaterThan(3); // At least init, 3 k-loops, final
    
    // Check that steps have structured highlightNodes
    const updateSteps = steps.filter(step => step.type === 'matrix-update');
    expect(updateSteps.length).toBeGreaterThan(0);
    
    // Each update step should have structured highlighting
    updateSteps.forEach(step => {
      expect(step.highlightNodes).toBeDefined();
      expect(typeof step.highlightNodes).toBe('object');
      
      const highlights = step.highlightNodes as any;
      expect(highlights).toHaveProperty('intermediary');
      expect(highlights).toHaveProperty('source');
      expect(highlights).toHaveProperty('destination');
      
      // Should be arrays
      expect(Array.isArray(highlights.intermediary)).toBe(true);
      expect(Array.isArray(highlights.source)).toBe(true);
      expect(Array.isArray(highlights.destination)).toBe(true);
      
      // Should have at least one node in each category
      expect(highlights.intermediary.length).toBeGreaterThan(0);
      expect(highlights.source.length).toBeGreaterThan(0);
      expect(highlights.destination.length).toBeGreaterThan(0);
    });
    
    // Check initialization step
    const initStep = steps.find(step => step.state?.comment?.includes('Initialized'));
    expect(initStep).toBeDefined();
    expect(initStep?.highlightNodes).toBeUndefined(); // No highlighting for init
    
    // Check k-consideration steps
    const kSteps = steps.filter(step => step.state?.comment?.includes('Considering paths through'));
    expect(kSteps.length).toBe(3); // For 3 nodes
    
    kSteps.forEach(step => {
      expect(step.highlightNodes).toBeDefined();
      const highlights = step.highlightNodes as any;
      expect(highlights.intermediary).toHaveLength(1); // Only k node highlighted
      expect(highlights.source).toBeUndefined();
      expect(highlights.destination).toBeUndefined();
    });
  });

  it('should produce correct FW distance matrix', () => {
    // Test graph: A-B:1, B-C:2, A-C:4
    // Expected shortest paths: A-B:1, B-C:2, A-C:3 (via B)
    const testInput = `A B 1
B C 2
A C 4`;
    const parseResult = graphTextParser.parseText(testInput);
    
    expect(parseResult.success).toBe(true);
    if (!parseResult.graph) return;
    
    const graphModel = GraphModelTransformer.parsedGraphToModel(parseResult.graph);
    const steps = floydWarshall(graphModel);
    
    // Find the final step
    const finalStep = steps[steps.length - 1];
    expect(finalStep.state?.comment).toContain('Floyd-Warshall complete');
    
    const finalMatrix = finalStep.state?.fwMatrix;
    expect(finalMatrix).toBeDefined();
    
    // Verify distances
    const nodeIndex: Record<string, number> = {};
    ['A', 'B', 'C'].forEach((id, i) => nodeIndex[id] = i);
    
    // A to B: 1 (direct)
    expect(finalMatrix[nodeIndex['A']][nodeIndex['B']]).toBe(1);
    // B to C: 2 (direct)
    expect(finalMatrix[nodeIndex['B']][nodeIndex['C']]).toBe(2);
    // A to C: 3 (via B: 1+2)
    expect(finalMatrix[nodeIndex['A']][nodeIndex['C']]).toBe(3);
    // C to A: 3 (via B)
    expect(finalMatrix[nodeIndex['C']][nodeIndex['A']]).toBe(3);
    
    // Self distances should be 0
    expect(finalMatrix[nodeIndex['A']][nodeIndex['A']]).toBe(0);
    expect(finalMatrix[nodeIndex['B']][nodeIndex['B']]).toBe(0);
    expect(finalMatrix[nodeIndex['C']][nodeIndex['C']]).toBe(0);
  });
});