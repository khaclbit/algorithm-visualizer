import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GraphTextEditor } from './GraphTextEditor';

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
  const [activeTab, setActiveTab] = useState('graph');

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
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="graph">Graph Editor</TabsTrigger>
            <TabsTrigger value="text">Text Editor</TabsTrigger>
          </TabsList>

          <TabsContent value="graph" className="flex-1 mt-4">
            <GraphTextEditor 
              className="h-full"
              onContentChange={onContentChange}
            />
          </TabsContent>

          <TabsContent value="text" className="flex-1 mt-4 flex flex-col">
            <div className="flex-1 flex flex-col gap-4">
              <Textarea
                value={content}
                onChange={(e) => handleContentChange(e.target.value)}
                placeholder="Enter text here... // TODO: Add text processing logic for app input"
                className="flex-1 resize-none"
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleClose}>
                  Close
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}