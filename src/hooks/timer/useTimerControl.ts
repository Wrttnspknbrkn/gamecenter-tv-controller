
import { useCallback } from 'react';
import { useTimerStorage } from './useTimerStorage';
import { useTimerInterval } from './useTimerInterval';
import { startTimer, pauseTimer, resumeTimer, stopTimer, extendTimer } from './timerActions';
import { formatTime } from './timerUtils';
import { TimerState, CompletedTimer } from './timerTypes';

/**
 * Main hook for timer control functionality
 */
export function useTimerControl() {
  const { timers, setTimers, completedTimers, recordCompletedTimer } = useTimerStorage();
  const { startTimerInterval, onTimerComplete } = useTimerInterval(timers, setTimers, (timer) => {
    // This callback is called when a timer completes
    if (timer) {
      recordCompletedTimer(timer);
    }
  });

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
    // Record the timer as completed before stopping it
    const timer = timers[deviceId];
    if (timer) {
      recordCompletedTimer(timer);
    }
    stopTimer(deviceId, timers, setTimers);
  }, [timers, setTimers, recordCompletedTimer]);

  // Extend a timer
  const handleExtendTimer = useCallback((deviceId: string, additionalMinutes: number) => {
    extendTimer(deviceId, additionalMinutes, timers, setTimers);
  }, [timers, setTimers]);

  return {
    timers,
    completedTimers,
    startTimer: handleStartTimer,
    pauseTimer: handlePauseTimer,
    resumeTimer: handleResumeTimer,
    stopTimer: handleStopTimer,
    extendTimer: handleExtendTimer,
    formatTime
  };
}

// Re-export TimerState for backward compatibility
export type { TimerState, CompletedTimer };
