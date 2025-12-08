/**
 * Validates if a value is a valid edge weight
 */
export const isValidWeight = (value: any): value is number => {
  if (typeof value !== 'number') return false;
  if (isNaN(value) || !isFinite(value)) return false;
  return value >= 0;
};

/**
 * Validates and parses a weight string input
 */
export const parseWeightInput = (input: string): { valid: boolean; value?: number; error?: string } => {
  if (!input.trim()) {
    return { valid: false, error: 'Weight cannot be empty' };
  }

  const num = parseFloat(input);
  if (isNaN(num)) {
    return { valid: false, error: 'Weight must be a valid number' };
  }

  if (!isFinite(num)) {
    return { valid: false, error: 'Weight must be a finite number' };
  }

  if (num < 0) {
    return { valid: false, error: 'Weight must be non-negative' };
  }

  return { valid: true, value: num };
};

/**
 * Validates graph direction consistency
 */
export const validateGraphDirection = (graph: { directed?: boolean; edges: { directed?: boolean }[] }): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  const graphDirected = graph.directed ?? false;

  graph.edges.forEach((edge, index) => {
    const edgeDirected = edge.directed ?? false;
    
    // In directed graphs, all edges should be directed
    if (graphDirected && !edgeDirected) {
      errors.push(`Edge ${index} should be directed in a directed graph`);
    }
    
    // In undirected graphs, all edges should be undirected
    if (!graphDirected && edgeDirected) {
      errors.push(`Edge ${index} should be undirected in an undirected graph`);
    }
  });

  return { valid: errors.length === 0, errors };
};

/**
 * Checks if toggling direction would create conflicts
 */
export const checkDirectionToggleConflicts = (graph: { directed?: boolean; edges: { from: string; to: string }[] }): { hasConflicts: boolean; conflicts: Array<{ from: string; to: string }> } => {
  if (graph.directed) {
    // Directed → Undirected: Check for A→B and B→A pairs
    const edgePairs = new Map<string, boolean>();
    const conflicts: Array<{ from: string; to: string }> = [];
    
    graph.edges.forEach(edge => {
      const key = [edge.from, edge.to].sort().join('-');
      const reverseKey = [edge.to, edge.from].sort().join('-');
      
      if (edgePairs.has(reverseKey)) {
        conflicts.push({ from: edge.from, to: edge.to });
      }
      edgePairs.set(key, true);
    });
    
    return { hasConflicts: conflicts.length > 0, conflicts };
  }
  
  return { hasConflicts: false, conflicts: [] };
};