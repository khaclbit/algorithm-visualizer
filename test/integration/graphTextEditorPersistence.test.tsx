import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { GraphTextEditor } from '../../src/components/controls/GraphTextEditor';

// Mock the graph context
vi.mock('../../src/context/GraphContext', () => ({
  useGraph: () => ({
    graph: { nodes: [], edges: [] },
    setGraph: vi.fn(),
  }),
}));

// Mock the persistence functions
vi.mock('../../src/lib/graphPersistence', () => ({
  loadGraphText: vi.fn(),
  saveGraphText: vi.fn(),
  clearGraphText: vi.fn(),
}));

import { loadGraphText, saveGraphText } from '../../src/lib/graphPersistence';

describe('GraphTextEditor Persistence Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(loadGraphText).mockReturnValue(null); // No persisted data initially
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  it('loads persisted text on component mount', async () => {
    const persistedText = 'node A -> node B\nnode B -> node C';
    vi.mocked(loadGraphText).mockReturnValue(persistedText);

    render(<GraphTextEditor />);

    await waitFor(() => {
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveValue(persistedText);
    });
  });

  it('saves text when changed', async () => {
    vi.mocked(saveGraphText).mockImplementation(() => {}); // Mock implementation

    render(<GraphTextEditor />);

    const textarea = screen.getByRole('textbox');
    const testText = 'node A -> node B';

    await act(async () => {
      fireEvent.change(textarea, { target: { value: testText } });
    });

    // Wait for the debounce to trigger (longer than 500ms)
    await new Promise(resolve => setTimeout(resolve, 600));

    expect(saveGraphText).toHaveBeenCalledWith(testText);
  });

  it('handles localStorage errors gracefully', () => {
    vi.mocked(saveGraphText).mockImplementation(() => {
      throw new Error('Storage quota exceeded');
    });

    // Should not crash the component
    expect(() => render(<GraphTextEditor />)).not.toThrow();
  });
});