
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
    // Calculate actual duration in seconds
    const totalDurationSeconds = timer.totalDuration || timer.remainingSeconds;
    
    // For accurate timing:
    // 1. If timer is active, use endTime to calculate actual duration
    // 2. If timer was stopped early, calculate from original duration and remaining time
    const usedDurationSeconds = timer.isActive && timer.endTime 
      ? Math.round((timer.endTime - (Date.now() - totalDurationSeconds * 1000)) / 1000)
      : totalDurationSeconds - (timer.isActive ? timer.remainingSeconds : 0);
    
    // Convert to minutes, ensuring we don't record negative durations
    const durationMinutes = Math.max(1, Math.round(usedDurationSeconds / 60));
    
    // Start time: calculate by subtracting the actual duration from completion time
    const currentTime = new Date();
    const startTime = new Date(currentTime.getTime() - usedDurationSeconds * 1000);
    
    const completedTimer: CompletedTimer = {
      deviceId: timer.deviceId,
      label: timer.label,
      durationMinutes: durationMinutes,
      startedAt: startTime.toISOString(),
      completedAt: currentTime.toISOString()
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
