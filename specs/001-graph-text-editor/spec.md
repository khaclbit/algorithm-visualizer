# Feature Specification: Graph Text Editor

**Feature Branch**: `001-graph-text-editor`  
**Created**: December 4, 2025  
**Status**: Draft  
**Input**: User description: "continue feature from the text editor, now the place holder i told before is about graph editor, which is the editor let us editor graph easier by using this format"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create Graph from Text Input (Priority: P1)

Users need to quickly define graphs using a simple text format instead of manually drawing nodes and edges through the visual interface. They can type edge definitions like "1 3 1" (meaning an edge from node 1 to node 3 with weight 1) and see their graph visualized instantly.

**Why this priority**: This is the core functionality that enables rapid graph creation. Without this, users have to manually click and drag to create each node and edge, which is time-consuming for larger graphs. This feature directly addresses the user's need for "easier graph editing."

**Independent Test**: Can be fully tested by typing simple edge definitions in a text input area and verifying that the corresponding graph appears in the visual canvas with correct nodes and edge weights.

**Acceptance Scenarios**:

1. **Given** an empty algorithm visualizer, **When** user enters "1 2 5" in the text editor, **Then** two nodes labeled "1" and "2" appear connected by an edge with weight "5"
2. **Given** the text editor contains "A B 3", **When** user enters a new line with "B C 7", **Then** three nodes (A, B, C) appear with two edges: A-B (weight 3) and B-C (weight 7)
3. **Given** multiple edge definitions in the text editor, **When** user modifies one line from "1 2 5" to "1 2 10", **Then** the corresponding edge weight updates from 5 to 10 in the visual graph

---

### User Story 2 - Edit Graph Through Text Modifications (Priority: P2)

Users want to modify existing graphs by editing the text representation rather than interacting with the visual canvas. They can change weights, add/remove edges, or rename vertices by modifying the text and seeing changes reflected immediately.

**Why this priority**: This provides a complementary editing workflow that many users find more precise than visual manipulation. It's essential for making quick adjustments and enables copy/paste workflows.

**Independent Test**: Can be tested by starting with a predefined graph, modifying its text representation, and verifying the visual graph updates accordingly.

**Acceptance Scenarios**:

1. **Given** a graph with text "1 2 5\n2 3 3", **When** user deletes the line "2 3 3", **Then** the edge between nodes 2 and 3 disappears from the visual graph
2. **Given** text "A B 4", **When** user changes it to "X Y 4", **Then** nodes A and B are renamed to X and Y respectively
3. **Given** text "1 2 5", **When** user adds a new line "1 3 8", **Then** a new node "3" appears connected to node "1" with weight 8

---

### User Story 3 - Bidirectional Sync Between Text and Visual (Priority: P3)

When users make changes to the graph through the visual interface (adding nodes, edges, or changing weights), the text editor automatically updates to reflect these changes. This ensures the text representation always matches the visual graph.

**Why this priority**: This creates a seamless experience where users can switch between text and visual editing modes without losing consistency. It's lower priority because the main value comes from text-to-visual conversion.

**Independent Test**: Can be tested by making visual changes to a graph and verifying the text editor content updates automatically.

**Acceptance Scenarios**:

1. **Given** an empty graph, **When** user adds two nodes and connects them with weight 10 using visual tools, **Then** text editor shows the corresponding edge definition (e.g., "Node_1 Node_2 10")
2. **Given** a graph with text representation, **When** user changes an edge weight using visual controls, **Then** the corresponding line in the text editor updates with the new weight

---

### Edge Cases

- What happens when user enters invalid format (e.g., missing weight, non-alphanumeric vertex names, negative weights)?
- How does system handle duplicate edge definitions between the same vertices?
- What occurs when text contains edges referencing the same vertex (self-loops)?
- How does system respond to extremely large weight values or very long vertex names?
- What happens when user enters edges that would create cycles in algorithms that expect DAGs?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST parse text input where each line represents an edge in format "vertex1 vertex2 weight"
- **FR-002**: System MUST support alphanumeric vertex names (both letters and numbers)
- **FR-003**: System MUST support positive numeric weights (integers and decimals)
- **FR-004**: System MUST automatically create nodes when they appear in edge definitions
- **FR-005**: System MUST update the visual graph immediately when text input changes
- **FR-006**: System MUST validate input format and display clear error messages for invalid entries
- **FR-007**: System MUST handle whitespace and empty lines gracefully (ignore them)
- **FR-008**: System MUST support deletion of edges by removing corresponding text lines
- **FR-009**: System MUST allow modification of existing edges by editing text lines
- **FR-010**: System MUST re-layout the entire graph with each change for optimal positioning
- **FR-011**: System MUST synchronize text representation when graph is modified through visual interface
- **FR-012**: System MUST support undirected graphs (bidirectional edges)

### Key Entities

- **Edge Definition**: Text representation containing source vertex, target vertex, and weight (e.g., "A B 5")
- **Vertex**: Graph node identified by alphanumeric name, position determined by layout algorithm
- **Weight**: Numeric value associated with an edge, displayed on the edge in the visual graph
- **Graph Text**: Complete text representation consisting of multiple edge definitions, one per line

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can create a 10-node graph in under 30 seconds using text input (compared to 2+ minutes with visual tools)
- **SC-002**: System parses and visualizes text input with less than 500ms latency for graphs up to 100 edges
- **SC-003**: 95% of valid text inputs result in correct graph visualization without errors
- **SC-004**: Users can successfully modify existing graphs through text editing in under 10 seconds per change
- **SC-005**: Text-to-visual and visual-to-text synchronization occurs within 200ms of any change
- **SC-006**: Error messages for invalid input are displayed within 1 second and clearly indicate the specific problem
