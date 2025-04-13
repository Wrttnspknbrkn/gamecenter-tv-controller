
import { useMemo } from 'react';
import { format, subDays, parseISO } from 'date-fns';
import { CompletedTimer, DailyUsage, HourlyUsage, DeviceUsage } from '@/hooks/timer/timerTypes';

export function useAnalyticsData(
  completedTimers: CompletedTimer[],
  dateRange: string,
  selectedDeviceId: string
) {
  // Get unique device IDs and labels
  const devices = useMemo(() => {
    const uniqueDevices = new Map();
    completedTimers.forEach(timer => {
      if (!uniqueDevices.has(timer.deviceId)) {
        uniqueDevices.set(timer.deviceId, timer.label);
      }
    });
    return Array.from(uniqueDevices).map(([deviceId, label]) => ({ deviceId, label }));
  }, [completedTimers]);
  
  // Filter timers based on date range
  const filteredTimers = useMemo(() => {
    const now = new Date();
    let startDate = now;
    
    switch (dateRange) {
      case '7days':
        startDate = subDays(now, 7);
        break;
      case '30days':
        startDate = subDays(now, 30);
        break;
      case '90days':
        startDate = subDays(now, 90);
        break;
      default:
        startDate = subDays(now, 7);
    }
    
    return completedTimers.filter(timer => {
      const timerDate = parseISO(timer.completedAt);
      return timerDate >= startDate && (selectedDeviceId === 'all' || timer.deviceId === selectedDeviceId);
    });
  }, [completedTimers, dateRange, selectedDeviceId]);
  
  // Calculate daily usage
  const dailyUsage = useMemo(() => {
    const usage: Record<string, DailyUsage> = {};
    
    filteredTimers.forEach(timer => {
      const date = format(parseISO(timer.completedAt), 'yyyy-MM-dd');
      
      if (!usage[date]) {
        usage[date] = { date, count: 0, totalMinutes: 0 };
      }
      
      usage[date].count += 1;
      usage[date].totalMinutes += timer.durationMinutes;
    });
    
    return Object.values(usage).sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredTimers]);
  
  // Calculate hourly usage (popular times)
  const hourlyUsage = useMemo(() => {
    const hours: Record<number, HourlyUsage> = {};
    
    for (let i = 0; i < 24; i++) {
      hours[i] = { hour: i, count: 0 };
    }
    
    filteredTimers.forEach(timer => {
      const hour = parseISO(timer.startedAt).getHours();
      hours[hour].count += 1;
    });
    
    return Object.values(hours);
  }, [filteredTimers]);
  
  // Calculate device usage
  const deviceUsage = useMemo(() => {
    const usage: Record<string, DeviceUsage> = {};
    
    filteredTimers.forEach(timer => {
      if (!usage[timer.deviceId]) {
        usage[timer.deviceId] = {
          deviceId: timer.deviceId,
          label: timer.label,
          count: 0,
          totalMinutes: 0
        };
      }
      
      usage[timer.deviceId].count += 1;
      usage[timer.deviceId].totalMinutes += timer.durationMinutes;
    });
    
    return Object.values(usage).sort((a, b) => b.count - a.count);
  }, [filteredTimers]);

  // Calculate total minutes across all filtered timers
  const totalMinutes = useMemo(() => {
    return filteredTimers.reduce((total, timer) => total + timer.durationMinutes, 0);
  }, [filteredTimers]);
  
  return {
    devices,
    filteredTimers,
    dailyUsage,
    hourlyUsage,
    deviceUsage,
    totalMinutes
  };
}
