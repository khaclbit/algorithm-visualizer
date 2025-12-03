import React, { useEffect, useRef, useState } from 'react';
import { useGraph } from '@/context/GraphContext';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { SkipBack, SkipForward, Play, Pause, ChevronLeft, ChevronRight } from 'lucide-react';

export const StepControls: React.FC = () => {
  const {
    steps,
    currentStepIndex,
    setCurrentStepIndex,
    isRunning,
  } = useGraph();

  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const canGoBack = currentStepIndex > 0;
  const canGoForward = currentStepIndex < steps.length - 1;

  const handlePrev = () => {
    if (canGoBack) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleNext = () => {
    if (canGoForward) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handleFirst = () => {
    setCurrentStepIndex(0);
  };

  const handleLast = () => {
    setCurrentStepIndex(steps.length - 1);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    if (isPlaying && canGoForward) {
      intervalRef.current = setInterval(() => {
        if (currentStepIndex >= steps.length - 1) {
          setIsPlaying(false);
        } else {
          setCurrentStepIndex(currentStepIndex + 1);
        }
      }, speed);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, canGoForward, speed, steps.length, currentStepIndex, setCurrentStepIndex]);

  useEffect(() => {
    if (currentStepIndex >= steps.length - 1) {
      setIsPlaying(false);
    }
  }, [currentStepIndex, steps.length]);

  if (!isRunning || steps.length === 0) {
    return (
      <div className="panel">
        <div className="panel-header">Playback</div>
        <div className="p-4 text-center text-muted-foreground text-sm">
          Run an algorithm to see step controls
        </div>
      </div>
    );
  }

  return (
    <div className="panel">
      <div className="panel-header">Playback</div>
      <div className="p-4 space-y-4">
        {/* Progress indicator */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Step</span>
          <span className="font-mono text-primary">
            {currentStepIndex + 1} / {steps.length}
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-200"
            style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Control buttons */}
        <div className="flex items-center justify-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleFirst}
            disabled={!canGoBack}
            className="h-8 w-8"
          >
            <SkipBack className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrev}
            disabled={!canGoBack}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="default"
            size="icon"
            onClick={togglePlay}
            disabled={!canGoForward && !isPlaying}
            className="h-10 w-10"
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4 ml-0.5" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNext}
            disabled={!canGoForward}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLast}
            disabled={!canGoForward}
            className="h-8 w-8"
          >
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>

        {/* Speed control */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Speed</span>
            <span>{(2000 - speed) / 1000 + 0.5}x</span>
          </div>
          <Slider
            value={[2000 - speed]}
            onValueChange={([v]) => setSpeed(2000 - v)}
            min={0}
            max={1500}
            step={100}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};
