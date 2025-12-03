# Quickstart Implementation Guide

**Feature**: Toolbar Text Editor Button  
**Date**: Thu Dec 04 2025  
**Phase**: 1 (Design)

## Implementation Steps

### 1. Create TextEditorModal Component
```bash
# Create new file
touch src/components/controls/TextEditorModal.tsx
```

**Code Structure**:
```typescript
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface TextEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialContent?: string;
  onContentChange?: (content: string) => void;
}

export function TextEditorModal({
  isOpen,
  onClose,
  initialContent = "",
  onContentChange
}: TextEditorModalProps) {
  const [content, setContent] = useState(initialContent);

  const handleContentChange = (value: string) => {
    setContent(value);
    onContentChange?.(value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Text Editor</DialogTitle>
        </DialogHeader>
        <Textarea
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          placeholder="Enter text here... // TODO: Add text processing logic"
          className="min-h-[200px]"
        />
        <div className="flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

### 2. Update Toolbar Component
```typescript
// In src/components/controls/Toolbar.tsx
import { FileText } from "lucide-react"; // Assuming Lucide icons

interface ToolbarProps {
  // ... existing props
  onTextEditorOpen?: () => void;
}

export function Toolbar({ onTextEditorOpen, ...props }: ToolbarProps) {
  return (
    <div className="toolbar">
      {/* ... existing buttons */}
      <Button
        onClick={onTextEditorOpen}
        variant="outline"
        size="sm"
      >
        <FileText className="w-4 h-4 mr-2" />
        Text Editor
      </Button>
    </div>
  );
}
```

### 3. Integrate in Main Component
```typescript
// In the main page/component where Toolbar is used
import { TextEditorModal } from "@/components/controls/TextEditorModal";

function MainComponent() {
  const [isTextEditorOpen, setIsTextEditorOpen] = useState(false);
  const [editorContent, setEditorContent] = useState("");

  return (
    <>
      <Toolbar onTextEditorOpen={() => setIsTextEditorOpen(true)} />
      <TextEditorModal
        isOpen={isTextEditorOpen}
        onClose={() => setIsTextEditorOpen(false)}
        initialContent={editorContent}
        onContentChange={setEditorContent}
      />
    </>
  );
}
```

## Testing Checklist

- [ ] Button appears in toolbar
- [ ] Clicking button opens modal
- [ ] Modal displays textarea with placeholder
- [ ] Typing updates content
- [ ] Closing modal works (ESC, close button, outside click)
- [ ] Modal is responsive on mobile
- [ ] No console errors

## Future Enhancement Points

```typescript
// Placeholder for future processing
const handleProcessText = async (content: string) => {
  // TODO: Implement text processing logic
  // This could parse algorithm input, validate data, etc.
  console.log("Processing text:", content);
};
```

## Dependencies

- Ensure `lucide-react` is installed for icons
- Uses existing shadcn/ui components: Dialog, Textarea, Button

## File Changes Summary

- **NEW**: `src/components/controls/TextEditorModal.tsx`
- **MODIFIED**: `src/components/controls/Toolbar.tsx` (add button and prop)
- **MODIFIED**: Main component file (add state and modal integration)</content>
<parameter name="filePath">/home/bojack/Code/algorithm-visualizer/specs/002-2-toolbar-text-editor/quickstart.md