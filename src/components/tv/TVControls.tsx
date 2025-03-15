
import React from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Volume2, VolumeX, Settings, Home, Gamepad, Tv, Plus, Minus } from 'lucide-react';
import { controlDevice } from '@/services/smartThingsService';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface TVControlsProps {
  tvId: string;
  isOn: boolean;
}

export function TVControls({ tvId, isOn }: TVControlsProps) {
  return (
    <TooltipProvider>
      <Popover>
        <PopoverTrigger asChild>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" disabled={!isOn}>
                <Settings className="h-4 w-4 mr-1" /> Controls
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Open TV controls panel</p>
            </TooltipContent>
          </Tooltip>
        </PopoverTrigger>
        <PopoverContent side="top" className="w-56">
          <div className="grid gap-2">
            <h4 className="text-sm font-medium mb-1">TV Input</h4>
            <div className="flex flex-wrap gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-1"
                    onClick={() => controlDevice(tvId, 'input:home')}
                    disabled={!isOn}
                  >
                    <Home className="h-4 w-4" /> Home
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Switch to Smart TV Home screen</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-1"
                    onClick={() => controlDevice(tvId, 'input:HDMI1')}
                    disabled={!isOn}
                  >
                    <Gamepad className="h-4 w-4" /> Game Mode
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Switch to Game console (HDMI 1)</p>
                </TooltipContent>
              </Tooltip>
            </div>
            
            <Separator className="my-2" />
            
            <h4 className="text-sm font-medium mb-1">Volume Controls</h4>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => controlDevice(tvId, 'volumeUp')}
                  disabled={!isOn}
                >
                  <Plus className="h-4 w-4 mr-2" /> Volume Up
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Increase TV volume</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => controlDevice(tvId, 'volumeDown')}
                  disabled={!isOn}
                >
                  <Minus className="h-4 w-4 mr-2" /> Volume Down
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Decrease TV volume</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => controlDevice(tvId, 'mute')}
                  disabled={!isOn}
                >
                  <VolumeX className="h-4 w-4 mr-2" /> Mute
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Mute TV audio</p>
              </TooltipContent>
            </Tooltip>
            
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
                <p>Unmute TV audio</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </PopoverContent>
      </Popover>
    </TooltipProvider>
  );
}
