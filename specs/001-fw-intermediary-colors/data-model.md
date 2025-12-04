# Data Model: Floyd-Warshall Intermediary Node Coloring

## Enhanced Step Model

**Current Step Structure**:
```typescript
interface Step {
  type: string;
  state: any;
  highlightNodes?: string[];
  comment?: string;
}
```

**Enhanced Step Structure**:
```typescript
interface Step {
  type: string;
  state: any;
  highlightNodes?: string[] | HighlightNodes;
  comment?: string;
}

interface HighlightNodes {
  nodes?: string[];  // General highlighting
  intermediary?: string[];  // FW intermediary nodes
  source?: string[];  // FW source nodes
  destination?: string[];  // FW destination nodes
}
```

**Validation Rules**:
- highlightNodes can be either legacy array or new structured object
- Structured highlighting takes precedence when present
- Backward compatibility maintained for existing algorithms

## Node State Extensions

**Current Node States**:
- 'default' | 'current' | 'visited' | 'queued' | 'start'

**New Node States for FW**:
- 'fw-intermediary': Distinct color for intermediary node (k)
- 'fw-source': Color for source node (i)
- 'fw-destination': Color for destination node (j)

**State Transitions**:
- Nodes can have only one state at a time
- State determined by algorithm step and node role
- Falls back to 'default' when not highlighted

## Color Scheme

**Intermediary Node**: Purple/violet tones
- Primary: #8b5cf6 (violet-500)
- Border: #a855f7 (violet-600)

**Source/Destination Nodes**: Orange/red tones
- Primary: #f97316 (orange-500)
- Border: #ea580c (orange-600)

**Contrast Requirements**:
- Minimum contrast ratio: 4.5:1 for text
- Color differences clearly distinguishable
- Works with color blindness considerations