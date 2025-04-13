
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { TimerState, TimersState, CompletedTimer } from './timerTypes';
import { calculateRemainingSeconds } from './timerUtils';

const STORAGE_KEY = 'tv-timers';
const COMPLETED_TIMERS_KEY = 'tv-completed-timers';

/**
 * Hook to handle loading and saving timers to localStorage
 */
export function useTimerStorage() {
  const [timers, setTimers] = useState<TimersState>({});
  const [completedTimers, setCompletedTimers] = useState<CompletedTimer[]>([]);

  // Load timers from localStorage on initialization
  useEffect(() => {
    try {
      // Load active timers
      const savedTimers = localStorage.getItem(STORAGE_KEY);
      if (savedTimers) {
        const parsedTimers = JSON.parse(savedTimers);
        
        // Filter out any expired timers
        const currentTime = Date.now();
        const validTimers: TimersState = {};
        
        Object.entries(parsedTimers).forEach(([deviceId, timer]: [string, any]) => {
          if (timer.endTime && timer.endTime > currentTime) {
            // Recalculate remaining seconds
            const remainingSeconds = calculateRemainingSeconds(timer.endTime);
            
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
      }

      // Load completed timers history
      const savedCompletedTimers = localStorage.getItem(COMPLETED_TIMERS_KEY);
      if (savedCompletedTimers) {
        setCompletedTimers(JSON.parse(savedCompletedTimers));
      }
    } catch (error) {
      console.error('Error loading saved timers:', error);
      toast.error('Failed to load saved timers');
    }
  }, []);

  // Save timers to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(timers));
  }, [timers]);

  // Save completed timers to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(COMPLETED_TIMERS_KEY, JSON.stringify(completedTimers));
  }, [completedTimers]);

  /**
   * Record a completed timer with accurate start and end timestamps
   */
  const recordCompletedTimer = (timer: TimerState) => {
    // Get the current time for completion timestamp
    const completionTime = new Date();
    const completedAt = completionTime.toISOString();
    
    // Calculate the actual duration in seconds that was used
    let usedDurationSeconds = 0;
    
    if (timer.totalDuration) {
      // If we have totalDuration, use it to calculate used time
      // For active timers, subtract remaining time; for stopped timers, use the full duration
      usedDurationSeconds = timer.isActive 
        ? timer.totalDuration - timer.remainingSeconds 
        : timer.totalDuration;
    } else {
      // Fallback: Use the remaining seconds directly (less accurate)
      usedDurationSeconds = timer.remainingSeconds;
    }
    
    // Ensure we don't record negative durations
    usedDurationSeconds = Math.max(1, usedDurationSeconds);
    
    // Convert to minutes for storage and display
    const durationMinutes = Math.round(usedDurationSeconds / 60);
    
    // Calculate the start time by working backwards from completion time
    const startTime = new Date(completionTime.getTime() - (usedDurationSeconds * 1000));
    const startedAt = startTime.toISOString();
    
    console.log('Recording completed timer:', {
      deviceId: timer.deviceId,
      label: timer.label,
      totalDuration: timer.totalDuration,
      usedDurationSeconds,
      durationMinutes,
      startedAt,
      completedAt
    });
    
    const completedTimer: CompletedTimer = {
      deviceId: timer.deviceId,
      label: timer.label,
      durationMinutes: durationMinutes,
      startedAt: startedAt,
      completedAt: completedAt
    };
    
    setCompletedTimers(prev => [...prev, completedTimer]);
  };

  return { 
    timers, 
    setTimers, 
    completedTimers, 
    setCompletedTimers,
    recordCompletedTimer 
  };
}
