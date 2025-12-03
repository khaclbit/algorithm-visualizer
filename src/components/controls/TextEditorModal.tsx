import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface TextEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialContent?: string;
  onContentChange?: (content: string) => void;
  title?: string;
}

export function TextEditorModal({
  isOpen,
  onClose,
  initialContent = "",
  onContentChange,
  title = "Text Editor"
}: TextEditorModalProps) {
  const [content, setContent] = useState(initialContent);

  const handleContentChange = (value: string) => {
    setContent(value);
    onContentChange?.(value);
  };

  const handleClose = () => {
    onClose();
    // TODO: Add text processing logic here when implementing app input functionality
    // For example: parse content, validate, send to algorithms, etc.
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <Textarea
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          placeholder="Enter text here... // TODO: Add text processing logic for app input"
          className="min-h-[300px] resize-none"
        />
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}