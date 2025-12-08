# Feature Specification: Graph Direction Toggle

**Feature Branch**: `001-graph-direction-toggle`  
**Created**: 2025-12-08  
**Status**: Draft  
**Input**: User description: "implement new feature to toggle between undirected and directed, but consider some pain point that been analyze"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Toggle Graph Direction Mode (Priority: P1)

Users need to switch between undirected and directed graph modes to explore different graph algorithms and visualizations. They can toggle the mode using a UI control and see immediate visual changes in how edges are displayed and how algorithms behave.

**Why this priority**: This is the core functionality that enables users to work with both graph types, which is essential for algorithm visualization and learning.

**Independent Test**: Can be fully tested by toggling the direction mode and verifying that edge arrows appear/disappear and algorithms run correctly in both modes.

**Acceptance Scenarios**:

1. **Given** an undirected graph with edges between nodes, **When** user toggles to directed mode, **Then** all edges display arrowheads indicating direction
2. **Given** a directed graph with unidirectional edges, **When** user toggles to undirected mode, **Then** edges lose arrowheads and become bidirectional
3. **Given** a graph in directed mode, **When** user adds a new edge, **Then** the edge is created as directed with an arrowhead

---

### User Story 2 - Handle Mode Transitions (Priority: P2)

When switching between directed and undirected modes, the system must handle existing edges appropriately, preserving user intent while adapting to the new mode constraints.

**Why this priority**: Ensures data integrity when users switch modes, preventing loss of work or confusing behavior.

**Independent Test**: Can be tested by creating edges in one mode, switching modes, and verifying edges are handled correctly without data loss.

**Acceptance Scenarios**:

1. **Given** a directed graph with both A→B and B→A edges, **When** user switches to undirected mode, **Then** the system merges duplicate edges or prompts user to resolve conflicts
2. **Given** an undirected graph, **When** user switches to directed mode, **Then** all existing edges become directed (A↔B becomes A→B)
3. **Given** a graph with self-loops, **When** switching modes, **Then** self-loops are preserved regardless of direction mode

---

### User Story 3 - Algorithm Compatibility (Priority: P3)

Algorithms must work correctly in both directed and undirected modes, with appropriate visual feedback during execution.

**Why this priority**: Ensures that the toggle feature doesn't break existing algorithm functionality.

**Independent Test**: Can be tested by running algorithms in both modes and verifying correct traversal and visualization.

**Acceptance Scenarios**:

1. **Given** a directed graph, **When** running BFS, **Then** the algorithm only traverses edges in their directed direction
2. **Given** an undirected graph, **When** running Dijkstra, **Then** the algorithm treats edges as bidirectional
3. **Given** any graph, **When** an algorithm highlights visited edges, **Then** only the correct directional edges are highlighted

---

### Edge Cases

- What happens when switching modes with conflicting edges (A→B and B→A in undirected mode)?
- How does the system handle self-loops in both modes?
- What occurs when algorithms are running during mode switch?
- How are edge weights preserved during mode transitions?
- What happens with text-based graph input when mode changes?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a UI toggle to switch between undirected and directed graph modes
- **FR-002**: System MUST display arrowheads on edges when in directed mode
- **FR-003**: System MUST hide arrowheads on edges when in undirected mode
- **FR-004**: System MUST handle edge conflicts when switching from directed to undirected mode (e.g., merge A→B and B→A)
- **FR-005**: System MUST preserve edge weights during mode transitions
- **FR-006**: System MUST ensure algorithms work correctly in both modes (directed traversal vs bidirectional)
- **FR-007**: System MUST fix edge highlighting logic to respect direction (don't highlight reverse edges in directed mode)
- **FR-008**: System MUST update text parser to support directed graph syntax using vertex order (e.g., "A B 3" creates directed edge A→B, "B A 5" creates B→A)
- **FR-009**: System MUST persist the current direction mode in graph state
- **FR-010**: System MUST prevent invalid operations (e.g., adding reverse edges in undirected mode)

### Key Entities

- **Graph Direction Mode**: Boolean state indicating whether the graph is directed (true) or undirected (false)
- **Edge Direction**: Property of each edge indicating if it's directed or bidirectional
- **Mode Toggle**: UI control for switching between directed and undirected modes

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can toggle between directed and undirected modes in under 2 seconds with immediate visual feedback
- **SC-002**: All algorithms execute correctly in both modes without errors for graphs up to 50 nodes
- **SC-003**: 95% of mode transitions preserve all edge data without conflicts or data loss
- **SC-004**: Edge highlighting during algorithm execution accurately reflects direction mode (no false highlights)
- **SC-005**: System handles edge conflicts during mode transitions with clear user feedback</content>
<parameter name="filePath">specs/001-graph-direction-toggle/spec.md