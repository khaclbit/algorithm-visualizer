import React from 'react';
import { useGraph, InteractionMode } from '@/context/GraphContext';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { MousePointer2, Circle, GitBranch, Trash2, FileText, Image, Film, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { GraphDirectionToggle } from './GraphDirectionToggle';
import { toast } from 'sonner';

const tools: { mode: InteractionMode; icon: React.ReactNode; label: string; shortcut: string }[] = [
  { mode: 'select', icon: <MousePointer2 className="h-4 w-4" />, label: 'Select & Move', shortcut: 'V' },
  { mode: 'add-node', icon: <Circle className="h-4 w-4" />, label: 'Add Node', shortcut: 'N' },
  { mode: 'add-edge', icon: <GitBranch className="h-4 w-4" />, label: 'Add Edge', shortcut: 'E' },
  { mode: 'delete', icon: <Trash2 className="h-4 w-4" />, label: 'Delete', shortcut: 'D' },
];

interface ToolbarProps {
  onTextEditorOpen?: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ onTextEditorOpen }) => {
  const { mode, setMode, isRunning, exportCanvasAsImage, exportAsGif, isExportingGif, gifExportProgress, steps } = useGraph();
  const isMobile = useIsMobile();

  const handleGifExport = async () => {
    if (steps.length === 0) {
      toast.error('No algorithm steps to export. Please run an algorithm first.');
      return;
    }
    
    try {
      toast.info('Generating GIF... This may take a moment.');
      await exportAsGif();
      toast.success('GIF exported successfully!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to export GIF');
    }
  };

  return (
    <div className={cn(
      "flex gap-1 p-2 panel",
      isMobile ? "flex-row justify-center" : "flex-col"
    )}>
      {tools.map(tool => (
        <Tooltip key={tool.mode}>
          <TooltipTrigger asChild>
            <Button
              variant={mode === tool.mode ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setMode(tool.mode)}
              disabled={isRunning}
              className={cn(
                'h-9 w-9 md:h-10 md:w-10',
                mode === tool.mode && 'bg-primary text-primary-foreground'
              )}
            >
              {tool.icon}
            </Button>
          </TooltipTrigger>
          <TooltipContent side={isMobile ? "bottom" : "right"}>
            <p>{tool.label} {!isMobile && `(${tool.shortcut})`}</p>
          </TooltipContent>
        </Tooltip>
      ))}
      <div className={cn(
        isMobile ? "border-l pl-1 ml-1" : "border-t pt-1 mt-1"
      )}>
        <GraphDirectionToggle />
      </div>
      <div className={cn(
        isMobile ? "border-l pl-1 ml-1" : "border-t pt-1 mt-1"
      )}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onTextEditorOpen}
              disabled={isRunning}
              className="h-9 w-9 md:h-10 md:w-10"
            >
              <FileText className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side={isMobile ? "bottom" : "right"}>
            <p>Open Text Editor</p>
          </TooltipContent>
        </Tooltip>
      </div>
      <div className={cn(
        isMobile ? "border-l pl-1 ml-1" : "border-t pt-1 mt-1"
      )}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={exportCanvasAsImage}
              className="h-9 w-9 md:h-10 md:w-10"
            >
              <Image className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side={isMobile ? "bottom" : "right"}>
            <p>Export as PNG</p>
          </TooltipContent>
        </Tooltip>
      </div>
      <div className={cn(
        isMobile ? "border-l pl-1 ml-1" : "border-t pt-1 mt-1"
      )}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleGifExport}
              disabled={isExportingGif || steps.length === 0}
              className="h-9 w-9 md:h-10 md:w-10 relative"
            >
              {isExportingGif ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Film className="h-4 w-4" />
              )}
              {isExportingGif && gifExportProgress > 0 && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[8px] font-bold">
                  {Math.round(gifExportProgress * 100)}%
                </span>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side={isMobile ? "bottom" : "right"}>
            <p>{steps.length === 0 ? 'Run algorithm first' : 'Export as GIF'}</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};
