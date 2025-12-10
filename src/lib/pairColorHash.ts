/**
 * Deterministic color generator for vertex pairs
 * Generates visually distinct, stable colors based on (i, j) pair hash
 */

// Golden ratio for even distribution of hues
const GOLDEN_RATIO_CONJUGATE = 0.618033988749895;

/**
 * Simple string hash function
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Generate a deterministic HSL color for a vertex pair
 * Colors are evenly distributed and visually distinct
 */
export function getPairColor(from: string, to: string): string {
  // Create a canonical key (sorted to ensure (A,B) === (B,A) for undirected)
  const key = [from, to].sort().join('-');
  const hash = hashString(key);
  
  // Use golden ratio for hue distribution
  const hue = ((hash * GOLDEN_RATIO_CONJUGATE) % 1) * 360;
  
  // Fixed saturation and lightness for good visibility
  const saturation = 70 + (hash % 20); // 70-90%
  const lightness = 50 + (hash % 15); // 50-65%
  
  return `hsl(${Math.round(hue)}, ${saturation}%, ${lightness}%)`;
}

/**
 * Generate a dimmed version of a pair color (for old path)
 */
export function getDimmedPairColor(from: string, to: string): string {
  const key = [from, to].sort().join('-');
  const hash = hashString(key);
  
  const hue = ((hash * GOLDEN_RATIO_CONJUGATE) % 1) * 360;
  
  // Lower saturation and lightness for dimmed appearance
  return `hsl(${Math.round(hue)}, 40%, 35%)`;
}

/**
 * Get CSS variable compatible color values
 */
export function getPairColorHSL(from: string, to: string): { h: number; s: number; l: number } {
  const key = [from, to].sort().join('-');
  const hash = hashString(key);
  
  const h = ((hash * GOLDEN_RATIO_CONJUGATE) % 1) * 360;
  const s = 70 + (hash % 20);
  const l = 50 + (hash % 15);
  
  return { h: Math.round(h), s, l };
}
