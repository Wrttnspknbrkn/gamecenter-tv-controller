
export interface TimerSession {
  deviceId: string;
  deviceName: string;
  startTime: number;
  endTime: number;
  duration: number; // in seconds
  date: string; // YYYY-MM-DD format
}

export interface DailyUsage {
  deviceId: string;
  deviceName: string;
  date: string;
  totalMinutes: number;
}

export interface HourlyUsage {
  hour: number;
  count: number;
}

export interface AnalyticsSummary {
  totalSessions: number;
  totalDevices: number;
  totalMinutesUsed: number;
  averageSessionLength: number; // in minutes
}
