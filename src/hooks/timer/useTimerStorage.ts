
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
   * Record a completed timer with accurate timestamp and duration calculations
   */
  const recordCompletedTimer = (timer: TimerState) => {
    // Get the original total duration in seconds
    const totalDurationSeconds = timer.totalDuration || timer.remainingSeconds;
    
    // Calculate the actual used duration in seconds
    let usedDurationSeconds: number;
    
    if (timer.isActive && timer.endTime) {
      // For active timers with an end time, calculate from end time and elapsed time
      const elapsedSeconds = Math.round((Date.now() - (timer.endTime - timer.remainingSeconds * 1000)) / 1000);
      usedDurationSeconds = elapsedSeconds;
    } else {
      // For stopped or paused timers, use the difference between total and remaining
      usedDurationSeconds = totalDurationSeconds - (timer.isActive ? timer.remainingSeconds : 0);
    }
    
    // Convert to minutes, making sure to preserve the original duration
    // Use ceiling to ensure we don't round down to zero for short sessions
    // and also to ensure a 2-minute timer doesn't become 1 minute due to rounding
    const durationMinutes = Math.ceil(usedDurationSeconds / 60);
    
    // Calculate actual start time based on when the timer was completed
    const currentTime = new Date();
    const startTime = new Date(currentTime.getTime() - (usedDurationSeconds * 1000));
    
    const completedTimer: CompletedTimer = {
      deviceId: timer.deviceId,
      label: timer.label,
      durationMinutes: durationMinutes,
      startedAt: startTime.toISOString(),
      completedAt: currentTime.toISOString()
    };
    
    console.log('Recording completed timer:', {
      original: {
        totalDuration: totalDurationSeconds,
        remainingSeconds: timer.remainingSeconds,
        isActive: timer.isActive,
        endTime: timer.endTime
      },
      calculated: {
        usedDurationSeconds,
        durationMinutes,
        startTime: startTime.toISOString(),
        completedTime: currentTime.toISOString()
      }
    });
    
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
