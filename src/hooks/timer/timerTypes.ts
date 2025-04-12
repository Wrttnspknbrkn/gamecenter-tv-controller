
/**
 * Type definitions for timer functionality
 */

export interface TimerState {
  deviceId: string;
  label: string;
  remainingSeconds: number;
  isActive: boolean;
  endTime: number | null;
  totalDuration?: number; // Total duration in seconds when timer was created
}

export type TimersState = Record<string, TimerState>;

export interface CompletedTimer {
  deviceId: string;
  label: string;
  durationMinutes: number;
  startedAt: string;
  completedAt: string;
}

export interface DailyUsage {
  date: string;
  count: number;
  totalMinutes: number;
}

export interface HourlyUsage {
  hour: number;
  count: number;
}

export interface DeviceUsage {
  deviceId: string;
  label: string;
  count: number;
  totalMinutes: number;
}
