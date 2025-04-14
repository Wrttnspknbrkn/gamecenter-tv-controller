
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { TimerState, TimersState, AnalyticsState, TimerSession } from './timerTypes';
import { calculateRemainingSeconds } from './timerUtils';

const STORAGE_KEY = 'tv-timers';
const ANALYTICS_KEY = 'tv-analytics';

/**
 * Hook to handle loading and saving timers to localStorage
 */
export function useTimerStorage() {
  const [timers, setTimers] = useState<TimersState>({});
  const [analytics, setAnalytics] = useState<AnalyticsState>({ sessions: [] });

  // Load timers and analytics from localStorage on initialization
  useEffect(() => {
    try {
      // Load timers
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

      // Load analytics
      const savedAnalytics = localStorage.getItem(ANALYTICS_KEY);
      if (savedAnalytics) {
        const parsedAnalytics = JSON.parse(savedAnalytics);
        setAnalytics(parsedAnalytics);
      }
    } catch (error) {
      console.error('Error loading saved data:', error);
      toast.error('Failed to load saved data');
    }
  }, []);

  // Save timers to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(timers));
  }, [timers]);

  // Save analytics to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(analytics));
  }, [analytics]);

  // Function to log completed timer sessions
  const logCompletedSession = (deviceId: string, deviceLabel: string, durationMinutes: number) => {
    const session: TimerSession = {
      id: `${deviceId}-${Date.now()}`,
      deviceId,
      deviceLabel,
      startTime: Date.now() - (durationMinutes * 60 * 1000),
      endTime: Date.now(),
      durationMinutes
    };

    setAnalytics(prev => ({
      sessions: [...prev.sessions, session]
    }));
  };

  return { timers, setTimers, analytics, logCompletedSession };
}
