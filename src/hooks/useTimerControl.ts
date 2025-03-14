
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { controlDevice } from '@/services/smartThingsService';

export interface TimerState {
  deviceId: string;
  label: string;
  remainingSeconds: number;
  isActive: boolean;
  endTime: number | null;
}

export function useTimerControl() {
  const [timers, setTimers] = useState<Record<string, TimerState>>({});
  const [intervalId, setIntervalId] = useState<number | null>(null);

  // Load timers from localStorage on initialization
  useEffect(() => {
    try {
      const savedTimers = localStorage.getItem('tv-timers');
      if (savedTimers) {
        const parsedTimers = JSON.parse(savedTimers);
        
        // Filter out any expired timers
        const currentTime = Date.now();
        const validTimers: Record<string, TimerState> = {};
        
        Object.entries(parsedTimers).forEach(([deviceId, timer]: [string, any]) => {
          if (timer.endTime && timer.endTime > currentTime) {
            // Recalculate remaining seconds
            const remainingSeconds = Math.max(0, Math.floor((timer.endTime - currentTime) / 1000));
            
            validTimers[deviceId] = {
              ...timer,
              remainingSeconds,
              isActive: true
            };
          } else if (!timer.endTime) {
            // Timer that was paused or never started
            validTimers[deviceId] = timer;
          }
        });
        
        setTimers(validTimers);
        
        // Start the interval if we have active timers
        if (Object.values(validTimers).some(timer => timer.isActive)) {
          startTimerInterval();
        }
      }
    } catch (error) {
      console.error('Error loading saved timers:', error);
      toast.error('Failed to load saved timers');
    }
  }, []);

  // Save timers to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('tv-timers', JSON.stringify(timers));
  }, [timers]);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [intervalId]);

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
        
        // Update each timer
        Object.entries(updatedTimers).forEach(([deviceId, timer]) => {
          if (timer.isActive) {
            const newRemainingSeconds = timer.remainingSeconds - 1;
            
            if (newRemainingSeconds <= 0) {
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
          // Switch to home screen instead of turning off TV
          controlDevice(endedDeviceId, 'input:TV')
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
  }, [intervalId]);

  // Start a timer for a device
  const startTimer = useCallback((deviceId: string, label: string, durationMinutes: number) => {
    const durationSeconds = durationMinutes * 60;
    const endTime = Date.now() + durationSeconds * 1000;
    
    setTimers(prevTimers => ({
      ...prevTimers,
      [deviceId]: {
        deviceId,
        label,
        remainingSeconds: durationSeconds,
        isActive: true,
        endTime
      }
    }));
    
    startTimerInterval();
    
    toast.success(`Timer set for ${label}: ${durationMinutes} minutes`);
  }, [startTimerInterval]);

  // Pause a timer
  const pauseTimer = useCallback((deviceId: string) => {
    setTimers(prevTimers => {
      if (!prevTimers[deviceId]) return prevTimers;
      
      return {
        ...prevTimers,
        [deviceId]: {
          ...prevTimers[deviceId],
          isActive: false,
          endTime: null
        }
      };
    });
    
    toast.info(`Timer paused for ${timers[deviceId]?.label}`);
  }, [timers]);

  // Resume a timer
  const resumeTimer = useCallback((deviceId: string) => {
    setTimers(prevTimers => {
      if (!prevTimers[deviceId]) return prevTimers;
      
      const endTime = Date.now() + prevTimers[deviceId].remainingSeconds * 1000;
      
      return {
        ...prevTimers,
        [deviceId]: {
          ...prevTimers[deviceId],
          isActive: true,
          endTime
        }
      };
    });
    
    startTimerInterval();
    
    toast.info(`Timer resumed for ${timers[deviceId]?.label}`);
  }, [timers, startTimerInterval]);

  // Stop a timer
  const stopTimer = useCallback((deviceId: string) => {
    setTimers(prevTimers => {
      const updatedTimers = { ...prevTimers };
      delete updatedTimers[deviceId];
      return updatedTimers;
    });
    
    toast.info(`Timer stopped for ${timers[deviceId]?.label}`);
  }, [timers]);

  // Extend a timer
  const extendTimer = useCallback((deviceId: string, additionalMinutes: number) => {
    setTimers(prevTimers => {
      if (!prevTimers[deviceId]) return prevTimers;
      
      const timer = prevTimers[deviceId];
      const additionalSeconds = additionalMinutes * 60;
      const newRemainingSeconds = timer.remainingSeconds + additionalSeconds;
      
      let newEndTime = timer.endTime;
      if (timer.isActive && timer.endTime) {
        newEndTime = timer.endTime + additionalSeconds * 1000;
      }
      
      return {
        ...prevTimers,
        [deviceId]: {
          ...timer,
          remainingSeconds: newRemainingSeconds,
          endTime: newEndTime
        }
      };
    });
    
    // Switch back to game mode when timer is extended
    controlDevice(deviceId, 'input:HDMI1')
      .then(() => {
        controlDevice(deviceId, 'gameMode');
        toast.success(`Timer extended for ${timers[deviceId]?.label}: +${additionalMinutes} minutes and switched to game mode`);
      })
      .catch(error => {
        console.error('Failed to switch TV to game mode:', error);
        toast.error(`Failed to switch ${timers[deviceId]?.label} to game mode`);
      });
      
  }, [timers]);

  // Format remaining time as MM:SS
  const formatTime = useCallback((seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  return {
    timers,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    extendTimer,
    formatTime
  };
}
