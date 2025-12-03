import React from 'react';
import { useGraph, InteractionMode } from '@/context/GraphContext';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { MousePointer2, Circle, GitBranch, Trash2, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const { mode, setMode, isRunning } = useGraph();

  return (
    <div className="flex flex-col gap-1 p-2 panel">
      {tools.map(tool => (
        <Tooltip key={tool.mode}>
          <TooltipTrigger asChild>
            <Button
              variant={mode === tool.mode ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setMode(tool.mode)}
              disabled={isRunning}
              className={cn(
                'h-10 w-10',
                mode === tool.mode && 'bg-primary text-primary-foreground'
              )}
            >
              {tool.icon}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>{tool.label} ({tool.shortcut})</p>
          </TooltipContent>
        </Tooltip>
      ))}
      <div className="border-t pt-1 mt-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onTextEditorOpen}
              disabled={isRunning}
              className="h-10 w-10"
            >
              <FileText className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Open Text Editor</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};
