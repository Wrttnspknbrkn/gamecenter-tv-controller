
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
   * Record a completed timer
   */
  const recordCompletedTimer = (timer: TimerState) => {
    // Calculate the original duration in seconds
    // If totalDuration exists in timer, use it, otherwise calculate from remainingSeconds
    const originalDurationSeconds = timer.totalDuration || timer.remainingSeconds;
    
    // Calculate actual used duration (original duration - remaining time)
    // If timer was stopped early, this will be the time actually used
    const usedDurationSeconds = originalDurationSeconds - (timer.isActive ? timer.remainingSeconds : 0);
    
    // Convert to minutes for storage, ensuring we don't record negative durations
    const durationMinutes = Math.max(1, Math.round(usedDurationSeconds / 60));
    
    // Get the current time for completion timestamp
    const completionTime = new Date();
    const completedAt = completionTime.toISOString();
    
    // Calculate the start time by working backwards from completion time
    // This properly sets the start time relative to the actual end time
    const startTime = new Date(completionTime.getTime() - (usedDurationSeconds * 1000));
    const startedAt = startTime.toISOString();
    
    console.log('Recording completed timer:', {
      deviceId: timer.deviceId,
      label: timer.label,
      originalDurationSeconds,
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
