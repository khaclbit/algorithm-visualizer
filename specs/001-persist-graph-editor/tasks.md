# Tasks: Persist Graph Editor Text

**Input**: Design documents from `/specs/001-persist-graph-editor/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are included based on quickstart.md examples and standard testing practices for this feature.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `test/` at repository root
- Paths adjusted based on plan.md structure

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create persistence-related directories in src/hooks/ and src/lib/
- [ ] T002 Verify existing GraphTextEditor component in src/components/controls/GraphTextEditor.tsx

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T003 Review existing project structure and dependencies for persistence compatibility
- [ ] T004 Ensure localStorage is available and test basic functionality

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Persist Graph Text (Priority: P1) 🎯 MVP

**Goal**: Automatically save and restore graph text input across browser sessions to enable persistent editing.

**Independent Test**: Can be fully tested by entering text in the editor, closing it, reopening it, and verifying the text is restored, delivering value through persistent editing state.

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T005 [P] [US1] Unit tests for persistence utility in test/lib/graphPersistence.test.ts
- [x] T006 [P] [US1] Integration tests for GraphTextEditor persistence in test/integration/graphTextEditorPersistence.test.ts

### Implementation for User Story 1

- [ ] T007 [P] [US1] Create useGraphPersistence hook in src/hooks/useGraphPersistence.ts
- [ ] T008 [P] [US1] Create graphPersistence utility in src/lib/graphPersistence.ts
- [x] T009 [US1] Update GraphTextEditor component to use persistence in src/components/controls/GraphTextEditor.tsx
- [x] T010 [US1] Add error handling for localStorage failures in persistence logic
- [x] T011 [US1] Test manual persistence functionality (enter text, refresh page, verify restoration)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T012 [P] Documentation updates for persistence feature in README or component docs
- [ ] T013 Code cleanup and refactoring of persistence logic
- [ ] T014 [P] Additional edge case tests (private browsing, storage quota) in test/lib/graphPersistence.test.ts
- [ ] T015 Run quickstart.md validation and update if needed
- [ ] T016 Performance testing of persistence operations

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Hook/utility before component updates
- Core implementation before error handling
- Manual testing before polish

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Hook and utility can be developed in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "Unit tests for persistence utility in test/lib/graphPersistence.test.ts"
Task: "Integration tests for GraphTextEditor persistence in test/integration/graphTextEditorPersistence.test.ts"

# Launch hook and utility in parallel:
Task: "Create useGraphPersistence hook in src/hooks/useGraphPersistence.ts"
Task: "Create graphPersistence utility in src/lib/graphPersistence.ts"
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
3. Each story adds value without breaking previous functionality

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 implementation
   - Developer B: User Story 1 tests
3. Story complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence