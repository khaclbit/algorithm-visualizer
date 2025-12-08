# Component Interface: Graph Direction Toggle

**Feature**: Graph Direction Toggle
**Date**: 2025-12-08

## GraphDirectionToggle Component

**Purpose**: UI control for switching between directed and undirected graph modes

### Props Interface

```typescript
interface GraphDirectionToggleProps {
  /** Current direction mode */
  directed: boolean;

  /** Callback when mode changes */
  onModeChange: (directed: boolean) => void;

  /** Whether the toggle is disabled (e.g., during algorithm execution) */
  disabled?: boolean;

  /** Size variant for the toggle */
  size?: 'sm' | 'md' | 'lg';
}
```

### Behavior Contract

**State Changes**:
- Clicking toggle switches between directed/undirected modes
- Visual feedback shows current mode (icon/text)
- Disabled state prevents interaction

**Visual States**:
- Undirected: Bidirectional arrow icon or "Undirected" text
- Directed: One-way arrow icon or "Directed" text
- Disabled: Reduced opacity, no hover effects

**Accessibility**:
- Keyboard accessible (Enter/Space to toggle)
- Screen reader announces current mode
- ARIA labels for toggle state

## Toolbar Integration Contract

**Purpose**: Integration point for the toggle in the main toolbar

### Extended Toolbar Props

```typescript
interface ToolbarProps {
  // ... existing props
  showDirectionToggle?: boolean;
  onDirectionToggle?: (directed: boolean) => void;
}
```

### Layout Contract

- Toggle positioned after existing tools, before text editor button
- Consistent sizing with other toolbar buttons
- Responsive design for mobile/desktop

## GraphCanvas Updates Contract

**Purpose**: Visual rendering contract for directed vs undirected edges

### Edge Rendering Rules

**Directed Mode**:
- Edges display arrowheads at target end
- Arrow color matches edge color
- Arrow size scales with edge thickness

**Undirected Mode**:
- Edges display as simple lines
- No arrowheads
- Consistent with existing undirected rendering

### Highlighting Rules

**Directed Mode**:
- Only highlight edges in the exact direction traversed
- A→B highlight doesn't affect B→A

**Undirected Mode**:
- Highlight both directions of bidirectional edges
- Maintain existing behavior

## GraphContext Extensions Contract

**Purpose**: State management contract for graph direction

### Extended GraphContextType

```typescript
interface GraphContextType {
  // ... existing properties

  /** Current graph direction mode */
  directed: boolean;

  /** Set graph direction mode */
  setDirected: (directed: boolean) => void;

  /** Toggle between modes with conflict resolution */
  toggleDirection: () => Promise<void>;
}
```

### State Management Rules

- Direction changes trigger graph re-rendering
- Edge conflicts resolved automatically
- State persisted to localStorage
- Algorithms respect current direction mode

## Text Parser Extensions Contract

**Purpose**: Text input parsing contract for directed graphs

### Syntax Rules

**Directed Edges**:
- "A B 3" → Directed edge A→B with weight 3
- "B A 5" → Directed edge B→A with weight 5

**Undirected Edges**:
- Existing format continues to work
- Parser detects graph direction from edge patterns

### Error Handling

- Invalid syntax shows clear error messages
- Direction conflicts in undirected mode flagged
- Self-loops supported in both modes

## Integration Testing Contract

**Purpose**: End-to-end behavior verification

### Test Scenarios

1. **Mode Toggle**: Toggle changes visual rendering immediately
2. **Edge Addition**: New edges respect current mode
3. **Algorithm Execution**: Algorithms work in both modes
4. **Mode Transition**: Switching modes preserves data integrity
5. **Persistence**: Direction mode survives page refresh</content>
<parameter name="filePath">specs/001-graph-direction-toggle/contracts/component-interfaces.md