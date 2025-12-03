import React, { useRef } from 'react';
import { useGraph } from '@/context/GraphContext';
import { Button } from '@/components/ui/button';
import { Download, Upload, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { GraphModel } from '@/models/graph';

export const JsonImportExport: React.FC = () => {
  const { graph, setGraph, clearGraph, isRunning, setSteps, setCurrentStepIndex, setIsRunning } = useGraph();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const json = JSON.stringify(graph, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'graph.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Graph exported successfully');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string) as GraphModel;
        
        // Basic validation
        if (!Array.isArray(json.nodes) || !Array.isArray(json.edges)) {
          throw new Error('Invalid graph format');
        }

        setGraph(json);
        setSteps([]);
        setCurrentStepIndex(-1);
        setIsRunning(false);
        toast.success('Graph imported successfully');
      } catch {
        toast.error('Failed to import graph: Invalid JSON format');
      }
    };
    reader.readAsText(file);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClear = () => {
    clearGraph();
    toast.success('Graph cleared');
  };

  return (
    <div className="flex items-center gap-2">
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleImport}
        className="hidden"
      />
      <Button
        variant="ghost"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        disabled={isRunning}
        className="text-muted-foreground hover:text-foreground"
      >
        <Upload className="h-4 w-4 mr-2" />
        Import
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleExport}
        className="text-muted-foreground hover:text-foreground"
      >
        <Download className="h-4 w-4 mr-2" />
        Export
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleClear}
        disabled={isRunning}
        className="text-muted-foreground hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};
