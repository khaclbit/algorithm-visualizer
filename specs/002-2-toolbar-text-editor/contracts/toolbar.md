# Toolbar Component Contract (Updated)

**Feature**: Toolbar Text Editor Button  
**Date**: Thu Dec 04 2025  
**Phase**: 1 (Design)

## Component Overview
The existing Toolbar component with addition of Text Editor button.

## Updated Props Interface

```typescript
interface ToolbarProps {
  // Existing props...
  onTextEditorOpen?: () => void;
}
```

## New Props Description

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `onTextEditorOpen` | `() => void` | No | Callback when text editor button is clicked |

## Behavior Contract

### Existing Functionality
- Maintains all current toolbar buttons and layout
- Preserves existing styling and responsiveness

### New Text Editor Button
- Added as a new button in the toolbar
- Displays appropriate icon (document/text icon)
- Accessible label: "Open Text Editor"
- When clicked, calls `onTextEditorOpen` if provided
- Positioned logically in the toolbar (e.g., after existing controls)

### Layout
- Button integrates seamlessly with existing toolbar design
- Maintains consistent spacing and alignment
- Responsive on mobile devices

## Implementation Notes
- Button uses existing Button component from ui/
- Icon from existing icon library (Lucide React assumed)
- Follows existing toolbar button patterns</content>
<parameter name="filePath">/home/bojack/Code/algorithm-visualizer/specs/002-2-toolbar-text-editor/contracts/toolbar.md