
import { format, subDays, parseISO, differenceInDays, differenceInSeconds } from 'date-fns';
import { 
  CompletedTimer,
  DailyUsage,
  HourlyUsage,
  DeviceUsage 
} from '@/hooks/timer/timerTypes';

export const calculateDailyUsage = (filteredTimers: CompletedTimer[]): DailyUsage[] => {
  const usage: Record<string, DailyUsage> = {};
  
  filteredTimers.forEach(timer => {
    const date = format(parseISO(timer.completedAt), 'yyyy-MM-dd');
    
    if (!usage[date]) {
      usage[date] = { date, count: 0, totalMinutes: 0 };
    }
    
    usage[date].count += 1;
    // Calculate the actual duration from start to end time
    const startTime = parseISO(timer.startedAt);
    const endTime = parseISO(timer.completedAt);
    const durationMinutes = Math.round(differenceInSeconds(endTime, startTime) / 60);
    
    usage[date].totalMinutes += durationMinutes;
  });
  
  return Object.values(usage).sort((a, b) => a.date.localeCompare(b.date));
};

export const calculateHourlyUsage = (filteredTimers: CompletedTimer[]): HourlyUsage[] => {
  const hours: Record<number, HourlyUsage> = {};
  
  for (let i = 0; i < 24; i++) {
    hours[i] = { hour: i, count: 0 };
  }
  
  filteredTimers.forEach(timer => {
    const hour = parseISO(timer.startedAt).getHours();
    hours[hour].count += 1;
  });
  
  return Object.values(hours);
};

export const calculateDeviceUsage = (filteredTimers: CompletedTimer[]): DeviceUsage[] => {
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
    // Calculate the actual duration from start to end time
    const startTime = parseISO(timer.startedAt);
    const endTime = parseISO(timer.completedAt);
    const durationMinutes = Math.round(differenceInSeconds(endTime, startTime) / 60);
    
    usage[timer.deviceId].totalMinutes += durationMinutes;
  });
  
  return Object.values(usage).sort((a, b) => b.count - a.count);
};

export const calculateTotalMinutes = (filteredTimers: CompletedTimer[]): number => {
  return filteredTimers.reduce((total, timer) => {
    const startTime = parseISO(timer.startedAt);
    const endTime = parseISO(timer.completedAt);
    const durationMinutes = Math.round(differenceInSeconds(endTime, startTime) / 60);
    return total + durationMinutes;
  }, 0);
};

export const calculateAverageSessionMinutes = (totalMinutes: number, sessionCount: number): number => {
  return sessionCount > 0 ? Math.round(totalMinutes / sessionCount) : 0;
};

export const getDevices = (completedTimers: CompletedTimer[]): { deviceId: string; label: string }[] => {
  const uniqueDevices = new Map();
  completedTimers.forEach(timer => {
    if (!uniqueDevices.has(timer.deviceId)) {
      uniqueDevices.set(timer.deviceId, timer.label);
    }
  });
  return Array.from(uniqueDevices).map(([deviceId, label]) => ({ deviceId, label }));
};

export const filterTimersByDateAndDevice = (
  completedTimers: CompletedTimer[],
  dateRange: string,
  selectedDeviceId: string
): CompletedTimer[] => {
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
};

export const prepareCSVExport = (filteredTimers: CompletedTimer[]): string => {
  // Header row
  let csv = 'Device ID,Device Label,Start Time,Completion Time,Duration (minutes)\n';
  
  // Data rows
  filteredTimers.forEach(timer => {
    const startTime = format(parseISO(timer.startedAt), 'yyyy-MM-dd HH:mm:ss');
    const endTime = format(parseISO(timer.completedAt), 'yyyy-MM-dd HH:mm:ss');
    const startDate = parseISO(timer.startedAt);
    const endDate = parseISO(timer.completedAt);
    const calculatedDuration = Math.round(differenceInSeconds(endDate, startDate) / 60);
    
    csv += `${timer.deviceId},${timer.label},${startTime},${endTime},${calculatedDuration}\n`;
  });
  
  return csv;
};

export const downloadCSV = (csv: string) => {
  // Create and download the file
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('href', url);
  a.setAttribute('download', `tv-timer-analytics-${format(new Date(), 'yyyy-MM-dd')}.csv`);
  a.click();
};
