
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TvDevice, getDevices } from '@/services/smartThingsService';
import { TVCard } from '@/components/TVCard';
import { useTimerControl } from '@/hooks/useTimerControl';
import { toast } from 'sonner';
import { RefreshCcw, MonitorSmartphone } from 'lucide-react';

export default function Index() {
  const [tvDevices, setTvDevices] = useState<TvDevice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  
  const { 
    timers, 
    startTimer, 
    pauseTimer, 
    resumeTimer, 
    stopTimer, 
    extendTimer,
    formatTime 
  } = useTimerControl();

  const fetchDevices = useCallback(async () => {
    try {
      setRefreshing(true);
      const devices = await getDevices();
      setTvDevices(devices);
    } catch (error) {
      console.error('Error fetching devices:', error);
      toast.error('Failed to fetch TV devices');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDevices();
    
    // Refresh devices every 30 seconds
    const intervalId = setInterval(() => {
      fetchDevices();
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, [fetchDevices]);

  const getFilteredDevices = () => {
    switch (activeTab) {
      case "active":
        return tvDevices.filter(tv => {
          const hasTimer = !!timers[tv.id];
          const isTimerActive = hasTimer && timers[tv.id].isActive;
          return isTimerActive;
        });
      case "inactive":
        return tvDevices.filter(tv => {
          const hasTimer = !!timers[tv.id];
          const isTimerActive = hasTimer && timers[tv.id].isActive;
          return !isTimerActive;
        });
      case "online":
        return tvDevices.filter(tv => tv.status.switch === 'on');
      case "offline":
        return tvDevices.filter(tv => tv.status.switch === 'off');
      case "all":
      default:
        return tvDevices;
    }
  };

  const filteredDevices = getFilteredDevices();

  return (
    <div className="min-h-screen animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-1">
                <span className="flex items-center gap-2">
                  <MonitorSmartphone className="h-8 w-8 text-primary" />
                  TV Timer Management
                </span>
              </h1>
              <p className="text-muted-foreground">
                Control and manage timers for your Samsung TVs
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <Button 
                variant="outline"
                onClick={fetchDevices}
                disabled={refreshing}
                className="flex items-center gap-2"
              >
                <RefreshCcw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </header>

        <Tabs 
          defaultValue="all" 
          value={activeTab}
          onValueChange={setActiveTab}
          className="mb-6"
        >
          <TabsList className="mb-4">
            <TabsTrigger value="all">All TVs</TabsTrigger>
            <TabsTrigger value="active">Active Timers</TabsTrigger>
            <TabsTrigger value="inactive">Inactive</TabsTrigger>
            <TabsTrigger value="online">Online</TabsTrigger>
            <TabsTrigger value="offline">Offline</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-0">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border rounded-lg p-6 space-y-4">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <div className="space-y-2 py-4">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-8 w-full" />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredDevices.length === 0 ? (
              <div className="text-center py-12 border rounded-lg bg-muted/20">
                <p className="text-lg text-muted-foreground mb-4">No TVs found in this category</p>
                <Button onClick={() => setActiveTab("all")}>View All TVs</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDevices.map((tv) => (
                  <TVCard
                    key={tv.id}
                    tv={tv}
                    timer={timers[tv.id]}
                    onStartTimer={(duration) => startTimer(tv.id, tv.label, duration)}
                    onPauseTimer={() => pauseTimer(tv.id)}
                    onResumeTimer={() => resumeTimer(tv.id)}
                    onStopTimer={() => stopTimer(tv.id)}
                    onExtendTimer={(duration) => extendTimer(tv.id, duration)}
                    formatTime={formatTime}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
