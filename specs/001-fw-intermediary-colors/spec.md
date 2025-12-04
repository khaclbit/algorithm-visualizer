# Feature: Floyd-Warshall Intermediary Node Coloring

## Overview

Enhance the Floyd-Warshall algorithm visualization by using different colors for the intermediary node compared to the two nodes whose shortest path is being optimized, improving user understanding of the algorithm's mechanics.

## User Scenarios & Testing

### Primary User Scenario

**Scenario**: User runs Floyd-Warshall algorithm visualization

Given a graph with multiple nodes and edges

When the algorithm processes a pair of nodes (i, j) using an intermediary node k

Then the intermediary node k is displayed in a distinct color from nodes i and j

And users can clearly see which node serves as the intermediary for the current optimization step

### Acceptance Scenarios

1. **Color Distinction**: During FW execution, intermediary node appears in different color than the optimized node pair
2. **Visual Clarity**: Users can easily identify which node is the intermediary versus the source/destination pair
3. **Consistent Coloring**: Color scheme remains consistent throughout the algorithm execution
4. **Performance**: Visualization updates smoothly without impacting algorithm execution speed

## Functional Requirements

- **FR-001**: During Floyd-Warshall visualization, highlight the intermediary node (k) with a distinct color
- **FR-002**: Display the source node (i) and destination node (j) being optimized with a different color from the intermediary
- **FR-003**: Ensure color differences are visually distinguishable (sufficient contrast)
- **FR-004**: Maintain color highlighting throughout the current optimization step
- **FR-005**: Reset node colors appropriately between optimization steps

## Success Criteria

- **SC-001**: 100% of users can correctly identify the intermediary node during FW visualization (measured by user testing)
- **SC-002**: Intermediary node color differs noticeably from optimized pair colors (contrast ratio > 3:1)
- **SC-003**: No performance degradation in visualization updates (>30 FPS during animation)
- **SC-004**: Color scheme enhances rather than confuses algorithm understanding

## Key Entities

- Graph nodes (with position, label, current color state)
- Floyd-Warshall algorithm state (current i, j, k indices)
- Color schemes for different node roles

## Assumptions

- Floyd-Warshall algorithm is already implemented and visualizable
- Graph visualization system supports dynamic node coloring
- Users understand basic graph concepts and shortest path algorithms
- Color blindness considerations: use both color and potentially shape/size differences