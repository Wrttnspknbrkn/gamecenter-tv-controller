import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TvDevice } from '@/services/smartThingsService';
import { TimerState } from '@/hooks/useTimerControl';
import { Input } from '@/components/ui/input';
import { Tv, Power, Clock, PlayCircle, PauseCircle, StopCircle, Plus, Settings, Volume2, Gamepad2 } from 'lucide-react';
import { controlDevice, setupTVForCustomer } from '@/services/smartThingsService';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

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
  const [timerDuration, setTimerDuration] = useState<number>(30);
  const [extendDuration, setExtendDuration] = useState<number>(15);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [quickSetupDuration, setQuickSetupDuration] = useState<number>(60);
  const [selectedInput, setSelectedInput] = useState<string>(tv.status.inputSource || "");
  const [useGameMode, setUseGameMode] = useState<boolean>(false);

  const handlePowerToggle = async () => {
    setIsLoading(true);
    try {
      await controlDevice(tv.id, tv.status.switch === 'on' ? 'off' : 'on');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickSetup = async () => {
    setIsLoading(true);
    try {
      const success = await setupTVForCustomer(tv.id, selectedInput, useGameMode);
      
      if (success && quickSetupDuration > 0) {
        onStartTimer(quickSetupDuration);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isOn = tv.status.switch === 'on';
  const hasTimer = !!timer;
  const isTimerActive = hasTimer && timer.isActive;
  const timerProgress = hasTimer ? (timer.remainingSeconds / (timer.remainingSeconds + 0.01)) * 100 : 0;
  
  const getStatusColor = () => {
    if (!isOn) return 'bg-gray-300 dark:bg-gray-700';
    if (!hasTimer) return 'bg-yellow-400';
    if (isTimerActive) return 'bg-green-500';
    return 'bg-red-500';
  };

  const inputSources = tv.status.supportedInputSources || [];

  return (
    <Card className={cn(
      "h-full overflow-hidden transition-all duration-500 animate-scale-in",
      "hover:shadow-lg hover:shadow-primary/10 border",
      isOn ? "border-primary/20" : "border-muted/50"
    )}>
      <CardHeader className="relative">
        <div className="absolute right-4 top-4 flex items-center gap-2">
          <div className={cn(
            "w-3 h-3 rounded-full animate-pulse-subtle",
            getStatusColor()
          )} />
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
        {hasTimer && (
          <div className="mb-4 space-y-2">
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

        {!isOn && (
          <div className="mt-4 p-3 bg-muted/50 rounded-md">
            <h4 className="font-medium mb-2 flex items-center gap-1.5">
              <Tv className="h-4 w-4" /> Quick Setup
            </h4>
            <div className="space-y-3 text-left">
              <div className="space-y-1.5">
                <Label htmlFor={`input-${tv.id}`}>Select Input</Label>
                <Select 
                  value={selectedInput} 
                  onValueChange={setSelectedInput}
                >
                  <SelectTrigger id={`input-${tv.id}`} className="w-full">
                    <SelectValue placeholder="Select Input" />
                  </SelectTrigger>
                  <SelectContent>
                    {inputSources.length > 0 ? (
                      inputSources.map(source => (
                        <SelectItem key={source} value={source}>
                          {source}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="HDMI1">HDMI 1</SelectItem>
                    )}
                    {!inputSources.includes("HDMI1") && <SelectItem value="HDMI1">HDMI 1</SelectItem>}
                    {!inputSources.includes("HDMI2") && <SelectItem value="HDMI2">HDMI 2</SelectItem>}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Gamepad2 className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor={`game-mode-${tv.id}`} className="text-sm">Game Mode</Label>
                </div>
                <Switch 
                  id={`game-mode-${tv.id}`}
                  checked={useGameMode}
                  onCheckedChange={setUseGameMode}
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Label htmlFor={`duration-${tv.id}`} className="text-sm whitespace-nowrap">Timer</Label>
                <Input
                  id={`duration-${tv.id}`}
                  type="number"
                  min={0}
                  max={240}
                  value={quickSetupDuration}
                  onChange={e => setQuickSetupDuration(Number(e.target.value))}
                  className="w-16 h-8 text-sm"
                />
                <span className="text-xs text-muted-foreground">minutes</span>
              </div>
              
              <Button 
                variant="default" 
                className="w-full mt-2" 
                size="sm"
                onClick={handleQuickSetup}
                disabled={isLoading}
              >
                Power On & Setup
              </Button>
            </div>
          </div>
        )}
      </CardContent>
      
      <Separator className="my-1" />

      <CardFooter className="flex justify-between py-3">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" disabled={!isOn}>
              <Settings className="h-4 w-4 mr-1" /> Controls
            </Button>
          </PopoverTrigger>
          <PopoverContent side="top" className="w-56">
            <div className="grid gap-2">
              <Button 
                variant="secondary" 
                size="sm" 
                className="w-full justify-start"
                onClick={() => controlDevice(tv.id, 'volumeUp')}
                disabled={!isOn}
              >
                <Volume2 className="h-4 w-4 mr-2" /> Volume Up
              </Button>
              <Button 
                variant="secondary" 
                size="sm" 
                className="w-full justify-start"
                onClick={() => controlDevice(tv.id, 'volumeDown')}
                disabled={!isOn}
              >
                <Volume2 className="h-4 w-4 mr-2" /> Volume Down
              </Button>
              <Button 
                variant="secondary" 
                size="sm" 
                className="w-full justify-start"
                onClick={() => controlDevice(tv.id, 'mute')}
                disabled={!isOn}
              >
                <Volume2 className="h-4 w-4 mr-2" /> Mute
              </Button>
              <Button 
                variant="secondary" 
                size="sm" 
                className="w-full justify-start"
                onClick={() => controlDevice(tv.id, 'unmute')}
                disabled={!isOn}
              >
                <Volume2 className="h-4 w-4 mr-2" /> Unmute
              </Button>
            </div>
          </PopoverContent>
        </Popover>
        
        <span className="text-xs text-muted-foreground">
          ID: {tv.id.substring(0, 8)}...
        </span>
      </CardFooter>
    </Card>
  );
}
