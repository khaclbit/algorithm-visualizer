import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { saveGraphText, loadGraphText, clearGraphText, GRAPH_STORAGE_KEY } from '../../src/lib/graphPersistence';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('graphPersistence', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    clearGraphText();
  });

  it('saves graph text to localStorage', () => {
    const testText = 'node A -> node B';
    saveGraphText(testText);

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      GRAPH_STORAGE_KEY,
      expect.stringContaining(testText)
    );
  });

  it('loads graph text from localStorage', () => {
    const testText = 'node A -> node B';
    const mockData = JSON.stringify({
      content: testText,
      lastModified: new Date().toISOString(),
      version: 1
    });

    localStorageMock.getItem.mockReturnValue(mockData);

    const loaded = loadGraphText();
    expect(loaded).toBe(testText);
  });

  it('handles localStorage errors gracefully', () => {
    localStorageMock.getItem.mockImplementation(() => {
      throw new Error('Storage quota exceeded');
    });

    expect(() => loadGraphText()).not.toThrow();
    expect(loadGraphText()).toBeNull();
  });

  it('does not save empty content', () => {
    saveGraphText('');
    expect(localStorageMock.setItem).not.toHaveBeenCalled();

    saveGraphText('   ');
    expect(localStorageMock.setItem).not.toHaveBeenCalled();
  });

  it('clears graph text from localStorage', () => {
    clearGraphText();
    expect(localStorageMock.removeItem).toHaveBeenCalledWith(GRAPH_STORAGE_KEY);
  });
});