
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useTimerStorage } from './useTimerStorage';
import { useTimerInterval } from './useTimerInterval';
import { startTimer, pauseTimer, resumeTimer, stopTimer, extendTimer } from './timerActions';
import { formatTime } from './timerUtils';
import { controlDevice } from '@/services/devices/deviceControlService';
import type { TimerState, TimersState, AnalyticsState } from './timerTypes';

/**
 * Main hook for timer control functionality
 */
export function useTimerControl() {
  const { timers, setTimers, analytics, logCompletedSession } = useTimerStorage();
  const { startTimerInterval } = useTimerInterval(timers, setTimers, logCompletedSession);

  /**
   * Start a new timer for a device
   */
  const handleStartTimer = useCallback((deviceId: string, label: string, durationMinutes: number) => {
    startTimer(deviceId, label, durationMinutes, setTimers);
    startTimerInterval();
    
    // Switch to game mode when starting timer
    controlDevice(deviceId, 'game')
      .then(() => {
        toast.success(`Started ${durationMinutes} minute timer for ${label}`);
      })
      .catch(error => {
        console.error('Failed to switch TV to game mode:', error);
        toast.error(`Failed to switch ${label} to game mode`);
      });
  }, [setTimers, startTimerInterval]);

  /**
   * Pause an active timer
   */
  const handlePauseTimer = useCallback((deviceId: string) => {
    if (!timers[deviceId]) return;
    
    pauseTimer(deviceId, timers, setTimers);
    toast.info(`Paused timer for ${timers[deviceId].label}`);
  }, [timers, setTimers]);

  /**
   * Resume a paused timer
   */
  const handleResumeTimer = useCallback((deviceId: string) => {
    if (!timers[deviceId]) return;
    
    resumeTimer(deviceId, timers, setTimers);
    startTimerInterval();
    
    toast.info(`Resumed timer for ${timers[deviceId].label}`);
  }, [timers, setTimers, startTimerInterval]);

  /**
   * Stop a timer completely
   */
  const handleStopTimer = useCallback((deviceId: string) => {
    if (!timers[deviceId]) return;
    
    const deviceLabel = timers[deviceId].label;
    
    // Pass logCompletedSession to stopTimer so it can track partially completed timers
    stopTimer(deviceId, timers, setTimers, logCompletedSession);
    
    // Switch to home screen when stopping timer
    controlDevice(deviceId, 'home')
      .then(() => {
        toast.success(`Stopped timer for ${deviceLabel}`);
      })
      .catch(error => {
        console.error('Failed to switch TV to home screen:', error);
        toast.error(`Failed to switch ${deviceLabel} to home screen`);
      });
  }, [timers, setTimers, logCompletedSession]);

  /**
   * Extend an existing timer
   */
  const handleExtendTimer = useCallback((deviceId: string, additionalMinutes: number) => {
    if (!timers[deviceId]) return;
    
    extendTimer(deviceId, additionalMinutes, timers, setTimers);
    
    // If timer was paused, resume it
    if (!timers[deviceId].isActive) {
      resumeTimer(deviceId, timers, setTimers);
      startTimerInterval();
    }
    
    toast.success(`Extended timer for ${timers[deviceId].label} by ${additionalMinutes} minutes`);
  }, [timers, setTimers, startTimerInterval]);

  /**
   * Format time remaining for display
   */
  const formatTimeDisplay = useCallback((seconds: number) => {
    return formatTime(seconds);
  }, []);

  return {
    timers,
    analytics,
    startTimer: handleStartTimer,
    pauseTimer: handlePauseTimer,
    resumeTimer: handleResumeTimer,
    stopTimer: handleStopTimer,
    extendTimer: handleExtendTimer,
    formatTime: formatTimeDisplay
  };
}
