
import { useState } from 'react';
import { useTimerControl } from '@/hooks/useTimerControl';
import { format } from 'date-fns';
import { BarChart2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAnalyticsData } from '@/hooks/analytics/useAnalyticsData';
import { AnalyticsHeader } from '@/components/analytics/AnalyticsHeader';
import { AnalyticsFilters } from '@/components/analytics/AnalyticsFilters';
import { SummaryCards } from '@/components/analytics/SummaryCards';
import { DailyUsageTab } from '@/components/analytics/DailyUsageTab';
import { PopularTimesTab } from '@/components/analytics/PopularTimesTab';
import { DevicesTab } from '@/components/analytics/DevicesTab';
import { SessionHistoryTab } from '@/components/analytics/SessionHistoryTab';

export default function Analytics() {
  const { completedTimers } = useTimerControl();
  const [dateRange, setDateRange] = useState<string>('7days');
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('all');
  
  const {
    devices,
    filteredTimers,
    dailyUsage,
    hourlyUsage,
    deviceUsage,
    totalMinutes
  } = useAnalyticsData(completedTimers, dateRange, selectedDeviceId);
  
  // Export analytics data as CSV
  const exportCSV = () => {
    // Header row
    let csv = 'Device ID,Device Label,Start Time,Completion Time,Duration (minutes)\n';
    
    // Data rows
    filteredTimers.forEach(timer => {
      const startTime = format(new Date(timer.startedAt), 'yyyy-MM-dd HH:mm:ss');
      const endTime = format(new Date(timer.completedAt), 'yyyy-MM-dd HH:mm:ss');
      
      csv += `${timer.deviceId},${timer.label},${startTime},${endTime},${timer.durationMinutes}\n`;
    });
    
    // Create and download the file
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `tv-timer-analytics-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    a.click();
  };
  
  return (
    <div className="min-h-screen animate-fade-in">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <AnalyticsHeader exportCSV={exportCSV} />
        
        <AnalyticsFilters
          dateRange={dateRange}
          setDateRange={setDateRange}
          selectedDeviceId={selectedDeviceId}
          setSelectedDeviceId={setSelectedDeviceId}
          devices={devices}
        />
        
        <SummaryCards 
          totalSessions={filteredTimers.length} 
          totalMinutes={totalMinutes} 
        />
        
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
            <PopularTimesTab 
              hourlyUsage={hourlyUsage} 
              isEmpty={filteredTimers.length === 0} 
            />
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
