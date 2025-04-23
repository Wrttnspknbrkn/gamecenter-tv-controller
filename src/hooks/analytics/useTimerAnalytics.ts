import { useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAnalyticsStorage, TimerAnalyticsSession } from './useAnalyticsStorage';
import { TvDevice } from '@/services/smartThingsService';
import { TimerState } from '@/hooks/useTimerControl';

/**
 * Hook for recording and analyzing timer usage
 */
export function useTimerAnalytics(tvDevices: TvDevice[]) {
  const { 
    addSession, 
    updateSession, 
    getSessions,
    getActiveSessions
  } = useAnalyticsStorage();

  // Handle timer start event
  const recordTimerStart = useCallback((deviceId: string, label: string, durationMinutes: number) => {
    const device = tvDevices.find(tv => tv.id === deviceId);
    const deviceName = device?.label || 'Unknown Device';
    
    console.debug('Analytics: Timer started', { deviceId, deviceName, durationMinutes });
    
    const sessionId = uuidv4();
    const session: TimerAnalyticsSession = {
      id: sessionId,
      deviceId,
      deviceName,
      startTime: new Date().toISOString(),
      endTime: null,
      originalDurationMinutes: durationMinutes,
      actualDurationSeconds: 0,
      completionType: 'active',
      extensions: []
    };
    
    addSession(session);
    return sessionId;
  }, [tvDevices, addSession]);

  // Handle timer completion event
  const recordTimerCompletion = useCallback((deviceId: string, completionType: 'completed' | 'stopped') => {
    const activeSessions = getActiveSessions();
    const session = activeSessions.find(s => s.deviceId === deviceId);
    
    if (session) {
      const endTime = new Date().toISOString();
      const startTime = new Date(session.startTime);
      const endTimeDate = new Date(endTime);
      
      // Calculate actual duration in seconds
      const actualDurationSeconds = Math.round((endTimeDate.getTime() - startTime.getTime()) / 1000);
      
      console.debug('Analytics: Timer completed', { 
        deviceId, 
        completionType, 
        actualDurationSeconds,
        startTime: session.startTime,
        endTime
      });
      
      updateSession(session.id, {
        endTime,
        actualDurationSeconds,
        completionType
      });
    } else {
      console.warn('Analytics: No active session found for device', deviceId);
    }
  }, [getActiveSessions, updateSession]);

  // Handle timer extension event
  const recordTimerExtension = useCallback((deviceId: string, additionalMinutes: number) => {
    const activeSessions = getActiveSessions();
    const session = activeSessions.find(s => s.deviceId === deviceId);
    
    if (session) {
      const extensionTimestamp = new Date().toISOString();
      
      console.debug('Analytics: Timer extended', { 
        deviceId, 
        additionalMinutes,
        session
      });
      
      const updatedExtensions = [
        ...session.extensions,
        { timestamp: extensionTimestamp, minutes: additionalMinutes }
      ];
      
      updateSession(session.id, {
        extensions: updatedExtensions,
        // Original duration remains the same, but we can calculate total intended duration
        // when needed by summing original + all extensions
      });
    } else {
      console.warn('Analytics: No active session found for device to extend', deviceId);
    }
  }, [getActiveSessions, updateSession]);

  // Calculate metrics for analytics dashboard
  const calculateMetrics = useCallback((dateRange?: { start: Date; end: Date }) => {
    const sessions = getSessions(dateRange);
    const completedSessions = sessions.filter(s => s.completionType !== 'active');
    
    // Total sessions
    const totalSessions = completedSessions.length;
    
    // Total usage time (in minutes)
    const totalMinutes = Math.ceil(
      completedSessions.reduce((sum, session) => sum + (session.actualDurationSeconds / 60), 0)
    );
    
    // Average session duration (in minutes)
    const averageMinutes = totalSessions > 0 
      ? Math.round((totalMinutes / totalSessions) * 10) / 10
      : 0;
    
    // Sessions with extensions
    const sessionsWithExtensions = completedSessions.filter(s => s.extensions.length > 0);
    const extensionPercentage = totalSessions > 0
      ? Math.round((sessionsWithExtensions.length / totalSessions) * 100)
      : 0;
    
    // Most used device
    const deviceUsage: Record<string, number> = {};
    completedSessions.forEach(session => {
      deviceUsage[session.deviceId] = (deviceUsage[session.deviceId] || 0) + 1;
    });
    
    let mostUsedDeviceId = '';
    let maxUsage = 0;
    
    Object.entries(deviceUsage).forEach(([deviceId, count]) => {
      if (count > maxUsage) {
        mostUsedDeviceId = deviceId;
        maxUsage = count;
      }
    });
    
    const mostUsedDevice = tvDevices.find(tv => tv.id === mostUsedDeviceId)?.label || 'Unknown';
    
    return {
      totalSessions,
      totalMinutes,
      averageMinutes,
      extensionPercentage,
      mostUsedDevice,
      mostUsedCount: maxUsage
    };
  }, [getSessions, tvDevices]);

  return {
    recordTimerStart,
    recordTimerCompletion,
    recordTimerExtension,
    calculateMetrics
  };
}
