# Tasks: Deploy on GitHub Pages

**Input**: Design documents from `/specs/001-deploy-github-pages/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: No test tasks included - tests not requested in feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `src/`, `public/`, `.github/workflows/` at repository root
- Paths shown below follow the project structure from plan.md

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure for GitHub Pages compatibility

- [x] T001 Add .nojekyll file to prevent Jekyll processing in public/.nojekyll
- [x] T002 Create .github/workflows directory structure

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

No foundational tasks required - this feature modifies existing application structure.

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Deploy Application to GitHub Pages (Priority: P1) 🎯 MVP

**Goal**: Enable deployment of the algorithm visualizer application to GitHub Pages so users can access it online

**Independent Test**: Access the GitHub Pages URL and verify the application loads and all features work correctly

### Implementation for User Story 1

- [x] T003 [US1] Configure Vite base path for GitHub Pages in vite.config.ts
- [x] T004 [US1] Create GitHub Actions workflow for automated deployment in .github/workflows/deploy.yml
- [x] T005 [US1] Update package.json build scripts for production deployment

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently - application can be deployed to GitHub Pages

---

## Phase 4: User Story 2 - Adjust Code for GitHub Pages Compatibility (Priority: P2)

**Goal**: Adjust code for proper GitHub Pages compatibility including routing and asset loading

**Independent Test**: Deploy to GitHub Pages and verify navigation, asset loading, and routing work correctly

### Implementation for User Story 2

- [x] T006 [US2] Create custom 404.html for SPA routing in public/404.html
- [x] T007 [US2] Add SPA redirect script to index.html for client-side routing
- [x] T008 [US2] Test production build locally with npm run build && npm run preview

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - full GitHub Pages compatibility achieved

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements and validation

- [x] T009 Update README.md with deployment instructions
- [x] T010 Validate deployment against build contract requirements
- [x] T011 Test complete deployment workflow end-to-end

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Builds on US1 deployment but can be tested independently

### Within Each User Story

- Core configuration before testing
- Deployment setup before compatibility adjustments
- Local testing before final validation

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch deployment configuration tasks together:
Task: "Configure Vite base path for GitHub Pages in vite.config.ts"
Task: "Create GitHub Actions workflow for automated deployment in .github/workflows/deploy.yml"
Task: "Update package.json build scripts for production deployment"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently - verify application deploys and works on GitHub Pages
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP: Basic deployment working!)
3. Add User Story 2 → Test independently → Deploy/Demo (Full compatibility)
4. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (deployment setup)
   - Developer B: User Story 2 (compatibility adjustments)
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence