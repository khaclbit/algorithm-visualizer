import React, { useState } from 'react';
import { GraphProvider } from '@/context/GraphContext';
import { GraphCanvas } from '@/components/canvas/GraphCanvas';
import { Toolbar } from '@/components/controls/Toolbar';
import { AlgorithmPanel } from '@/components/controls/AlgorithmPanel';
import { StepControls } from '@/components/controls/StepControls';
import { StatePanel } from '@/components/panels/StatePanel';
import { JsonImportExport } from '@/components/controls/JsonImportExport';
import { TextEditorModal } from '@/components/controls/TextEditorModal';
import { Separator } from '@/components/ui/separator';

const Index: React.FC = () => {
  const [isTextEditorOpen, setIsTextEditorOpen] = useState(false);
  const [editorContent, setEditorContent] = useState("");

  return (
    <GraphProvider>
      <div className="h-screen flex flex-col bg-background overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5 text-primary"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="5" cy="5" r="3" />
                <circle cx="19" cy="5" r="3" />
                <circle cx="12" cy="19" r="3" />
                <line x1="7.5" y1="6.5" x2="10" y2="17" />
                <line x1="16.5" y1="6.5" x2="14" y2="17" />
                <line x1="8" y1="5" x2="16" y2="5" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">Graph Algorithm Visualizer</h1>
              <p className="text-xs text-muted-foreground">Interactive algorithm visualization</p>
            </div>
          </div>
          <JsonImportExport />
        </header>

        {/* Main content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left toolbar */}
          <div className="p-3">
            <Toolbar onTextEditorOpen={() => setIsTextEditorOpen(true)} />
          </div>

          {/* Canvas area */}
          <div className="flex-1 p-3">
            <div className="h-full panel overflow-hidden">
              <GraphCanvas />
            </div>
          </div>

          {/* Right sidebar */}
          <div className="w-72 p-3 flex flex-col gap-3 overflow-y-auto">
            <AlgorithmPanel />
            <StepControls />
            <div className="flex-1 min-h-0">
              <StatePanel />
            </div>
          </div>
        </div>

        {/* Footer hint */}
        <footer className="px-4 py-2 border-t border-border bg-card/50">
          <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
            <span><kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">Click</kbd> canvas to add nodes</span>
            <Separator orientation="vertical" className="h-4" />
            <span><kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">Drag</kbd> to move nodes</span>
            <Separator orientation="vertical" className="h-4" />
            <span>Select two nodes to add edge</span>
          </div>
        </footer>

        {/* Text Editor Modal */}
        <TextEditorModal
          isOpen={isTextEditorOpen}
          onClose={() => setIsTextEditorOpen(false)}
          initialContent={editorContent}
          onContentChange={setEditorContent}
        />
      </div>
    </GraphProvider>
  );
};

export default Index;
