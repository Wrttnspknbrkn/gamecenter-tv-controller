
import { useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { TimersState, TimerState } from './timerTypes';
import { calculateRemainingSeconds } from './timerUtils';

/**
 * Hook to handle the timer interval for updating remaining time
 */
export function useTimerInterval(
  timers: TimersState, 
  setTimers: React.Dispatch<React.SetStateAction<TimersState>>,
  onTimerComplete?: (timer: TimerState) => void
) {
  const intervalRef = useRef<number | null>(null);

  // Function to clear the interval
  const clearTimerInterval = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Function to update timers every second
  const updateTimers = useCallback(() => {
    setTimers(prevTimers => {
      const updatedTimers: TimersState = {};
      let hasActiveTimers = false;
      
      // Go through each timer
      Object.entries(prevTimers).forEach(([deviceId, timer]) => {
        if (timer.isActive && timer.endTime) {
          // Calculate how many seconds are left
          const remainingSeconds = calculateRemainingSeconds(timer.endTime);
          
          if (remainingSeconds <= 0) {
            // Timer has expired
            toast.info(`Timer expired for ${timer.label || 'TV'}`);
            
            // Call the onTimerComplete callback if provided
            if (onTimerComplete) {
              onTimerComplete(timer);
            }
            
            // Remove from active timers
            // Note: We don't add it to updatedTimers so it gets removed
          } else {
            // Timer is still active
            updatedTimers[deviceId] = {
              ...timer,
              remainingSeconds
            };
            hasActiveTimers = true;
          }
        } else {
          // Timer is paused or not active, just copy it
          updatedTimers[deviceId] = timer;
          
          // Check if there's any active timer
          if (timer.isActive) {
            hasActiveTimers = true;
          }
        }
      });
      
      // If no active timers left, clear the interval
      if (!hasActiveTimers) {
        clearTimerInterval();
      }
      
      return updatedTimers;
    });
  }, [setTimers, clearTimerInterval, onTimerComplete]);

  // Start the timer interval
  const startTimerInterval = useCallback(() => {
    // Clear any existing interval
    clearTimerInterval();
    
    // Start a new interval
    intervalRef.current = window.setInterval(updateTimers, 1000);
  }, [clearTimerInterval, updateTimers]);

  return { 
    startTimerInterval, 
    clearTimerInterval,
    onTimerComplete 
  };
}
