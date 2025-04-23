
import { useEffect } from 'react';
import { TimerSession } from '@/types/analyticsTypes';

// Analytics storage key, separate from the timer storage
const SESSIONS_STORAGE_KEY = 'tv-timer-sessions';

/**
 * Custom hook to record completed timer sessions to analytics storage
 * This hook subscribes to the timer events without modifying timer logic
 */
export const useAnalyticsRecorder = () => {
  useEffect(() => {
    // Function to record a completed timer session
    const recordTimerSession = (event: CustomEvent) => {
      try {
        const { deviceId, deviceName, duration } = event.detail;
        
        if (!deviceId || !deviceName || duration === undefined) {
          console.error('Analytics recorder: Missing required timer data', event.detail);
          return;
        }

        console.log('Analytics recorder received event with duration (seconds):', duration);

        // Create timestamp data
        const now = new Date();
        const endTime = now.getTime();
        
        // Calculate start time from the duration (seconds)
        // For explicitly completed timers, we use the actual duration that elapsed
        const startTime = endTime - (duration * 1000);
        
        // Format date for storage and filtering (YYYY-MM-DD)
        const formattedDate = now.toISOString().split('T')[0];
        
        // Create session record
        const session: TimerSession = {
          deviceId,
          deviceName,
          startTime,
          endTime,
          duration, // Duration in seconds (from the timer)
          date: formattedDate
        };

        console.log('Recording analytics session:', {
          device: deviceName,
          start: new Date(startTime).toLocaleTimeString(),
          end: new Date(endTime).toLocaleTimeString(),
          durationSecs: duration,
          durationMins: Math.ceil(duration / 60)
        });

        // Get existing sessions from storage
        const storedSessions = localStorage.getItem(SESSIONS_STORAGE_KEY);
        const sessions: TimerSession[] = storedSessions 
          ? JSON.parse(storedSessions) 
          : [];
        
        // Add new session and save back to storage
        sessions.push(session);
        localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
        
        console.log('Analytics: Recorded session for', deviceName, 'with duration', duration, 'seconds');
      } catch (error) {
        console.error('Error recording analytics data:', error);
      }
    };

    // Add event listener for timer completions
    window.addEventListener('timerCompleted', recordTimerSession as EventListener);
    
    // Cleanup function to remove event listener
    return () => {
      window.removeEventListener('timerCompleted', recordTimerSession as EventListener);
    };
  }, []);

  return null; // This hook doesn't return anything, it just records data
};
