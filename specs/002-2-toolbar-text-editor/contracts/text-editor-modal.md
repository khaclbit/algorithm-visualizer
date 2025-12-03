# TextEditorModal Component Contract

**Feature**: Toolbar Text Editor Button  
**Date**: Thu Dec 04 2025  
**Phase**: 1 (Design)

## Component Overview
A modal dialog that provides a text editing interface for user input.

## Props Interface

```typescript
interface TextEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialContent?: string;
  onContentChange?: (content: string) => void;
  title?: string;
}
```

## Props Description

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `isOpen` | `boolean` | Yes | Controls modal visibility |
| `onClose` | `() => void` | Yes | Callback when modal should close |
| `initialContent` | `string` | No | Initial text content to display |
| `onContentChange` | `(content: string) => void` | No | Callback when content changes |
| `title` | `string` | No | Modal title (defaults to "Text Editor") |

## Behavior Contract

### Opening
- When `isOpen` becomes `true`, modal displays with focus on textarea
- If `initialContent` provided, populate textarea
- Modal should be centered and responsive

### Text Editing
- User can type, delete, copy, paste in textarea
- `onContentChange` called on every keystroke (debounced if needed)
- No rich text formatting

### Closing
- ESC key closes modal and calls `onClose`
- Close button in header closes modal and calls `onClose`
- Clicking outside modal closes it (if enabled in Dialog)

### Accessibility
- Proper ARIA labels
- Keyboard navigation support
- Screen reader compatible

## Future Extensions
- Add save/cancel buttons with different callbacks
- Add syntax highlighting for code input
- Add file import/export functionality
- Add processing status indicators</content>
<parameter name="filePath">/home/bojack/Code/algorithm-visualizer/specs/002-2-toolbar-text-editor/contracts/text-editor-modal.md