
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

// Analytics types
export interface TimerSession {
  id: string;
  deviceId: string;
  deviceLabel: string;
  startTime: number;
  endTime: number;
  durationMinutes: number;
}

export interface AnalyticsState {
  sessions: TimerSession[];
}
