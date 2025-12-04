# Data Model: Persist Graph Editor Text

**Feature**: 001-persist-graph-editor  
**Date**: Thu Dec 04 2025  
**Status**: Complete

## Overview

The feature requires persistence of graph text content across browser sessions. The data model is simple, consisting of a single entity representing the persisted graph text.

## Entities

### GraphText

Represents the persisted text content of the graph editor.

**Fields**:
- `content`: string - The actual graph text content (required, max 10MB)
- `lastModified`: Date - Timestamp of last modification (auto-updated)
- `version`: number - Optional version number for future conflict resolution (optional)

**Validation Rules**:
- `content` must not be empty when saving
- `content` length must be ≤ 10MB (browser localStorage limit consideration)
- `lastModified` must be a valid Date object
- `version` must be a positive integer if provided

**Relationships**:
- None (single-user, client-side only)

**State Transitions**:
- Empty → Content: When user first enters text
- Content → Updated: When user modifies existing text
- Content → Empty: When user clears the editor (optional, may retain last state)

## Storage Schema

**localStorage Key**: `graph-editor-text`

**JSON Structure**:
```json
{
  "content": "node A -> node B\nnode B -> node C",
  "lastModified": "2025-12-04T10:30:00Z",
  "version": 1
}
```

## Business Rules

- Data persists across browser sessions but not across different browsers/devices
- If localStorage is unavailable (private browsing, quota exceeded), feature gracefully degrades
- No server synchronization required
- Data is not encrypted (client-side only, no security requirements specified)