
import React from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Volume2, Settings, Tv, Home, Gamepad2 } from 'lucide-react';
import { controlDevice } from '@/services/smartThingsService';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface TVControlsProps {
  tvId: string;
  isOn: boolean;
}

export function TVControls({ tvId, isOn }: TVControlsProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" disabled={!isOn}>
                <Settings className="h-4 w-4 mr-1" /> Controls
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>TV Controls</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </PopoverTrigger>
      <PopoverContent side="top" className="w-56">
        <div className="space-y-4">
          <div className="grid gap-2">
            <h4 className="text-sm font-medium mb-1">Volume</h4>
            <Button 
              variant="secondary" 
              size="sm" 
              className="w-full justify-start"
              onClick={() => controlDevice(tvId, 'volumeUp')}
              disabled={!isOn}
            >
              <Volume2 className="h-4 w-4 mr-2" /> Volume Up
            </Button>
            <Button 
              variant="secondary" 
              size="sm" 
              className="w-full justify-start"
              onClick={() => controlDevice(tvId, 'volumeDown')}
              disabled={!isOn}
            >
              <Volume2 className="h-4 w-4 mr-2" /> Volume Down
            </Button>
            <Button 
              variant="secondary" 
              size="sm" 
              className="w-full justify-start"
              onClick={() => controlDevice(tvId, 'mute')}
              disabled={!isOn}
            >
              <Volume2 className="h-4 w-4 mr-2" /> Mute
            </Button>
            <Button 
              variant="secondary" 
              size="sm" 
              className="w-full justify-start"
              onClick={() => controlDevice(tvId, 'unmute')}
              disabled={!isOn}
            >
              <Volume2 className="h-4 w-4 mr-2" /> Unmute
            </Button>
          </div>

          <div className="grid gap-2">
            <h4 className="text-sm font-medium mb-1">Source</h4>
            <Button 
              variant="secondary" 
              size="sm" 
              className="w-full justify-start"
              onClick={() => controlDevice(tvId, 'home')}
              disabled={!isOn}
            >
              <Home className="h-4 w-4 mr-2" /> Home Screen
            </Button>
            <Button 
              variant="secondary" 
              size="sm" 
              className="w-full justify-start"
              onClick={() => controlDevice(tvId, 'digitalTV')}
              disabled={!isOn}
            >
              <Tv className="h-4 w-4 mr-2" /> Digital TV
            </Button>
            <Button 
              variant="secondary" 
              size="sm" 
              className="w-full justify-start"
              onClick={() => controlDevice(tvId, 'gameMode')}
              disabled={!isOn}
            >
              <Gamepad2 className="h-4 w-4 mr-2" /> Game Mode
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
