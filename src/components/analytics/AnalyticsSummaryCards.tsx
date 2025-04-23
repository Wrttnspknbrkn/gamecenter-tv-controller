
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, Clock, Zap, Users } from 'lucide-react';

interface AnalyticsMetrics {
  totalSessions: number;
  totalMinutes: number;
  averageMinutes: number;
  extensionPercentage: number;
  mostUsedDevice: string;
  mostUsedCount: number;
}

interface AnalyticsSummaryCardsProps {
  metrics: AnalyticsMetrics;
  isLoading?: boolean;
}

export const AnalyticsSummaryCards = ({ metrics, isLoading = false }: AnalyticsSummaryCardsProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-24 mb-2"></div>
              <div className="h-8 bg-muted rounded w-32"></div>
            </CardHeader>
            <CardContent>
              <div className="h-4 bg-muted rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-2xl font-bold">{metrics.totalSessions}</CardTitle>
            <CardDescription>Total Sessions</CardDescription>
          </div>
          <CalendarDays className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            Number of timer sessions recorded
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-2xl font-bold">{metrics.totalMinutes}</CardTitle>
            <CardDescription>Total Minutes</CardDescription>
          </div>
          <Clock className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            Total minutes of TV usage
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-2xl font-bold">{metrics.averageMinutes}</CardTitle>
            <CardDescription>Avg. Session Length</CardDescription>
          </div>
          <Zap className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            Average minutes per session
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-2xl font-bold">
              {metrics.mostUsedDevice}
            </CardTitle>
            <CardDescription>Most Used Device</CardDescription>
          </div>
          <Users className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            {metrics.mostUsedCount} sessions recorded
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
