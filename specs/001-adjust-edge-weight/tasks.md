# Tasks: Adjust Edge Weight

**Input**: Design documents from `/specs/001-adjust-edge-weight/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: No test tasks included - not requested in feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- Paths shown below assume single project - adjust based on plan.md structure

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create hit detection utility library in src/lib/hitDetection.ts
- [x] T002 Create weight validation utility in src/lib/validation.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 [P] Update GraphContext interface to include weight update methods in src/context/GraphContext.tsx
- [x] T004 [P] Add weight validation to graph models in src/models/graph.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Adjust Edge Weight by Clicking (Priority: P1) 🎯 MVP

**Goal**: Enable users to click on graph edges and adjust their weights through an inline input interface

**Independent Test**: Click on any edge in the graph, enter a new numeric weight, and verify the weight updates are reflected in the graph display and algorithm calculations

### Implementation for User Story 1

- [x] T005 [US1] Implement point-to-line distance calculation in src/lib/hitDetection.ts
- [x] T006 [US1] Implement edge hit detection function in src/lib/hitDetection.ts
- [x] T007 [US1] Add weight validation function in src/lib/validation.ts
- [x] T008 [US1] Update GraphContext to implement updateEdgeWeight method in src/context/GraphContext.tsx
- [x] T009 [US1] Modify Edge component to detect clicks and show input field in src/components/canvas/Edge.tsx
- [x] T010 [US1] Add inline weight editing UI to Edge component in src/components/canvas/Edge.tsx
- [x] T011 [US1] Update GraphCanvas to handle canvas click events in src/components/canvas/GraphCanvas.tsx
- [x] T012 [US1] Integrate hit detection with canvas click handling in src/components/canvas/GraphCanvas.tsx

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T013 [P] Add accessibility features (ARIA labels, keyboard navigation) to Edge component
- [x] T014 [P] Add error handling for invalid weight inputs
- [x] T015 [P] Optimize hit detection performance for large graphs
- [x] T016 [P] Add visual feedback for edge selection and editing states
- [x] T017 Run quickstart.md validation checklist

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories

### Within Each User Story

- Utility functions before component modifications
- Context updates before component integration
- Core click detection before input UI
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch utility functions together:
Task: "Implement point-to-line distance calculation in src/lib/hitDetection.ts"
Task: "Implement edge hit detection function in src/lib/hitDetection.ts"

# Launch context and component updates together:
Task: "Update GraphContext to implement updateEdgeWeight method in src/context/GraphContext.tsx"
Task: "Modify Edge component to detect clicks and show input field in src/components/canvas/Edge.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence