
import { useState, useEffect, useCallback } from 'react';
import { TimersState } from './timerTypes';
import { controlDevice } from '@/services/devices/deviceControlService';
import { toast } from 'sonner';

/**
 * Hook to manage the timer interval for countdown
 */
export function useTimerInterval(
  timers: TimersState, 
  setTimers: React.Dispatch<React.SetStateAction<TimersState>>,
  logCompletedSession?: (deviceId: string, deviceLabel: string, durationMinutes: number) => void
) {
  const [intervalId, setIntervalId] = useState<number | null>(null);

  // Start the timer update interval
  const startTimerInterval = useCallback(() => {
    if (intervalId) return;
    
    const id = window.setInterval(() => {
      setTimers(prevTimers => {
        const updatedTimers = { ...prevTimers };
        let hasActiveTimers = false;
        let timerEnded = false;
        let endedDeviceId = '';
        let endedDeviceLabel = '';
        let timerDuration = 0;
        
        // Update each timer
        Object.entries(updatedTimers).forEach(([deviceId, timer]) => {
          if (timer.isActive) {
            const newRemainingSeconds = timer.remainingSeconds - 1;
            
            if (newRemainingSeconds <= 0) {
              // Calculate the original duration in minutes (ceil to handle fractional minutes)
              timerDuration = Math.max(1, Math.ceil((timer.endTime ? 
                (timer.endTime - Date.now() + timer.remainingSeconds * 1000) / (60 * 1000) : 
                timer.remainingSeconds / 60)));
              
              // Timer has ended
              updatedTimers[deviceId] = {
                ...timer,
                remainingSeconds: 0,
                isActive: false,
                endTime: null
              };
              
              timerEnded = true;
              endedDeviceId = deviceId;
              endedDeviceLabel = timer.label;
            } else {
              // Timer is still active
              updatedTimers[deviceId] = {
                ...timer,
                remainingSeconds: newRemainingSeconds
              };
              hasActiveTimers = true;
            }
          }
        });
        
        // Handle timer end
        if (timerEnded) {
          // Log completed session
          if (logCompletedSession) {
            logCompletedSession(endedDeviceId, endedDeviceLabel, timerDuration);
          }
          
          // Switch to home screen when timer ends
          controlDevice(endedDeviceId, 'home')
            .then(() => {
              toast.success(`Timer ended: ${endedDeviceLabel} switched to home screen`);
            })
            .catch(error => {
              console.error('Failed to switch TV to home screen:', error);
              toast.error(`Failed to switch ${endedDeviceLabel} to home screen`);
            });
        }
        
        // Clear interval if no active timers
        if (!hasActiveTimers && intervalId) {
          window.clearInterval(intervalId);
          setIntervalId(null);
        }
        
        return updatedTimers;
      });
    }, 1000);
    
    setIntervalId(id);
  }, [intervalId, setTimers, logCompletedSession]);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [intervalId]);

  // Check if we need to start interval when timers change
  useEffect(() => {
    const hasActiveTimers = Object.values(timers).some(timer => timer.isActive);
    if (hasActiveTimers && !intervalId) {
      startTimerInterval();
    }
  }, [timers, intervalId, startTimerInterval]);

  return { startTimerInterval };
}
