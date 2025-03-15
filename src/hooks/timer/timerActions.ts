
import { TimersState, TimerState } from './timerTypes';
import { calculateEndTime } from './timerUtils';
import { toast } from 'sonner';
import { controlDevice, getDeviceStatus } from '@/services/smartThingsService';

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
  setTimers(prevTimers => {
    const updatedTimers = { ...prevTimers };
    delete updatedTimers[deviceId];
    return updatedTimers;
  });
  
  toast.info(`Timer stopped for ${timers[deviceId]?.label}`);
};

export const extendTimer = async (
  deviceId: string,
  additionalMinutes: number,
  timers: TimersState,
  setTimers: React.Dispatch<React.SetStateAction<TimersState>>
) => {
  // First update the timer state
  setTimers(prevTimers => {
    if (!prevTimers[deviceId]) return prevTimers;
    
    const timer = prevTimers[deviceId];
    const additionalSeconds = additionalMinutes * 60;
    const newRemainingSeconds = timer.remainingSeconds + additionalSeconds;
    
    let newEndTime = timer.endTime;
    if (timer.isActive && timer.endTime) {
      newEndTime = timer.endTime + additionalSeconds * 1000;
    }
    
    return {
      ...prevTimers,
      [deviceId]: {
        ...timer,
        remainingSeconds: newRemainingSeconds,
        endTime: newEndTime
      }
    };
  });
  
  try {
    // Check current input source
    const status = await getDeviceStatus(deviceId);
    // Fix: Correctly navigate the DeviceStatus structure to get the inputSource
    const currentInput = status.components.main?.mediaInputSource?.inputSource?.value;
    
    // Only switch to game mode if not already in HDMI1
    if (currentInput !== 'HDMI1') {
      await controlDevice(deviceId, 'input:HDMI1');
      toast.success(`Timer extended for ${timers[deviceId]?.label}: +${additionalMinutes} minutes and switched to game mode`);
    } else {
      toast.success(`Timer extended for ${timers[deviceId]?.label}: +${additionalMinutes} minutes`);
    }
  } catch (error) {
    console.error('Failed to check or switch TV input:', error);
    toast.success(`Timer extended for ${timers[deviceId]?.label}: +${additionalMinutes} minutes`);
  }
};
