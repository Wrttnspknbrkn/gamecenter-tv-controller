
import { useEffect } from 'react';
import { useTimerControl } from '@/hooks/useTimerControl';
import { useTimerAnalytics } from './useTimerAnalytics';
import { TvDevice } from '@/services/smartThingsService';

// Custom event types for timer events
export const TIMER_EVENTS = {
  START: 'timer:start',
  COMPLETE: 'timer:complete',
  EXTEND: 'timer:extend',
  PAUSE: 'timer:pause',
  RESUME: 'timer:resume',
  STOP: 'timer:stop'
};

interface TimerStartEvent {
  deviceId: string;
  label: string;
  durationMinutes: number;
}

interface TimerDeviceEvent {
  deviceId: string;
}

interface TimerExtendEvent {
  deviceId: string;
  additionalMinutes: number;
}

/**
 * Hook for subscribing to timer events for analytics purposes
 */
export function useTimerEventListener(tvDevices: TvDevice[]) {
  const { recordTimerStart, recordTimerCompletion, recordTimerExtension } = useTimerAnalytics(tvDevices);
  
  useEffect(() => {
    // Subscribe to timer start events
    const handleTimerStart = (event: CustomEvent<TimerStartEvent>) => {
      const { deviceId, label, durationMinutes } = event.detail;
      recordTimerStart(deviceId, label, durationMinutes);
    };
    
    // Subscribe to timer completion events
    const handleTimerComplete = (event: CustomEvent<TimerDeviceEvent>) => {
      const { deviceId } = event.detail;
      recordTimerCompletion(deviceId, 'completed');
    };
    
    // Subscribe to timer stop events
    const handleTimerStop = (event: CustomEvent<TimerDeviceEvent>) => {
      const { deviceId } = event.detail;
      recordTimerCompletion(deviceId, 'stopped');
    };
    
    // Subscribe to timer extension events
    const handleTimerExtend = (event: CustomEvent<TimerExtendEvent>) => {
      const { deviceId, additionalMinutes } = event.detail;
      recordTimerExtension(deviceId, additionalMinutes);
    };
    
    // Add event listeners
    window.addEventListener(TIMER_EVENTS.START, handleTimerStart as EventListener);
    window.addEventListener(TIMER_EVENTS.COMPLETE, handleTimerComplete as EventListener);
    window.addEventListener(TIMER_EVENTS.STOP, handleTimerStop as EventListener);
    window.addEventListener(TIMER_EVENTS.EXTEND, handleTimerExtend as EventListener);
    
    // Clean up
    return () => {
      window.removeEventListener(TIMER_EVENTS.START, handleTimerStart as EventListener);
      window.removeEventListener(TIMER_EVENTS.COMPLETE, handleTimerComplete as EventListener);
      window.removeEventListener(TIMER_EVENTS.STOP, handleTimerStop as EventListener);
      window.removeEventListener(TIMER_EVENTS.EXTEND, handleTimerExtend as EventListener);
    };
  }, [recordTimerStart, recordTimerCompletion, recordTimerExtension]);
  
  // Dispatch utility functions (for external components to emit events)
  const dispatchTimerStart = (deviceId: string, label: string, durationMinutes: number) => {
    const event = new CustomEvent(TIMER_EVENTS.START, {
      detail: { deviceId, label, durationMinutes }
    });
    window.dispatchEvent(event);
  };
  
  const dispatchTimerComplete = (deviceId: string) => {
    const event = new CustomEvent(TIMER_EVENTS.COMPLETE, {
      detail: { deviceId }
    });
    window.dispatchEvent(event);
  };
  
  const dispatchTimerStop = (deviceId: string) => {
    const event = new CustomEvent(TIMER_EVENTS.STOP, {
      detail: { deviceId }
    });
    window.dispatchEvent(event);
  };
  
  const dispatchTimerExtend = (deviceId: string, additionalMinutes: number) => {
    const event = new CustomEvent(TIMER_EVENTS.EXTEND, {
      detail: { deviceId, additionalMinutes }
    });
    window.dispatchEvent(event);
  };
  
  return {
    dispatchTimerStart,
    dispatchTimerComplete,
    dispatchTimerStop,
    dispatchTimerExtend
  };
}
