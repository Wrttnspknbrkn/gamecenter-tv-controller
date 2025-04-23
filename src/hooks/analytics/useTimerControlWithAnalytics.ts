
import { useCallback } from 'react';
import { useTimerControl } from '@/hooks/useTimerControl';
import { useTimerEventListener } from './useTimerEventListener';
import { TvDevice } from '@/services/smartThingsService';

/**
 * Wrapper hook that adds analytics events to timer control functions
 * without modifying the original timer functionality
 */
export function useTimerControlWithAnalytics(tvDevices: TvDevice[]) {
  const timerControl = useTimerControl();
  const { 
    dispatchTimerStart, 
    dispatchTimerComplete, 
    dispatchTimerStop, 
    dispatchTimerExtend 
  } = useTimerEventListener(tvDevices);
  
  // Enhanced start timer function with analytics event
  const startTimer = useCallback((deviceId: string, label: string, durationMinutes: number) => {
    // Call the original function first
    timerControl.startTimer(deviceId, label, durationMinutes);
    
    // Then dispatch the analytics event
    dispatchTimerStart(deviceId, label, durationMinutes);
    
    console.debug('Analytics: startTimer called', { deviceId, label, durationMinutes });
  }, [timerControl.startTimer, dispatchTimerStart]);
  
  // Enhanced pause timer function
  const pauseTimer = useCallback((deviceId: string) => {
    timerControl.pauseTimer(deviceId);
    // No analytics event needed for pause currently
  }, [timerControl.pauseTimer]);
  
  // Enhanced resume timer function
  const resumeTimer = useCallback((deviceId: string) => {
    timerControl.resumeTimer(deviceId);
    // No analytics event needed for resume currently
  }, [timerControl.resumeTimer]);
  
  // Enhanced stop timer function with analytics event
  const stopTimer = useCallback((deviceId: string) => {
    // First dispatch the analytics event before the timer is stopped
    dispatchTimerStop(deviceId);
    
    // Then call the original function
    timerControl.stopTimer(deviceId);
    
    console.debug('Analytics: stopTimer called', { deviceId });
  }, [timerControl.stopTimer, dispatchTimerStop]);
  
  // Enhanced extend timer function with analytics event
  const extendTimer = useCallback((deviceId: string, additionalMinutes: number) => {
    // Call the original function first
    timerControl.extendTimer(deviceId, additionalMinutes);
    
    // Then dispatch the analytics event
    dispatchTimerExtend(deviceId, additionalMinutes);
    
    console.debug('Analytics: extendTimer called', { deviceId, additionalMinutes });
  }, [timerControl.extendTimer, dispatchTimerExtend]);
  
  // Return enhanced functions along with original data
  return {
    ...timerControl,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    extendTimer
  };
}
