
import { useState, useEffect } from 'react';
import { TimerSession, DailyUsage, HourlyUsage, AnalyticsSummary } from '@/types/analyticsTypes';

// Analytics storage key, separate from the timer storage
const SESSIONS_STORAGE_KEY = 'tv-timer-sessions';

export const useAnalytics = (dateRange: { start: Date; end: Date }) => {
  const [sessions, setSessions] = useState<TimerSession[]>([]);
  const [dailyUsage, setDailyUsage] = useState<DailyUsage[]>([]);
  const [hourlyUsage, setHourlyUsage] = useState<HourlyUsage[]>([]);
  const [summary, setSummary] = useState<AnalyticsSummary>({
    totalSessions: 0,
    totalDevices: 0,
    totalMinutesUsed: 0,
    averageSessionLength: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAnalyticsData = () => {
      setIsLoading(true);
      try {
        console.log('Loading analytics data with date range:', {
          start: dateRange.start.toISOString().split('T')[0],
          end: dateRange.end.toISOString().split('T')[0]
        });
        
        // Read sessions from localStorage
        const storedSessions = localStorage.getItem(SESSIONS_STORAGE_KEY);
        if (!storedSessions) {
          console.log('No sessions data found in localStorage');
          setIsLoading(false);
          return;
        }
        
        const parsedSessions: TimerSession[] = JSON.parse(storedSessions);
        console.log(`Found ${parsedSessions.length} total sessions in storage`);

        // Filter sessions based on date range
        const startTimestamp = new Date(dateRange.start).setHours(0, 0, 0, 0);
        const endTimestamp = new Date(dateRange.end).setHours(23, 59, 59, 999);
        
        const filteredSessions = parsedSessions.filter(session => {
          const sessionDate = new Date(session.date).getTime();
          return sessionDate >= startTimestamp && sessionDate <= endTimestamp;
        });
        
        console.log(`Filtered to ${filteredSessions.length} sessions in the selected date range`);
        setSessions(filteredSessions);
        
        // Process daily usage
        const deviceDailyUsage: Record<string, DailyUsage> = {};
        
        filteredSessions.forEach(session => {
          const key = `${session.deviceId}-${session.date}`;
          if (!deviceDailyUsage[key]) {
            deviceDailyUsage[key] = {
              deviceId: session.deviceId,
              deviceName: session.deviceName,
              date: session.date,
              totalMinutes: 0
            };
          }
          
          // Add session duration in minutes, ensuring at least 1 minute
          const durationMinutes = Math.max(1, Math.ceil(session.duration / 60));
          deviceDailyUsage[key].totalMinutes += durationMinutes;
        });
        
        setDailyUsage(Object.values(deviceDailyUsage));
        
        // Process hourly usage patterns
        const hourCounts: Record<number, number> = {};
        for (let i = 0; i < 24; i++) {
          hourCounts[i] = 0;
        }
        
        filteredSessions.forEach(session => {
          const startHour = new Date(session.startTime).getHours();
          hourCounts[startHour]++;
        });
        
        const hourlyData: HourlyUsage[] = Object.entries(hourCounts)
          .map(([hour, count]) => ({ hour: parseInt(hour), count }));
        
        setHourlyUsage(hourlyData);
        
        // Calculate summary metrics
        const uniqueDevices = new Set(filteredSessions.map(s => s.deviceId));
        
        // Calculate total minutes using ceil of seconds/60, ensuring at least 1 minute per session
        const totalMinutes = filteredSessions.reduce((acc, session) => {
          const durationMinutes = Math.max(1, Math.ceil(session.duration / 60));
          return acc + durationMinutes;
        }, 0);
        
        const avgSessionLength = filteredSessions.length > 0 
          ? totalMinutes / filteredSessions.length 
          : 0;
        
        setSummary({
          totalSessions: filteredSessions.length,
          totalDevices: uniqueDevices.size,
          totalMinutesUsed: totalMinutes,
          averageSessionLength: avgSessionLength
        });
        
        console.log('Analytics summary:', {
          totalSessions: filteredSessions.length,
          devices: uniqueDevices.size,
          totalMinutes,
          avgLength: avgSessionLength
        });
      } catch (error) {
        console.error("Error loading analytics data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalyticsData();
  }, [dateRange]);

  return {
    sessions,
    dailyUsage,
    hourlyUsage,
    summary,
    isLoading
  };
};
