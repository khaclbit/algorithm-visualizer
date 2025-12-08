# Implementation Plan: Graph Direction Toggle

**Branch**: `001-graph-direction-toggle` | **Date**: 2025-12-08 | **Spec**: specs/001-graph-direction-toggle/spec.md
**Input**: Feature specification from `/specs/001-graph-direction-toggle/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Add a UI toggle to switch between undirected and directed graph modes, with proper handling of edge conflicts, algorithm compatibility, and visual feedback. The implementation will extend existing graph models and UI components to support both modes seamlessly.

## Technical Context

**Language/Version**: TypeScript 5.8.3  
**Primary Dependencies**: React 18.3.1, Vite, Shadcn/UI (Radix components), Tailwind CSS  
**Storage**: In-memory graph state with localStorage persistence  
**Testing**: Vitest for unit tests, integration tests for UI interactions  
**Target Platform**: Web browser (Chrome, Firefox, Safari)  
**Project Type**: Single web application  
**Performance Goals**: Toggle operation completes in <500ms, graph rendering <100ms for 50 nodes  
**Constraints**: Must maintain backward compatibility with existing undirected graphs  
**Scale/Scope**: Support graphs up to 100 nodes, handle mode transitions without data loss

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

No constitution principles defined in `.specify/memory/constitution.md`. Proceeding with standard web application development practices.

## Project Structure

### Documentation (this feature)

```text
specs/001-graph-direction-toggle/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── controls/
│   │   ├── GraphDirectionToggle.tsx    # New toggle component
│   │   └── Toolbar.tsx                 # Updated to include toggle
│   └── canvas/
│       ├── Edge.tsx                    # Updated for directed rendering
│       └── GraphCanvas.tsx             # Updated edge highlighting logic
├── context/
│   └── GraphContext.tsx                # Updated graph state management
├── lib/
│   ├── graphModelTransformer.ts        # Updated for directed parsing
│   └── textParser.ts                   # Updated for directed syntax
├── models/
│   └── graph.ts                        # Extended with direction properties
└── types/
    └── graphText.ts                    # Updated types for directed edges

test/
├── integration/
│   └── graphDirectionToggle.test.tsx   # New integration tests
└── lib/
    └── textParser.test.ts              # Updated parser tests
```

**Structure Decision**: Single web application structure using existing src/ organization. New components added to existing directories, existing files updated in-place to maintain compatibility.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No constitution violations identified.
