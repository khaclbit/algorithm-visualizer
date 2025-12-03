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