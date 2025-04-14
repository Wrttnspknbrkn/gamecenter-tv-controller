
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart4, Clock, Tv, Users } from 'lucide-react';
import { AnalyticsState } from '@/hooks/useTimerControl';

interface AnalyticsSummaryProps {
  analytics: AnalyticsState;
  dateRange: { from: Date; to: Date };
}

export const AnalyticsSummary: React.FC<AnalyticsSummaryProps> = ({ analytics, dateRange }) => {
  // Filter sessions by date range
  const filteredSessions = analytics.sessions.filter(session => {
    const sessionDate = new Date(session.endTime);
    return sessionDate >= dateRange.from && sessionDate <= dateRange.to;
  });

  // Calculate total sessions
  const totalSessions = filteredSessions.length;
  
  // Calculate total time (in minutes)
  const totalTimeMinutes = filteredSessions.reduce((total, session) => total + session.durationMinutes, 0);
  
  // Calculate unique TVs
  const uniqueTVs = [...new Set(filteredSessions.map(session => session.deviceId))].length;
  
  // Calculate average session duration
  const avgSessionMinutes = totalSessions > 0 ? Math.round(totalTimeMinutes / totalSessions) : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
          <BarChart4 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalSessions}</div>
          <p className="text-xs text-muted-foreground">During selected period</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Time</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalTimeMinutes} minutes</div>
          <p className="text-xs text-muted-foreground">
            {Math.floor(totalTimeMinutes / 60)}h {totalTimeMinutes % 60}m
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Unique TVs</CardTitle>
          <Tv className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{uniqueTVs}</div>
          <p className="text-xs text-muted-foreground">Devices with timer activity</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg. Session</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{avgSessionMinutes} minutes</div>
          <p className="text-xs text-muted-foreground">Per timer session</p>
        </CardContent>
      </Card>
    </div>
  );
};
