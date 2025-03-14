
/**
 * Type definitions for timer functionality
 */

export interface TimerState {
  deviceId: string;
  label: string;
  remainingSeconds: number;
  isActive: boolean;
  endTime: number | null;
}

export type TimersState = Record<string, TimerState>;
