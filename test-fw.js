// Simple test for FW algorithm
const { floydWarshall } = require('./src/algorithms/floydWarshall.ts');
const { GraphModel } = require('./src/models/graph.ts');

// Create a simple test graph
const testGraph = {
  nodes: [
    { id: 'A', x: 100, y: 100 },
    { id: 'B', x: 200, y: 100 },
    { id: 'C', x: 150, y: 200 }
  ],
  edges: [
    { id: 'e1', from: 'A', to: 'B', weight: 1 },
    { id: 'e2', from: 'B', to: 'C', weight: 2 },
    { id: 'e3', from: 'A', to: 'C', weight: 4 }
  ],
  directed: false
};

console.log('Testing FW algorithm with sample graph...');
try {
  const steps = floydWarshall(testGraph);
  console.log(`Generated ${steps.length} steps`);

  steps.forEach((step, index) => {
    console.log(`Step ${index}: ${step.state?.comment || 'No comment'}`);
    if (step.highlightNodes && typeof step.highlightNodes === 'object') {
      console.log(`  HighlightNodes: ${JSON.stringify(step.highlightNodes)}`);
    }
  });

  console.log('FW test complete');
} catch (error) {
  console.error('Error running FW:', error);
}