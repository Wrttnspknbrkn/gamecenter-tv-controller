
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TvDevice } from '@/services/smartThingsService';
import { TimerState } from '@/hooks/useTimerControl';
import { Tv, Power } from 'lucide-react';
import { controlDevice } from '@/services/smartThingsService';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { TVStatusIndicator } from './tv/TVStatusIndicator';
import { TVTimerControl } from './tv/TVTimerControl';
import { TVQuickSetup } from './tv/TVQuickSetup';
import { TVControls } from './tv/TVControls';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface TVCardProps {
  tv: TvDevice;
  timer?: TimerState;
  onStartTimer: (duration: number) => void;
  onPauseTimer: () => void;
  onResumeTimer: () => void;
  onStopTimer: () => void;
  onExtendTimer: (duration: number) => void;
  formatTime: (seconds: number) => string;
}

export function TVCard({
  tv,
  timer,
  onStartTimer,
  onPauseTimer,
  onResumeTimer,
  onStopTimer,
  onExtendTimer,
  formatTime
}: TVCardProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handlePowerToggle = async () => {
    setIsLoading(true);
    try {
      await controlDevice(tv.id, tv.status.switch === 'on' ? 'off' : 'on');
    } finally {
      setIsLoading(false);
    }
  };

  const isOn = tv.status.switch === 'on';
  const hasTimer = !!timer;
  const isTimerActive = hasTimer && timer.isActive;

  return (
    <Card className={cn(
      "h-full overflow-hidden transition-all duration-500 animate-scale-in",
      "hover:shadow-lg hover:shadow-primary/10 border",
      isOn ? "border-primary/20" : "border-muted/50"
    )}>
      <CardHeader className="relative">
        <div className="absolute right-4 top-4 flex items-center gap-2">
          <TVStatusIndicator 
            isOn={isOn} 
            hasTimer={hasTimer} 
            isTimerActive={isTimerActive} 
          />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handlePowerToggle}
                  disabled={isLoading}
                  className={cn(
                    "transition-colors duration-300",
                    isOn ? "text-primary hover:text-primary/80" : "text-muted-foreground"
                  )}
                >
                  <Power className={cn(isOn ? "text-primary" : "text-muted-foreground")} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isOn ? 'Power Off' : 'Power On'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <div className="flex items-center gap-2">
          <Tv className="h-5 w-5 text-primary" />
          <CardTitle className="text-balance">{tv.label}</CardTitle>
        </div>
        <CardDescription className="flex items-center gap-1.5">
          <span className="font-medium">{tv.name}</span>
          <span className="text-xs px-1.5 py-0.5 rounded bg-secondary">
            {isOn ? 'Online' : 'Offline'}
          </span>
        </CardDescription>
      </CardHeader>

      <CardContent>
        {isOn ? (
          <TVTimerControl
            isOn={isOn}
            timer={timer}
            onStartTimer={onStartTimer}
            onPauseTimer={onPauseTimer}
            onResumeTimer={onResumeTimer}
            onStopTimer={onStopTimer}
            onExtendTimer={onExtendTimer}
            formatTime={formatTime}
          />
        ) : (
          <TVQuickSetup 
            tvId={tv.id} 
            onSetupComplete={onStartTimer} 
          />
        )}
      </CardContent>
      
      <Separator className="my-1" />

      <CardFooter className="flex justify-between py-3">
        <TVControls tvId={tv.id} isOn={isOn} />
        
        <span className="text-xs text-muted-foreground">
          ID: {tv.id.substring(0, 8)}...
        </span>
      </CardFooter>
    </Card>
  );
}
