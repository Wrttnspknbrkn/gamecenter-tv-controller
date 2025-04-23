
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { TIMER_EVENTS } from '@/hooks/analytics/useTimerEventListener';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bug } from 'lucide-react';

export const TimerCompletionDebugger = () => {
  const [deviceId, setDeviceId] = useState('debug-device-001');
  const [deviceName, setDeviceName] = useState('Debug TV');
  const [minutes, setMinutes] = useState(20);
  const [debugMessages, setDebugMessages] = useState<string[]>([]);

  const simulateTimerStart = () => {
    const event = new CustomEvent(TIMER_EVENTS.START, {
      detail: { 
        deviceId, 
        label: deviceName, 
        durationMinutes: minutes 
      }
    });
    window.dispatchEvent(event);
    
    addDebugMessage(`Started timer for ${deviceName} (${deviceId}) with duration ${minutes} min`);
  };

  const simulateTimerComplete = () => {
    const event = new CustomEvent(TIMER_EVENTS.COMPLETE, {
      detail: { deviceId }
    });
    window.dispatchEvent(event);
    
    addDebugMessage(`Completed timer for ${deviceName} (${deviceId})`);
  };

  const simulateTimerStop = () => {
    const event = new CustomEvent(TIMER_EVENTS.STOP, {
      detail: { deviceId }
    });
    window.dispatchEvent(event);
    
    addDebugMessage(`Stopped timer for ${deviceName} (${deviceId})`);
  };

  const simulateTimerExtend = () => {
    const event = new CustomEvent(TIMER_EVENTS.EXTEND, {
      detail: { 
        deviceId, 
        additionalMinutes: 15 
      }
    });
    window.dispatchEvent(event);
    
    addDebugMessage(`Extended timer for ${deviceName} (${deviceId}) by 15 min`);
  };

  const addDebugMessage = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugMessages(prev => [
      `[${timestamp}] ${message}`,
      ...prev.slice(0, 9) // Keep last 10 messages
    ]);
  };

  // Only show in development mode
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <Card className="border-dashed border-muted">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Bug className="h-4 w-4 mr-2" />
          Analytics Debugger
        </CardTitle>
        <CardDescription>
          Simulate timer events for testing analytics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Device ID</label>
              <Input 
                value={deviceId}
                onChange={(e) => setDeviceId(e.target.value)}
                className="h-8"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Device Name</label>
              <Input 
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                className="h-8"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Minutes</label>
              <Input 
                type="number"
                value={minutes}
                onChange={(e) => setMinutes(Number(e.target.value))}
                className="h-8"
              />
            </div>
            <div className="flex items-end">
              <Button 
                variant="secondary" 
                className="w-full h-8" 
                onClick={simulateTimerStart}
              >
                Start
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <Button variant="outline" className="h-8" onClick={simulateTimerComplete}>
              Complete
            </Button>
            <Button variant="outline" className="h-8" onClick={simulateTimerStop}>
              Stop
            </Button>
            <Button variant="outline" className="h-8" onClick={simulateTimerExtend}>
              Extend +15m
            </Button>
          </div>
          
          <div className="mt-4">
            <label className="text-xs text-muted-foreground mb-1 block">Debug Messages:</label>
            <div className="h-32 overflow-y-auto bg-muted/20 rounded-md p-2 text-xs font-mono">
              {debugMessages.length === 0 ? (
                <div className="text-muted-foreground italic">No debug messages yet</div>
              ) : (
                debugMessages.map((msg, i) => (
                  <div key={i} className="whitespace-nowrap">{msg}</div>
                ))
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
