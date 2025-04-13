
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
    // IMPORTANT: Get the original total duration in seconds
    const totalDurationSeconds = timer.totalDuration || timer.remainingSeconds;
    
    // Fix calculation: Ensure we're capturing the full duration that was set
    // For a timer set to 2 minutes (120 seconds), we should record 2 minutes
    let durationMinutes: number;
    
    // Log the timer state for debugging
    console.log('Timer being completed:', {
      deviceId: timer.deviceId,
      label: timer.label,
      totalDuration: totalDurationSeconds,
      remainingSeconds: timer.remainingSeconds,
      isActive: timer.isActive
    });
    
    // For timers that completed normally, use the original total duration
    if (timer.totalDuration) {
      // Use the originally set duration in minutes (e.g., 2-minute timer = 2 minutes)
      durationMinutes = Math.ceil(timer.totalDuration / 60);
      console.log(`Using original duration: ${durationMinutes} minutes`);
    } else {
      // Fallback to calculating from what we know
      // Always round up to ensure 1:59 becomes 2 minutes not 1
      const usedDurationSeconds = totalDurationSeconds - (timer.remainingSeconds || 0);
      durationMinutes = Math.max(1, Math.ceil(usedDurationSeconds / 60));
      console.log(`Calculated duration: ${durationMinutes} minutes`);
    }
    
    // Ensure we never record zero minutes
    durationMinutes = Math.max(1, durationMinutes);
    
    // Calculate start time by working backwards from completion time
    const currentTime = new Date();
    // Use the actual duration that was set in seconds for accurate start time calculation
    const startTime = new Date(currentTime.getTime() - (totalDurationSeconds * 1000));
    
    const completedTimer: CompletedTimer = {
      deviceId: timer.deviceId,
      label: timer.label,
      durationMinutes: durationMinutes,
      startedAt: startTime.toISOString(),
      completedAt: currentTime.toISOString()
    };
    
    console.log('Recording completed timer:', {
      timer: completedTimer,
      origMinutes: durationMinutes
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
