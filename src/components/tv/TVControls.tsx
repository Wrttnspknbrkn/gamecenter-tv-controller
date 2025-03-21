
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
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" disabled={!isOn}>
                <Settings className="h-4 w-4 mr-1" /> Controls
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>TV Controls Menu</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <PopoverContent side="top" className="w-56">
        <div className="space-y-4">
          <div className="grid gap-2">
            <h4 className="text-sm font-medium mb-1">Volume</h4>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={() => controlDevice(tvId, 'volumeUp')}
                    disabled={!isOn}
                  >
                    <Volume2 className="h-4 w-4 mr-2" /> Volume Up
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Increase volume</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={() => controlDevice(tvId, 'volumeDown')}
                    disabled={!isOn}
                  >
                    <Volume2 className="h-4 w-4 mr-2" /> Volume Down
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Decrease volume</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={() => controlDevice(tvId, 'mute')}
                    disabled={!isOn}
                  >
                    <Volume2 className="h-4 w-4 mr-2" /> Mute
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Mute audio</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={() => controlDevice(tvId, 'unmute')}
                    disabled={!isOn}
                  >
                    <Volume2 className="h-4 w-4 mr-2" /> Unmute
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Unmute audio</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="grid gap-2">
            <h4 className="text-sm font-medium mb-1">Source</h4>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={() => controlDevice(tvId, 'home')}
                    disabled={!isOn}
                  >
                    <Home className="h-4 w-4 mr-2" /> Home Screen
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Go to TV home screen</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={() => controlDevice(tvId, 'digitalTV')}
                    disabled={!isOn}
                  >
                    <Tv className="h-4 w-4 mr-2" /> Digital TV
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Switch to digital TV input</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={() => controlDevice(tvId, 'gameMode')}
                    disabled={!isOn}
                  >
                    <Gamepad2 className="h-4 w-4 mr-2" /> Game Mode
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Switch to game console input (HDMI1)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
