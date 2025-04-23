
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HomeIcon, BarChart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useAnalyticsRecorder } from '@/hooks/useAnalyticsRecorder';
import { useTimerCompletionAdapter } from '@/hooks/useTimerCompletionAdapter';
import { useTimerEventSimulator } from '@/hooks/useTimerEventSimulator';
import { AnalyticsSummaryCards } from '@/components/analytics/AnalyticsSummaryCards';
import { SessionHistoryTable } from '@/components/analytics/SessionHistoryTable';
import { DailyUsageChart, HourlyUsageChart } from '@/components/analytics/UsageChart';
import { DateRangePicker } from '@/components/analytics/DateRangePicker';
import { Skeleton } from '@/components/ui/skeleton';

export default function Analytics() {
  // Initialize date range to last 7 days
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 6); // Last 7 days including today
    return { start, end };
  });
  
  // Use the analytics recorder hook to listen for timer completions
  useAnalyticsRecorder();
  
  // Use the timer completion adapter to detect timer completions
  useTimerCompletionAdapter();
  
  // For development testing only - will be removed in production
  useTimerEventSimulator();
  
  const { sessions, dailyUsage, hourlyUsage, summary, isLoading } = useAnalytics(dateRange);

  return (
    <div className="min-h-screen animate-fade-in">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <header className="mb-6 sm:mb-8">
          <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1">
                <span className="flex items-center gap-2">
                  <BarChart className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                  TV Usage Analytics
                </span>
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Insights and statistics for your TV usage patterns
              </p>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4">
              <Button asChild variant="outline" size="sm">
                <Link to="/" className="flex items-center gap-2">
                  <HomeIcon className="h-4 w-4" />
                  <span>Back to Timers</span>
                </Link>
              </Button>
            </div>
          </div>
        </header>

        <div className="mb-6">
          <DateRangePicker dateRange={dateRange} onDateRangeChange={setDateRange} />
        </div>

        {isLoading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <Skeleton className="h-4 w-24" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-16 mb-1" />
                    <Skeleton className="h-3 w-32" />
                  </CardContent>
                </Card>
              ))}
            </div>
            <Skeleton className="h-80 w-full" />
            <Skeleton className="h-60 w-full" />
          </div>
        ) : (
          <div className="space-y-6">
            <AnalyticsSummaryCards summary={summary} />

            <Tabs defaultValue="daily" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="daily">Daily Usage</TabsTrigger>
                <TabsTrigger value="hourly">Usage by Hour</TabsTrigger>
                <TabsTrigger value="sessions">Session History</TabsTrigger>
              </TabsList>
              
              <TabsContent value="daily">
                <Card>
                  <CardHeader>
                    <CardTitle>Daily TV Usage</CardTitle>
                    <CardDescription>
                      Minutes used per TV device by date
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <DailyUsageChart dailyUsage={dailyUsage} />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="hourly">
                <Card>
                  <CardHeader>
                    <CardTitle>Usage by Hour of Day</CardTitle>
                    <CardDescription>
                      When TVs are most commonly used
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <HourlyUsageChart hourlyUsage={hourlyUsage} />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="sessions">
                <Card>
                  <CardHeader>
                    <CardTitle>Session History</CardTitle>
                    <CardDescription>
                      Detailed log of all timer sessions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <SessionHistoryTable sessions={sessions} />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
}
