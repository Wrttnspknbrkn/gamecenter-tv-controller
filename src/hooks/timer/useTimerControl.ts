
import { useCallback } from 'react';
import { useTimerStorage } from './useTimerStorage';
import { useTimerInterval } from './useTimerInterval';
import { startTimer, pauseTimer, resumeTimer, stopTimer, extendTimer } from './timerActions';
import { formatTime } from './timerUtils';
import { TimerState } from './timerTypes';

/**
 * Main hook for timer control functionality
 */
export function useTimerControl() {
  const { timers, setTimers } = useTimerStorage();
  const { startTimerInterval } = useTimerInterval(timers, setTimers);

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
