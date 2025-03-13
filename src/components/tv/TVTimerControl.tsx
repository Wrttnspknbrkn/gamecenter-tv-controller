
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Clock, PlayCircle, PauseCircle, StopCircle, Plus } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { TimerState } from '@/hooks/useTimerControl';

interface TVTimerControlProps {
  isOn: boolean;
  timer?: TimerState;
  onStartTimer: (duration: number) => void;
  onPauseTimer: () => void;
  onResumeTimer: () => void;
  onStopTimer: () => void;
  onExtendTimer: (duration: number) => void;
  formatTime: (seconds: number) => string;
}

export function TVTimerControl({
  isOn,
  timer,
  onStartTimer,
  onPauseTimer,
  onResumeTimer,
  onStopTimer,
  onExtendTimer,
  formatTime
}: TVTimerControlProps) {
  const [timerDuration, setTimerDuration] = useState<number>(30);
  const [extendDuration, setExtendDuration] = useState<number>(15);

  const hasTimer = !!timer;
  const isTimerActive = hasTimer && timer.isActive;
  const timerProgress = hasTimer ? (timer.remainingSeconds / (timer.remainingSeconds + 0.01)) * 100 : 0;

  return (
    <div className="space-y-4">
      {hasTimer && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <span className="font-medium">Remaining Time</span>
            </div>
            <span className="text-xl font-mono font-semibold">
              {formatTime(timer.remainingSeconds)}
            </span>
          </div>
          
          <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300 ease-out" 
              style={{ width: `${timerProgress}%` }} 
            />
          </div>
        </div>
      )}

      {!hasTimer && (
        <div className="py-2 space-y-4">
          <div className="flex items-center gap-3">
            <Input
              type="number"
              value={timerDuration}
              onChange={(e) => setTimerDuration(Number(e.target.value))}
              className="w-20"
              min={1}
              max={240}
            />
            <span className="text-sm text-muted-foreground">minutes</span>
            <Button 
              onClick={() => onStartTimer(timerDuration)}
              disabled={!isOn}
              className="ml-auto"
            >
              Start Timer
            </Button>
          </div>
        </div>
      )}

      {hasTimer && (
        <div className="flex flex-wrap gap-2">
          {isTimerActive ? (
            <Button variant="outline" onClick={onPauseTimer} className="flex gap-1">
              <PauseCircle className="h-4 w-4" /> Pause
            </Button>
          ) : (
            <Button variant="outline" onClick={onResumeTimer} className="flex gap-1">
              <PlayCircle className="h-4 w-4" /> Resume
            </Button>
          )}
          
          <Button variant="outline" onClick={onStopTimer} className="flex gap-1 text-destructive hover:text-destructive">
            <StopCircle className="h-4 w-4" /> Stop
          </Button>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex gap-1 ml-auto">
                <Plus className="h-4 w-4" /> Extend
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={extendDuration}
                    onChange={(e) => setExtendDuration(Number(e.target.value))}
                    className="w-16"
                    min={1}
                    max={120}
                  />
                  <span className="text-sm text-muted-foreground">minutes</span>
                </div>
                <div className="flex gap-2 pt-1">
                  <Button 
                    size="sm" 
                    variant="secondary" 
                    className="w-full"
                    onClick={() => onExtendTimer(extendDuration)}
                  >
                    Extend
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      )}
    </div>
  );
}
