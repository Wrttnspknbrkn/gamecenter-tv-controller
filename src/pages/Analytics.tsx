
import { useState, useMemo } from 'react';
import { useTimerControl } from '@/hooks/useTimerControl';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Import our new components
import { AnalyticsHeader } from '@/components/analytics/AnalyticsHeader';
import { AnalyticsFilters } from '@/components/analytics/AnalyticsFilters';
import { AnalyticsSummary } from '@/components/analytics/AnalyticsSummary';
import { DailyUsageTab } from '@/components/analytics/tabs/DailyUsageTab';
import { PopularTimesTab } from '@/components/analytics/tabs/PopularTimesTab';
import { DevicesTab } from '@/components/analytics/tabs/DevicesTab';
import { SessionHistoryTab } from '@/components/analytics/tabs/SessionHistoryTab';

// Import our utility functions
import {
  calculateDailyUsage,
  calculateHourlyUsage,
  calculateDeviceUsage,
  calculateTotalMinutes,
  calculateAverageSessionMinutes,
  getDevices,
  filterTimersByDateAndDevice,
  prepareCSVExport,
  downloadCSV
} from '@/components/analytics/AnalyticsUtils';

export default function Analytics() {
  const { completedTimers } = useTimerControl();
  const [dateRange, setDateRange] = useState<string>('7days');
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('all');
  
  // Get unique devices for filter
  const devices = useMemo(() => getDevices(completedTimers), [completedTimers]);
  
  // Filter timers based on date range and device
  const filteredTimers = useMemo(() => 
    filterTimersByDateAndDevice(completedTimers, dateRange, selectedDeviceId), 
    [completedTimers, dateRange, selectedDeviceId]
  );
  
  // Calculate the daily usage data
  const dailyUsage = useMemo(() => calculateDailyUsage(filteredTimers), [filteredTimers]);
  
  // Calculate the hourly usage data (popular times)
  const hourlyUsage = useMemo(() => calculateHourlyUsage(filteredTimers), [filteredTimers]);
  
  // Calculate the device usage data
  const deviceUsage = useMemo(() => calculateDeviceUsage(filteredTimers), [filteredTimers]);
  
  // Calculate total minutes across all filtered timers
  const totalMinutes = useMemo(() => calculateTotalMinutes(filteredTimers), [filteredTimers]);
  
  // Calculate average session duration
  const averageSessionMinutes = useMemo(() => 
    calculateAverageSessionMinutes(totalMinutes, filteredTimers.length),
    [totalMinutes, filteredTimers.length]
  );
  
  // Export analytics data as CSV
  const exportCSV = () => {
    const csv = prepareCSVExport(filteredTimers);
    downloadCSV(csv);
  };
  
  return (
    <div className="min-h-screen animate-fade-in">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header Section */}
        <AnalyticsHeader exportCSV={exportCSV} />
        
        {/* Filters Section */}
        <AnalyticsFilters 
          dateRange={dateRange}
          setDateRange={setDateRange}
          selectedDeviceId={selectedDeviceId}
          setSelectedDeviceId={setSelectedDeviceId}
          devices={devices}
        />
        
        {/* Summary Cards */}
        <AnalyticsSummary 
          totalSessions={filteredTimers.length}
          totalMinutes={totalMinutes}
          averageSessionMinutes={averageSessionMinutes}
        />
        
        {/* Tabs Section */}
        <Tabs defaultValue="daily" className="mb-6">
          <TabsList className="mb-4">
            <TabsTrigger value="daily">Daily Usage</TabsTrigger>
            <TabsTrigger value="popular">Popular Times</TabsTrigger>
            <TabsTrigger value="devices">TV Devices</TabsTrigger>
            <TabsTrigger value="history">Session History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="daily">
            <DailyUsageTab dailyUsage={dailyUsage} />
          </TabsContent>
          
          <TabsContent value="popular">
            <PopularTimesTab hourlyUsage={hourlyUsage} hasData={filteredTimers.length > 0} />
          </TabsContent>
          
          <TabsContent value="devices">
            <DevicesTab deviceUsage={deviceUsage} />
          </TabsContent>
          
          <TabsContent value="history">
            <SessionHistoryTab filteredTimers={filteredTimers} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
