
import { TimersState, TimerState } from './timerTypes';
import { calculateEndTime } from './timerUtils';
import { toast } from 'sonner';
import { controlDevice } from '@/services/smartThingsService';

/**
 * Functions for manipulating timers
 */

export const startTimer = (
  deviceId: string,
  label: string,
  durationMinutes: number,
  setTimers: React.Dispatch<React.SetStateAction<TimersState>>
) => {
  const durationSeconds = durationMinutes * 60;
  const endTime = calculateEndTime(durationSeconds);
  
  setTimers(prevTimers => ({
    ...prevTimers,
    [deviceId]: {
      deviceId,
      label,
      remainingSeconds: durationSeconds,
      isActive: true,
      endTime
    }
  }));
  
  toast.success(`Timer set for ${label}: ${durationMinutes} minutes`);
};

export const pauseTimer = (
  deviceId: string,
  timers: TimersState,
  setTimers: React.Dispatch<React.SetStateAction<TimersState>>
) => {
  setTimers(prevTimers => {
    if (!prevTimers[deviceId]) return prevTimers;
    
    return {
      ...prevTimers,
      [deviceId]: {
        ...prevTimers[deviceId],
        isActive: false,
        endTime: null
      }
    };
  });
  
  toast.info(`Timer paused for ${timers[deviceId]?.label}`);
};

export const resumeTimer = (
  deviceId: string,
  timers: TimersState,
  setTimers: React.Dispatch<React.SetStateAction<TimersState>>
) => {
  setTimers(prevTimers => {
    if (!prevTimers[deviceId]) return prevTimers;
    
    const endTime = calculateEndTime(prevTimers[deviceId].remainingSeconds);
    
    return {
      ...prevTimers,
      [deviceId]: {
        ...prevTimers[deviceId],
        isActive: true,
        endTime
      }
    };
  });
  
  toast.info(`Timer resumed for ${timers[deviceId]?.label}`);
};

export const stopTimer = (
  deviceId: string,
  timers: TimersState,
  setTimers: React.Dispatch<React.SetStateAction<TimersState>>
) => {
  // When the timer is stopped, switch to home or digital TV
  controlDevice(deviceId, 'home')
    .then(() => {
      toast.info(`Switched ${timers[deviceId]?.label} to home screen`);
    })
    .catch(error => {
      console.error('Failed to switch TV to home screen:', error);
      toast.error(`Failed to switch ${timers[deviceId]?.label} to home screen`);
    });

  setTimers(prevTimers => {
    const updatedTimers = { ...prevTimers };
    delete updatedTimers[deviceId];
    return updatedTimers;
  });
  
  toast.info(`Timer stopped for ${timers[deviceId]?.label}`);
};

export const extendTimer = (
  deviceId: string,
  additionalMinutes: number,
  timers: TimersState,
  setTimers: React.Dispatch<React.SetStateAction<TimersState>>
) => {
  // First switch to game mode
  controlDevice(deviceId, 'gameMode')
    .then(() => {
      // After switching to game mode, update the timer
      setTimers(prevTimers => {
        if (!prevTimers[deviceId]) return prevTimers;
        
        const timer = prevTimers[deviceId];
        const additionalSeconds = additionalMinutes * 60;
        const newRemainingSeconds = timer.remainingSeconds + additionalSeconds;
        
        // Automatically make timer active when extended
        const isActive = true;
        let newEndTime = calculateEndTime(newRemainingSeconds);
        
        return {
          ...prevTimers,
          [deviceId]: {
            ...timer,
            remainingSeconds: newRemainingSeconds,
            endTime: newEndTime,
            isActive // Always set to active when extending
          }
        };
      });
      
      toast.success(`Timer extended for ${timers[deviceId]?.label}: +${additionalMinutes} minutes and switched to game mode`);
    })
    .catch(error => {
      console.error('Failed to switch TV to game mode:', error);
      toast.error(`Failed to switch ${timers[deviceId]?.label} to game mode`);
    });
};
