
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DateRange } from 'react-day-picker';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Home, Trash2 } from 'lucide-react';
import { SessionHistoryTable } from '@/components/analytics/SessionHistoryTable';
import { DateRangePicker } from '@/components/analytics/DateRangePicker';
import { AnalyticsSummaryCards } from '@/components/analytics/AnalyticsSummaryCards';
import { TimerCompletionDebugger } from '@/components/analytics/TimerCompletionDebugger';
import { useAnalyticsStorage } from '@/hooks/analytics/useAnalyticsStorage';
import { useTimerAnalytics } from '@/hooks/analytics/useTimerAnalytics';
import { getDevices } from '@/services/smartThingsService';
import { toast } from 'sonner';

export default function Analytics() {
  const [tvDevices, setTvDevices] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    to: new Date(),
  });
  const [isLoading, setIsLoading] = useState(true);
  
  const { getSessions, clearAnalyticsData } = useAnalyticsStorage();
  const { calculateMetrics } = useTimerAnalytics(tvDevices);
  
  // Load devices data
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const devices = await getDevices();
        setTvDevices(devices);
      } catch (error) {
        console.error('Error fetching devices for analytics:', error);
        toast.error('Failed to load TV devices for analytics');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDevices();
  }, []);
  
  // Get filtered sessions based on date range
  const filteredSessions = getSessions(dateRange);
  
  // Calculate metrics based on filtered sessions
  const metrics = calculateMetrics(dateRange);
  
  // Handle date range changes
  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
  };
  
  // Handle clearing analytics data
  const handleClearData = () => {
    clearAnalyticsData();
  };
  
  return (
    <div className="min-h-screen animate-fade-in">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <header className="mb-6 sm:mb-8">
          <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1">
                <span className="flex items-center gap-2">
                  <BarChart className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                  TV Timer Analytics
                </span>
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Analyze TV timer usage patterns and history
              </p>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4">
              <Button variant="outline" size="sm" asChild>
                <Link to="/" className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  <span>Back to Dashboard</span>
                </Link>
              </Button>
              
              <Button 
                variant="destructive" 
                size="sm"
                onClick={handleClearData}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                <span>Clear Data</span>
              </Button>
            </div>
          </div>
        </header>
        
        <div className="mb-6">
          <DateRangePicker 
            dateRange={dateRange}
            onDateRangeChange={handleDateRangeChange}
            className="max-w-xs"
          />
        </div>
        
        <div className="mb-8">
          <AnalyticsSummaryCards 
            metrics={metrics}
            isLoading={isLoading}
          />
        </div>
        
        <Tabs 
          defaultValue="overview" 
          value={activeTab}
          onValueChange={setActiveTab}
          className="mb-6"
        >
          <div className="overflow-x-auto pb-2">
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Session History</TabsTrigger>
              <TabsTrigger value="debug">Debug Tools</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="overview" className="mt-0">
            <SessionHistoryTable 
              sessions={filteredSessions}
              isLoading={isLoading}
            />
          </TabsContent>
          
          <TabsContent value="debug" className="mt-0">
            <TimerCompletionDebugger />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
