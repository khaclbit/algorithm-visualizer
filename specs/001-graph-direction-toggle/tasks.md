# Tasks for Feature: 001-graph-direction-toggle

## Overview
This document outlines the atomic, verifiable subtasks for implementing the graph direction toggle feature in the algorithm-visualizer project. Tasks are organized by phases and user stories, with explicit dependencies and parallel execution markers where applicable.

**Feature Objective**: Allow users to toggle between directed and undirected graph representations in the visualizer.

**Key User Stories**:
- **US1**: As a user, I can toggle the graph direction between directed and undirected modes.
- **US2**: The toggle affects the visual representation of edges (arrows vs. lines).
- **US3**: The toggle persists across sessions and affects algorithm execution.
- **US4**: The toggle is accessible via a clear UI control in the toolbar.

**Priority Levels**:
- **P1**: Core functionality (US1, US2)
- **P2**: Persistence and algorithm integration (US3)
- **P3**: UI polish and accessibility (US4)

---

## Phase 1: Setup
Infrastructure and environment preparation tasks.

- [ ] **Install required dependencies for graph direction handling** (ID: SETUP-001, Parallel: yes, Story: N/A, Depends: N/A)  
  Install any new libraries or update existing ones for graph direction logic.  
  *Verification*: Run `npm install` and check package.json for new entries; no build errors.

- [ ] **Set up development environment for direction toggle testing** (ID: SETUP-002, Parallel: yes, Story: N/A, Depends: N/A)  
  Configure test environment with sample directed/undirected graphs.  
  *Verification*: Create test graph data and verify it loads in the app without errors.

- [ ] **Review existing graph model for direction support** (ID: SETUP-003, Parallel: no, Story: N/A, Depends: N/A)  
  Audit current graph.ts and related models for direction properties.  
  *Verification*: Document current direction handling in a comment or issue; confirm no breaking changes needed.

---

## Phase 2: Foundational
Core data model and logic implementation.

- [ ] **Extend graph data model to include direction property** (ID: FOUND-001, Parallel: no, Story: US1, Depends: SETUP-003)  
  Add `isDirected: boolean` to graph model and update TypeScript interfaces.  
  *Verification*: TypeScript compilation passes; new property appears in graph.ts.

- [ ] **Implement direction toggle logic in GraphContext** (ID: FOUND-002, Parallel: no, Story: US1, Depends: FOUND-001)  
  Add toggle function to GraphContext that updates graph direction state.  
  *Verification*: Call toggle function in console; graph state updates correctly.

- [ ] **Update edge rendering to respect direction** (ID: FOUND-003, Parallel: yes, Story: US2, Depends: FOUND-001)  
  Modify Edge.tsx to show arrows for directed graphs, lines for undirected.  
  *Verification*: Render graph with direction toggle; visual inspection shows arrows/lines appropriately.

- [ ] **Add direction validation in graph utilities** (ID: FOUND-004, Parallel: yes, Story: US1, Depends: FOUND-001)  
  Update validation.ts to check direction consistency.  
  *Verification*: Run validation on directed/undirected graphs; passes/fails as expected.

---

## Phase 3: User Stories P1
Core user-facing functionality.

- [ ] **Create direction toggle UI component** (ID: P1-001, Parallel: no, Story: US4, Depends: FOUND-002)  
  Add toggle button/switch to Toolbar.tsx with clear labeling.  
  *Verification*: UI renders toggle control; clicking changes state.

- [ ] **Integrate toggle with graph visualization** (ID: P1-002, Parallel: no, Story: US2, Depends: P1-001, FOUND-003)  
  Connect toggle to GraphCanvas re-rendering on direction change.  
  *Verification*: Toggle direction; edges update visually in real-time.

- [ ] **Add keyboard shortcut for direction toggle** (ID: P1-003, Parallel: yes, Story: US4, Depends: P1-001)  
  Implement Ctrl+D or similar shortcut to toggle direction.  
  *Verification*: Press shortcut; direction toggles without UI interaction.

- [ ] **Update algorithm execution to respect direction** (ID: P1-004, Parallel: no, Story: US1, Depends: FOUND-002)  
  Modify BFS/DFS/Dijkstra to handle directed vs undirected traversal.  
  *Verification*: Run algorithm on directed graph; respects direction in steps.

---

## Phase 4: User Stories P2
Persistence and advanced integration.

- [ ] **Implement localStorage persistence for direction** (ID: P2-001, Parallel: no, Story: US3, Depends: FOUND-002)  
  Save/load direction state using graphPersistence.ts.  
  *Verification*: Toggle direction, refresh page; direction persists.

- [ ] **Add direction to graph serialization** (ID: P2-002, Parallel: yes, Story: US3, Depends: P2-001)  
  Include direction in JSON import/export via graphSerializer.ts.  
  *Verification*: Export graph with direction; import preserves direction.

- [ ] **Update graph text editor to handle direction** (ID: P2-003, Parallel: no, Story: US3, Depends: P2-001)  
  Modify GraphTextEditor to parse/set direction from text input.  
  *Verification*: Edit graph text with direction; updates model correctly.

- [ ] **Add direction indicator in state panel** (ID: P2-004, Parallel: yes, Story: US4, Depends: FOUND-002)  
  Show current direction (Directed/Undirected) in StatePanel.tsx.  
  *Verification*: Toggle direction; panel updates to show current state.

---

## Phase 5: User Stories P3
Polish and edge cases.

- [ ] **Add tooltips and accessibility labels to toggle** (ID: P3-001, Parallel: yes, Story: US4, Depends: P1-001)  
  Include ARIA labels and hover tooltips for screen readers.  
  *Verification*: Inspect element for accessibility attributes; screen reader announces correctly.

- [ ] **Handle edge cases in direction toggle** (ID: P3-002, Parallel: no, Story: US1, Depends: P1-002)  
  Test toggle with empty graphs, self-loops, and invalid states.  
  *Verification*: Toggle in edge cases; no crashes or invalid states.

- [ ] **Add confirmation for direction changes during algorithm execution** (ID: P3-003, Parallel: no, Story: US2, Depends: P1-004)  
  Warn user if toggling direction mid-algorithm run.  
  *Verification*: Start algorithm, attempt toggle; confirmation dialog appears.

- [ ] **Optimize re-rendering performance on direction toggle** (ID: P3-004, Parallel: yes, Story: US2, Depends: P1-002)  
  Use React.memo and selective updates to prevent unnecessary re-renders.  
  *Verification*: Profile performance; toggle causes minimal re-renders.

---

## Phase 6: Polish
Final testing and refinements.

- [ ] **Write unit tests for direction toggle logic** (ID: POLISH-001, Parallel: yes, Story: N/A, Depends: FOUND-002)  
  Add tests in test/ for toggle function and direction validation.  
  *Verification*: Run `npm test`; all new tests pass.

- [ ] **Write integration tests for UI and persistence** (ID: POLISH-002, Parallel: yes, Story: N/A, Depends: P2-001)  
  Add e2e tests for toggle UI and localStorage persistence.  
  *Verification*: Run integration tests; UI and persistence work end-to-end.

- [ ] **Update documentation and tooltips** (ID: POLISH-003, Parallel: yes, Story: US4, Depends: P3-001)  
  Add help text and update README for direction toggle feature.  
  *Verification*: Documentation accessible; tooltips provide clear guidance.

- [ ] **Final QA and cross-browser testing** (ID: POLISH-004, Parallel: no, Story: N/A, Depends: POLISH-001, POLISH-002)  
  Test feature in multiple browsers and devices.  
  *Verification*: Feature works consistently across Chrome, Firefox, Safari.

---

## Dependencies Summary
- SETUP-003 depends on SETUP-001
- FOUND-001 depends on SETUP-003
- FOUND-002 depends on FOUND-001
- FOUND-003 depends on FOUND-001 (parallel with FOUND-004)
- FOUND-004 depends on FOUND-001 (parallel with FOUND-003)
- P1-001 depends on FOUND-002
- P1-002 depends on P1-001, FOUND-003
- P1-003 depends on P1-001 (parallel)
- P1-004 depends on FOUND-002
- P2-001 depends on FOUND-002
- P2-002 depends on P2-001 (parallel)
- P2-003 depends on P2-001
- P2-004 depends on FOUND-002 (parallel)
- P3-001 depends on P1-001 (parallel)
- P3-002 depends on P1-002
- P3-003 depends on P1-004
- P3-004 depends on P1-002 (parallel)
- POLISH-001 depends on FOUND-002 (parallel)
- POLISH-002 depends on P2-001 (parallel)
- POLISH-003 depends on P3-001 (parallel)
- POLISH-004 depends on POLISH-001, POLISH-002

**Parallel Tasks**: Marked as "Parallel: yes" can be worked on simultaneously where dependencies allow.

**Completion Criteria**: All tasks checked off, all verifications pass, feature fully functional per user stories.