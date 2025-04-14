
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
 * Stop a timer completely
 */
export const stopTimer = (
  deviceId: string, 
  timers: TimersState, 
  setTimers: React.Dispatch<React.SetStateAction<TimersState>>
) => {
  if (!timers[deviceId]) return;
  
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
        endTime: prevTimers[deviceId].isActive ? calculateEndTime(newRemainingSeconds) : null,
        originalDurationMinutes: originalDurationMinutes + additionalMinutes
      }
    };
  });
};
