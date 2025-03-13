
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Gamepad2, Tv } from 'lucide-react';
import { setupTVForCustomer } from '@/services/devices/deviceControlService';

interface TVQuickSetupProps {
  tvId: string;
  onSetupComplete: (duration: number) => void;
}

export function TVQuickSetup({ tvId, onSetupComplete }: TVQuickSetupProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [useGameMode, setUseGameMode] = useState<boolean>(true);
  const [timerDuration, setTimerDuration] = useState<number>(60);

  const handleQuickSetup = async () => {
    setIsLoading(true);
    try {
      const success = await setupTVForCustomer(tvId, {
        useGameMode,
        timerDuration
      });
      
      if (success && timerDuration > 0) {
        onSetupComplete(timerDuration);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-4 p-3 bg-muted/50 rounded-md">
      <h4 className="font-medium mb-2 flex items-center gap-1.5">
        <Tv className="h-4 w-4" /> Quick Setup
      </h4>
      <div className="space-y-3 text-left">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Gamepad2 className="h-4 w-4 text-muted-foreground" />
            <Label htmlFor={`game-mode-${tvId}`} className="text-sm">Game Mode (PlayStation)</Label>
          </div>
          <Switch 
            id={`game-mode-${tvId}`}
            checked={useGameMode}
            onCheckedChange={setUseGameMode}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Label htmlFor={`duration-${tvId}`} className="text-sm whitespace-nowrap">Timer</Label>
          <Input
            id={`duration-${tvId}`}
            type="number"
            min={0}
            max={240}
            value={timerDuration}
            onChange={e => setTimerDuration(Number(e.target.value))}
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
  );
}
