
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTimerControl } from '@/hooks/useTimerControl';
import { AnalyticsSummary } from '@/components/analytics/AnalyticsSummary';
import { DailyUsageTab } from '@/components/analytics/DailyUsageTab';
import { SessionHistoryTab } from '@/components/analytics/SessionHistoryTab';
import { TVComparisonTab } from '@/components/analytics/TVComparisonTab';
import { ExportAnalytics } from '@/components/analytics/ExportAnalytics';
import { PopularTimesTab } from '@/components/analytics/PopularTimesTab';
import { Home, BarChart4 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

const Analytics = () => {
  const { analytics } = useTimerControl();
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
    to: new Date(),
  });

  // Apply date filter and notify user
  useEffect(() => {
    // Count sessions in the selected date range
    const sessionsInRange = analytics.sessions.filter(session => {
      const sessionDate = new Date(session.endTime);
      return sessionDate >= dateRange.from && sessionDate <= dateRange.to;
    });
    
    // Log to console for debugging
    console.log(`Date range: ${dateRange.from.toLocaleDateString()} to ${dateRange.to.toLocaleDateString()}`);
    console.log(`Filtered sessions: ${sessionsInRange.length} of ${analytics.sessions.length} total`);
    
    // Notify user when date range changes
    if (sessionsInRange.length === 0 && analytics.sessions.length > 0) {
      toast.info('No sessions found in selected date range');
    }
  }, [dateRange, analytics.sessions]);

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Link to="/">
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Home</span>
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">TV Analytics Dashboard</h1>
        </div>
        <ExportAnalytics analytics={analytics} dateRange={dateRange} />
      </div>

      <AnalyticsSummary analytics={analytics} dateRange={dateRange} />

      <Tabs defaultValue="daily" className="w-full">
        <TabsList className="grid w-full grid-cols-4 max-w-2xl">
          <TabsTrigger value="daily">Daily Usage</TabsTrigger>
          <TabsTrigger value="sessions">Session History</TabsTrigger>
          <TabsTrigger value="tvs">TV Comparison</TabsTrigger>
          <TabsTrigger value="popular">Popular Times</TabsTrigger>
        </TabsList>
        
        <TabsContent value="daily" className="mt-4">
          <DailyUsageTab analytics={analytics} dateRange={dateRange} setDateRange={setDateRange} />
        </TabsContent>
        
        <TabsContent value="sessions" className="mt-4">
          <SessionHistoryTab analytics={analytics} dateRange={dateRange} setDateRange={setDateRange} />
        </TabsContent>
        
        <TabsContent value="tvs" className="mt-4">
          <TVComparisonTab analytics={analytics} dateRange={dateRange} setDateRange={setDateRange} />
        </TabsContent>

        <TabsContent value="popular" className="mt-4">
          <PopularTimesTab analytics={analytics} dateRange={dateRange} setDateRange={setDateRange} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;
