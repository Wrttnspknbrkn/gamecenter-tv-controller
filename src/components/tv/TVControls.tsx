
import React from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Volume2, Settings, Home, Gamepad, Tv } from 'lucide-react';
import { controlDevice } from '@/services/smartThingsService';
import { Separator } from '@/components/ui/separator';

interface TVControlsProps {
  tvId: string;
  isOn: boolean;
}

export function TVControls({ tvId, isOn }: TVControlsProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" disabled={!isOn}>
          <Settings className="h-4 w-4 mr-1" /> Controls
        </Button>
      </PopoverTrigger>
      <PopoverContent side="top" className="w-56">
        <div className="grid gap-2">
          <h4 className="text-sm font-medium mb-1">TV Input</h4>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1"
              onClick={() => controlDevice(tvId, 'input:home')}
              disabled={!isOn}
            >
              <Home className="h-4 w-4" /> Home
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1"
              onClick={() => controlDevice(tvId, 'input:HDMI1')}
              disabled={!isOn}
            >
              <Gamepad className="h-4 w-4" /> Game Mode
            </Button>
          </div>
          
          <Separator className="my-2" />
          
          <h4 className="text-sm font-medium mb-1">Volume Controls</h4>
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
      </PopoverContent>
    </Popover>
  );
}
