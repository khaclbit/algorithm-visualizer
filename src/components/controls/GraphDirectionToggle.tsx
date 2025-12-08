import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeftRight } from 'lucide-react';
import { useGraph } from '@/context/GraphContext';

interface GraphDirectionToggleProps {
  size?: 'sm' | 'default' | 'lg';
}

export const GraphDirectionToggle: React.FC<GraphDirectionToggleProps> = ({
  size = 'default'
}) => {
  const { directed, toggleDirection, isRunning } = useGraph();

  const handleToggle = async () => {
    if (!isRunning) {
      await toggleDirection();
    }
  };

  return (
    <Button
      variant="outline"
      size={size}
      onClick={handleToggle}
      disabled={isRunning}
      className="flex items-center gap-2"
      aria-label={`Toggle graph direction. Currently ${directed ? 'directed' : 'undirected'}`}
    >
      {directed ? (
        <>
          <ArrowRight className="h-4 w-4" />
          <span className="hidden sm:inline">Directed</span>
        </>
      ) : (
        <>
          <ArrowLeftRight className="h-4 w-4" />
          <span className="hidden sm:inline">Undirected</span>
        </>
      )}
    </Button>
  );
};