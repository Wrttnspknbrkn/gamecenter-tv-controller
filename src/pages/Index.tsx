
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TvDevice, getDevices } from '@/services/smartThingsService';
import { TVCard } from '@/components/TVCard';
import { useTimerControl } from '@/hooks/useTimerControl';
import { toast } from 'sonner';
import { RefreshCcw, MonitorSmartphone, BarChart4 } from 'lucide-react';
import { TokenSettings } from '@/components/TokenSettings';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Link } from 'react-router-dom';

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
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <header className="mb-6 sm:mb-8">
          <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1">
                <span className="flex items-center gap-2">
                  <MonitorSmartphone className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                  TV Timer Management
                </span>
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Control and manage timers for your Samsung TVs
              </p>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4">
              <Link to="/analytics">
                <Button 
                  variant="outline"
                  className="flex items-center gap-2"
                  size="sm"
                >
                  <BarChart4 className="h-4 w-4" />
                  <span className="hidden sm:inline">Analytics</span>
                </Button>
              </Link>
              <TokenSettings />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline"
                      onClick={fetchDevices}
                      disabled={refreshing}
                      className="flex items-center gap-2"
                      size="sm"
                      aria-label="Refresh devices"
                    >
                      <RefreshCcw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                      <span className="hidden sm:inline">Refresh</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Refresh TV status</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </header>

        <Tabs 
          defaultValue="all" 
          value={activeTab}
          onValueChange={setActiveTab}
          className="mb-6"
        >
          <div className="overflow-x-auto pb-2">
            <TabsList className="mb-4 flex-nowrap">
              <TabsTrigger value="all">All TVs</TabsTrigger>
              <TabsTrigger value="active">Active Timers</TabsTrigger>
              <TabsTrigger value="inactive">Inactive</TabsTrigger>
              <TabsTrigger value="online">Online</TabsTrigger>
              <TabsTrigger value="offline">Offline</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value={activeTab} className="mt-0">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border rounded-lg p-4 sm:p-6 space-y-4">
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
              <div className="text-center py-8 sm:py-12 border rounded-lg bg-muted/20">
                <p className="text-base sm:text-lg text-muted-foreground mb-4">No TVs found in this category</p>
                <Button onClick={() => setActiveTab("all")}>View All TVs</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
