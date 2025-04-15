
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
  const [originalDurations, setOriginalDurations] = useState<Record<string, number>>({});
  const [loggedTimers, setLoggedTimers] = useState<Record<string, boolean>>({});
  const [pendingExtensions, setPendingExtensions] = useState<Record<string, boolean>>({});

  // Track original durations when timers are added or modified
  useEffect(() => {
    const updatedDurations = { ...originalDurations };
    
    Object.entries(timers).forEach(([deviceId, timer]) => {
      // Check for timer that was previously ended and now extended (active again)
      const wasEnded = loggedTimers[deviceId] && timer.isActive;
      
      // Reset logged status if timer becomes active again after having ended
      if (wasEnded) {
        console.log(`Detected re-activated timer for ${timer.label} - likely an extension after completion`);
        setLoggedTimers(prev => {
          const updated = { ...prev };
          delete updated[deviceId];
          return updated;
        });
        // Mark this as a pending extension to track properly
        setPendingExtensions(prev => ({
          ...prev,
          [deviceId]: true
        }));
      }

      // Update original durations tracking
      if (timer.originalDurationMinutes && !updatedDurations[deviceId]) {
        updatedDurations[deviceId] = timer.originalDurationMinutes;
      } else if (!updatedDurations[deviceId] && timer.remainingSeconds > 0 && !timer.originalDurationMinutes) {
        updatedDurations[deviceId] = Math.ceil(timer.remainingSeconds / 60);
      }
    });
    
    setOriginalDurations(updatedDurations);
  }, [timers, loggedTimers]);

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
              // First use explicitly stored original duration if available
              timerDuration = timer.originalDurationMinutes || originalDurations[deviceId] || Math.ceil(timer.remainingSeconds / 60);
              
              console.log(`Timer ended for ${timer.label}, duration: ${timerDuration} minutes, original duration: ${timer.originalDurationMinutes}`);
              
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
        if (timerEnded && !loggedTimers[endedDeviceId]) {
          // Log completed session only if not already logged
          if (logCompletedSession) {
            logCompletedSession(endedDeviceId, endedDeviceLabel, timerDuration);
            
            // Mark this timer as logged
            setLoggedTimers(prev => ({
              ...prev,
              [endedDeviceId]: true
            }));
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
  }, [intervalId, setTimers, logCompletedSession, originalDurations, loggedTimers]);

  // Track extensions properly
  useEffect(() => {
    Object.entries(pendingExtensions).forEach(([deviceId, isPending]) => {
      if (isPending && timers[deviceId]?.isActive) {
        console.log(`Processing pending extension for ${timers[deviceId].label}`);
        
        // Clean up pending extension
        setPendingExtensions(prev => {
          const updated = { ...prev };
          delete updated[deviceId];
          return updated;
        });
        
        // Clean up original duration for this device to ensure accurate tracking
        setOriginalDurations(prev => {
          const updated = { ...prev };
          delete updated[deviceId];
          return updated;
        });
      }
    });
  }, [timers, pendingExtensions]);

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

  // Reset logged timers when timers are removed
  useEffect(() => {
    setLoggedTimers(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(deviceId => {
        if (!timers[deviceId]) {
          delete updated[deviceId];
        }
      });
      return updated;
    });
  }, [timers]);

  return { startTimerInterval };
}
