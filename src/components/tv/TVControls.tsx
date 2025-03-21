
import React from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Volume2, Settings } from 'lucide-react';
import { controlDevice } from '@/services/smartThingsService';

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
