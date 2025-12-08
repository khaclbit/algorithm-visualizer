import React, { useState, useEffect } from 'react';
import { GraphProvider, useGraph } from '@/context/GraphContext';
import { GraphCanvas } from '@/components/canvas/GraphCanvas';
import { Toolbar } from '@/components/controls/Toolbar';
import { AlgorithmPanel } from '@/components/controls/AlgorithmPanel';
import { StepControls } from '@/components/controls/StepControls';
import { StatePanel } from '@/components/panels/StatePanel';
import { PseudocodePanel } from '@/components/panels/PseudocodePanel';
import { JsonImportExport } from '@/components/controls/JsonImportExport';
import { TextEditorModal } from '@/components/controls/TextEditorModal';
import { Separator } from '@/components/ui/separator';
import { useIsMobile } from '@/hooks/use-mobile';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

const Index: React.FC = () => {
  const [isTextEditorOpen, setIsTextEditorOpen] = useState(false);
  const [editorContent, setEditorContent] = useState("");
  const isMobile = useIsMobile();
  const [isPanelOpen, setIsPanelOpen] = useState(true);

  // Keyboard shortcuts component
  const KeyboardShortcuts: React.FC = () => {
    const { toggleDirection, isRunning } = useGraph();

    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.ctrlKey && e.key === 'd' && !isRunning) {
          e.preventDefault();
          toggleDirection();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [toggleDirection, isRunning]);

    return null;
  };

  return (
    <GraphProvider>
      <KeyboardShortcuts />
      <div className="h-screen flex flex-col bg-background overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-3 md:px-4 py-2 md:py-3 border-b border-border bg-card">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="h-7 w-7 md:h-8 md:w-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4 md:h-5 md:w-5 text-primary"
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
              <h1 className="text-sm md:text-lg font-semibold text-foreground">Graph Visualizer</h1>
              <p className="text-[10px] md:text-xs text-muted-foreground hidden sm:block">Interactive algorithm visualization</p>
            </div>
          </div>
          <JsonImportExport />
        </header>

        {/* Mobile Layout */}
        {isMobile ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Mobile Toolbar - horizontal */}
            <div className="p-2 border-b border-border">
              <Toolbar onTextEditorOpen={() => setIsTextEditorOpen(true)} />
            </div>

            {/* Canvas - takes remaining space */}
            <div className="flex-1 min-h-0 p-2">
              <div className="h-full panel overflow-hidden">
                <GraphCanvas />
              </div>
            </div>

            {/* Collapsible control panel */}
            <Collapsible open={isPanelOpen} onOpenChange={setIsPanelOpen}>
              <CollapsibleTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="w-full h-8 rounded-none border-t border-border flex items-center justify-center gap-2"
                >
                  {isPanelOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                  <span className="text-xs">Controls</span>
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="border-t border-border bg-card max-h-[50vh] overflow-hidden">
                  <Tabs defaultValue="algorithm" className="w-full">
                    <TabsList className="w-full grid grid-cols-4 h-9">
                      <TabsTrigger value="algorithm" className="text-xs">Algorithm</TabsTrigger>
                      <TabsTrigger value="code" className="text-xs">Code</TabsTrigger>
                      <TabsTrigger value="playback" className="text-xs">Playback</TabsTrigger>
                      <TabsTrigger value="state" className="text-xs">State</TabsTrigger>
                    </TabsList>
                    <div className="p-2 overflow-auto max-h-[calc(50vh-36px)]">
                      <TabsContent value="algorithm" className="mt-0">
                        <AlgorithmPanel />
                      </TabsContent>
                      <TabsContent value="code" className="mt-0">
                        <PseudocodePanel />
                      </TabsContent>
                      <TabsContent value="playback" className="mt-0">
                        <StepControls />
                      </TabsContent>
                      <TabsContent value="state" className="mt-0">
                        <StatePanel />
                      </TabsContent>
                    </div>
                  </Tabs>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        ) : (
          /* Desktop Layout */
          <div className="flex-1 flex overflow-hidden">
            {/* Left toolbar */}
            <div className="p-3">
              <Toolbar onTextEditorOpen={() => setIsTextEditorOpen(true)} />
            </div>

            {/* Resizable main area */}
            <ResizablePanelGroup direction="horizontal" className="flex-1">
              {/* Pseudocode Panel - Left side */}
              <ResizablePanel defaultSize={15} minSize={10} maxSize={25}>
                <div className="h-full p-3 overflow-hidden">
                  <PseudocodePanel />
                </div>
              </ResizablePanel>

              <ResizableHandle withHandle />

              {/* Canvas area */}
              <ResizablePanel defaultSize={55} minSize={30}>
                <div className="h-full p-3">
                  <div className="h-full panel overflow-hidden">
                    <GraphCanvas />
                  </div>
                </div>
              </ResizablePanel>

              <ResizableHandle withHandle />

              {/* Right sidebar */}
              <ResizablePanel defaultSize={30} minSize={15} maxSize={50}>
                <div className="h-full p-3 overflow-hidden">
                  <ResizablePanelGroup direction="vertical">
                    {/* Algorithm Panel */}
                    <ResizablePanel defaultSize={35} minSize={20}>
                      <div className="h-full overflow-auto pb-2">
                        <AlgorithmPanel />
                      </div>
                    </ResizablePanel>

                    <ResizableHandle withHandle />

                    {/* Step Controls */}
                    <ResizablePanel defaultSize={30} minSize={15}>
                      <div className="h-full overflow-auto py-2">
                        <StepControls />
                      </div>
                    </ResizablePanel>

                    <ResizableHandle withHandle />

                    {/* State Panel */}
                    <ResizablePanel defaultSize={35} minSize={20}>
                      <div className="h-full overflow-auto pt-2">
                        <StatePanel />
                      </div>
                    </ResizablePanel>
                  </ResizablePanelGroup>
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>
        )}

        {/* Footer hint - desktop only */}
        {!isMobile && (
          <footer className="px-4 py-2 border-t border-border bg-card/50">
            <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
              <span><kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">Click</kbd> canvas to add nodes</span>
              <Separator orientation="vertical" className="h-4" />
              <span><kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">Drag</kbd> to move nodes</span>
              <Separator orientation="vertical" className="h-4" />
              <span>Select two nodes to add edge</span>
            </div>
          </footer>
        )}

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
