
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTimerControl } from '@/hooks/useTimerControl';
import { AnalyticsSummary } from '@/components/analytics/AnalyticsSummary';
import { DailyUsageTab } from '@/components/analytics/DailyUsageTab';
import { SessionHistoryTab } from '@/components/analytics/SessionHistoryTab';
import { TVComparisonTab } from '@/components/analytics/TVComparisonTab';
import { ExportAnalytics } from '@/components/analytics/ExportAnalytics';

const Analytics = () => {
  const { analytics } = useTimerControl();
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
    to: new Date(),
  });

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">TV Analytics Dashboard</h1>
        <ExportAnalytics analytics={analytics} dateRange={dateRange} />
      </div>

      <AnalyticsSummary analytics={analytics} dateRange={dateRange} />

      <Tabs defaultValue="daily" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="daily">Daily Usage</TabsTrigger>
          <TabsTrigger value="sessions">Session History</TabsTrigger>
          <TabsTrigger value="tvs">TV Comparison</TabsTrigger>
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
      </Tabs>
    </div>
  );
};

export default Analytics;
