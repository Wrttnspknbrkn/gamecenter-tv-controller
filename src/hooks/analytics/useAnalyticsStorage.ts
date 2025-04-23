
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

// Analytics data type definitions
export interface TimerAnalyticsSession {
  id: string;
  deviceId: string;
  deviceName: string;
  startTime: string;
  endTime: string | null;
  originalDurationMinutes: number;
  actualDurationSeconds: number;
  completionType: 'completed' | 'stopped' | 'extended' | 'active';
  extensions: {
    timestamp: string;
    minutes: number;
  }[];
}

export interface AnalyticsState {
  sessions: TimerAnalyticsSession[];
}

const ANALYTICS_STORAGE_KEY = 'tv-timer-analytics';

/**
 * Hook for managing analytics data storage
 */
export function useAnalyticsStorage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsState>({ sessions: [] });

  // Load analytics data from localStorage on initialization
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(ANALYTICS_STORAGE_KEY);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        
        // Validate the structure of the loaded data
        if (parsedData && Array.isArray(parsedData.sessions)) {
          setAnalyticsData(parsedData);
        } else {
          // Initialize with empty sessions if structure is invalid
          setAnalyticsData({ sessions: [] });
          console.error('Invalid analytics data structure', parsedData);
        }
      }
    } catch (error) {
      console.error('Error loading analytics data:', error);
      toast.error('Failed to load analytics data');
      setAnalyticsData({ sessions: [] });
    }
  }, []);

  // Save analytics data to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(analyticsData));
    } catch (error) {
      console.error('Error saving analytics data:', error);
      toast.error('Failed to save analytics data');
    }
  }, [analyticsData]);

  // Add a new session
  const addSession = (session: TimerAnalyticsSession) => {
    setAnalyticsData(prevData => {
      // Check if session with this ID already exists
      const existingSessionIndex = prevData.sessions.findIndex(s => s.id === session.id);
      
      if (existingSessionIndex >= 0) {
        // Update existing session
        const updatedSessions = [...prevData.sessions];
        updatedSessions[existingSessionIndex] = session;
        return { ...prevData, sessions: updatedSessions };
      } else {
        // Add new session
        return { 
          ...prevData, 
          sessions: [...prevData.sessions, session] 
        };
      }
    });
  };

  // Update an existing session
  const updateSession = (sessionId: string, updates: Partial<TimerAnalyticsSession>) => {
    setAnalyticsData(prevData => {
      const existingSessionIndex = prevData.sessions.findIndex(s => s.id === sessionId);
      
      if (existingSessionIndex >= 0) {
        const updatedSessions = [...prevData.sessions];
        updatedSessions[existingSessionIndex] = {
          ...updatedSessions[existingSessionIndex],
          ...updates
        };
        return { ...prevData, sessions: updatedSessions };
      }
      
      return prevData;
    });
  };

  // Get all sessions
  const getSessions = (dateRange?: { start: Date; end: Date }) => {
    if (!dateRange) {
      return analyticsData.sessions;
    }
    
    // Filter sessions by date range
    return analyticsData.sessions.filter(session => {
      const sessionStartTime = new Date(session.startTime);
      // Set time to midnight for date-only comparison
      const startDate = new Date(dateRange.start);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59, 999);
      
      return sessionStartTime >= startDate && sessionStartTime <= endDate;
    });
  };

  // Get active sessions (those without an end time)
  const getActiveSessions = () => {
    return analyticsData.sessions.filter(session => 
      session.completionType === 'active' || session.endTime === null
    );
  };

  // Get session by ID
  const getSessionById = (sessionId: string) => {
    return analyticsData.sessions.find(session => session.id === sessionId);
  };

  // Clear all analytics data
  const clearAnalyticsData = () => {
    if (window.confirm('Are you sure you want to clear all analytics data? This cannot be undone.')) {
      setAnalyticsData({ sessions: [] });
      toast.success('Analytics data cleared');
    }
  };

  return {
    analyticsData,
    addSession,
    updateSession,
    getSessions,
    getActiveSessions,
    getSessionById,
    clearAnalyticsData,
  };
}
