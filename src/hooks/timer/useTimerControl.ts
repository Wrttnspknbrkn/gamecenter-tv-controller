
import { useCallback, useEffect } from 'react';
import { useTimerStorage } from './useTimerStorage';
import { useTimerInterval } from './useTimerInterval';
import { startTimer, pauseTimer, resumeTimer, stopTimer, extendTimer } from './timerActions';
import { formatTime } from './timerUtils';
import { TimerState } from './timerTypes';

// Session storage key for completed timer sessions
const SESSIONS_STORAGE_KEY = 'tv-timer-sessions';

/**
 * Main hook for timer control functionality
 */
export function useTimerControl() {
  const { timers, setTimers } = useTimerStorage();
  const { startTimerInterval } = useTimerInterval(timers, setTimers);

  // Record completed timer sessions
  useEffect(() => {
    const recordCompletedSessions = () => {
      const currentTimers = { ...timers };
      const currentTime = Date.now();
      
      // Check for completed timers
      Object.entries(currentTimers).forEach(([deviceId, timer]) => {
        // If timer was active but just completed (endTime in the past)
        if (timer.isActive && timer.endTime && timer.endTime < currentTime) {
          // Record the session
          const session = {
            deviceId: deviceId,
            deviceName: timer.label,
            startTime: timer.endTime - (timer.remainingSeconds * 1000),
            endTime: timer.endTime,
            duration: timer.remainingSeconds,
            date: new Date(timer.endTime).toISOString().split('T')[0] // YYYY-MM-DD
          };
          
          // Save to localStorage
          try {
            const existingSessions = localStorage.getItem(SESSIONS_STORAGE_KEY);
            const sessions = existingSessions ? JSON.parse(existingSessions) : [];
            sessions.push(session);
            localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
          } catch (error) {
            console.error('Error recording timer session:', error);
          }
        }
      });
    };

    // Record any completed sessions
    recordCompletedSessions();
  }, [timers]);

  // Start a timer for a device
  const handleStartTimer = useCallback((deviceId: string, label: string, durationMinutes: number) => {
    startTimer(deviceId, label, durationMinutes, setTimers);
    startTimerInterval();
  }, [setTimers, startTimerInterval]);

  // Pause a timer
  const handlePauseTimer = useCallback((deviceId: string) => {
    pauseTimer(deviceId, timers, setTimers);
  }, [timers, setTimers]);

  // Resume a timer
  const handleResumeTimer = useCallback((deviceId: string) => {
    resumeTimer(deviceId, timers, setTimers);
    startTimerInterval();
  }, [timers, setTimers, startTimerInterval]);

  // Stop a timer
  const handleStopTimer = useCallback((deviceId: string) => {
    // Record manual stop as a completed session
    const timer = timers[deviceId];
    if (timer) {
      const currentTime = Date.now();
      const startTime = timer.endTime 
        ? timer.endTime - (timer.remainingSeconds * 1000)
        : currentTime - (timer.remainingSeconds * 1000);
      
      const session = {
        deviceId: deviceId,
        deviceName: timer.label,
        startTime: startTime,
        endTime: currentTime,
        duration: timer.remainingSeconds,
        date: new Date(currentTime).toISOString().split('T')[0]
      };
      
      try {
        const existingSessions = localStorage.getItem(SESSIONS_STORAGE_KEY);
        const sessions = existingSessions ? JSON.parse(existingSessions) : [];
        sessions.push(session);
        localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
      } catch (error) {
        console.error('Error recording stopped timer session:', error);
      }
    }
    
    stopTimer(deviceId, timers, setTimers);
  }, [timers, setTimers]);

  // Extend a timer
  const handleExtendTimer = useCallback((deviceId: string, additionalMinutes: number) => {
    extendTimer(deviceId, additionalMinutes, timers, setTimers);
  }, [timers, setTimers]);

  return {
    timers,
    startTimer: handleStartTimer,
    pauseTimer: handlePauseTimer,
    resumeTimer: handleResumeTimer,
    stopTimer: handleStopTimer,
    extendTimer: handleExtendTimer,
    formatTime
  };
}

// Re-export TimerState for backward compatibility
export type { TimerState };
