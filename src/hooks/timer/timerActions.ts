
import { calculateEndTime } from './timerUtils';
import type { TimersState } from './timerTypes';

/**
 * Start a new timer for a device
 */
export const startTimer = (
  deviceId: string, 
  label: string, 
  durationMinutes: number, 
  setTimers: React.Dispatch<React.SetStateAction<TimersState>>
) => {
  const durationSeconds = durationMinutes * 60;
  
  setTimers((prevTimers) => ({
    ...prevTimers,
    [deviceId]: {
      deviceId,
      label,
      remainingSeconds: durationSeconds,
      isActive: true,
      endTime: calculateEndTime(durationSeconds),
      originalDurationMinutes: durationMinutes // Store the original duration explicitly
    }
  }));
};

/**
 * Pause an active timer
 */
export const pauseTimer = (
  deviceId: string, 
  timers: TimersState, 
  setTimers: React.Dispatch<React.SetStateAction<TimersState>>
) => {
  if (!timers[deviceId] || !timers[deviceId].isActive) return;
  
  setTimers((prevTimers) => ({
    ...prevTimers,
    [deviceId]: {
      ...prevTimers[deviceId],
      isActive: false,
      endTime: null
    }
  }));
};

/**
 * Resume a paused timer
 */
export const resumeTimer = (
  deviceId: string, 
  timers: TimersState, 
  setTimers: React.Dispatch<React.SetStateAction<TimersState>>
) => {
  if (!timers[deviceId] || timers[deviceId].isActive) return;
  
  const durationSeconds = timers[deviceId].remainingSeconds;
  
  setTimers((prevTimers) => ({
    ...prevTimers,
    [deviceId]: {
      ...prevTimers[deviceId],
      isActive: true,
      endTime: calculateEndTime(durationSeconds)
    }
  }));
};

/**
 * Stop a timer completely and log completed session if logCompletedSession is provided
 */
export const stopTimer = (
  deviceId: string, 
  timers: TimersState, 
  setTimers: React.Dispatch<React.SetStateAction<TimersState>>,
  logCompletedSession?: (deviceId: string, deviceLabel: string, durationMinutes: number) => void
) => {
  if (!timers[deviceId]) return;
  
  const timer = timers[deviceId];
  const totalDurationMinutes = timer.originalDurationMinutes || 0;
  const remainingMinutes = Math.ceil(timer.remainingSeconds / 60);
  const completedMinutes = totalDurationMinutes - remainingMinutes;
  
  // Only log if the timer was actually used (more than 0 minutes) and was active
  // This prevents duplicate logging for timers that already ended naturally
  if (logCompletedSession && completedMinutes > 0 && timer.isActive) {
    logCompletedSession(deviceId, timer.label, completedMinutes);
    console.log(`Timer stopped manually: ${timer.label}, completed: ${completedMinutes} of ${totalDurationMinutes} minutes`);
  }
  
  setTimers((prevTimers) => {
    const updatedTimers = { ...prevTimers };
    delete updatedTimers[deviceId];
    return updatedTimers;
  });
};

/**
 * Extend an existing timer by adding minutes
 */
export const extendTimer = (
  deviceId: string, 
  additionalMinutes: number, 
  timers: TimersState, 
  setTimers: React.Dispatch<React.SetStateAction<TimersState>>
) => {
  if (!timers[deviceId]) return;
  
  const additionalSeconds = additionalMinutes * 60;
  const currentRemaining = timers[deviceId].remainingSeconds;
  const newRemainingSeconds = currentRemaining + additionalSeconds;
  const wasActive = timers[deviceId].isActive;
  
  // Log extension for debugging
  console.log(`Extending timer for ${timers[deviceId].label} by ${additionalMinutes} minutes. Was active: ${wasActive}`);
  
  setTimers((prevTimers) => {
    const timer = prevTimers[deviceId];
    // Update the original duration when extending the timer
    const originalDurationMinutes = timer.originalDurationMinutes || 
      Math.ceil(timer.remainingSeconds / 60);
    
    return {
      ...prevTimers,
      [deviceId]: {
        ...prevTimers[deviceId],
        remainingSeconds: newRemainingSeconds,
        isActive: true, // Always activate timer when extending
        endTime: calculateEndTime(newRemainingSeconds),
        originalDurationMinutes: originalDurationMinutes + additionalMinutes
      }
    };
  });
};
