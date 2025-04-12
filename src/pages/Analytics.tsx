
import { useState, useMemo } from 'react';
import { useTimerControl } from '@/hooks/useTimerControl';
import { format, subDays, parseISO, differenceInDays, differenceInSeconds } from 'date-fns';
import { Download, BarChart2, PieChart, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Link } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartPieChart,
  Pie,
  Cell,
} from 'recharts';
import { CompletedTimer, DailyUsage, HourlyUsage, DeviceUsage } from '@/hooks/timer/timerTypes';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function Analytics() {
  const { completedTimers } = useTimerControl();
  const [dateRange, setDateRange] = useState<string>('7days');
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('all');
  
  // Filter timers based on date range
  const filteredTimers = useMemo(() => {
    const now = new Date();
    let startDate = now;
    
    switch (dateRange) {
      case '7days':
        startDate = subDays(now, 7);
        break;
      case '30days':
        startDate = subDays(now, 30);
        break;
      case '90days':
        startDate = subDays(now, 90);
        break;
      default:
        startDate = subDays(now, 7);
    }
    
    return completedTimers.filter(timer => {
      const timerDate = parseISO(timer.completedAt);
      return timerDate >= startDate && (selectedDeviceId === 'all' || timer.deviceId === selectedDeviceId);
    });
  }, [completedTimers, dateRange, selectedDeviceId]);
  
  // Calculate total minutes across all filtered timers
  const totalMinutes = useMemo(() => {
    return filteredTimers.reduce((total, timer) => total + timer.durationMinutes, 0);
  }, [filteredTimers]);
  
  // Calculate average session duration
  const averageSessionMinutes = useMemo(() => {
    return filteredTimers.length > 0 ? Math.round(totalMinutes / filteredTimers.length) : 0;
  }, [filteredTimers, totalMinutes]);
  
  // Get unique device IDs and labels
  const devices = useMemo(() => {
    const uniqueDevices = new Map();
    completedTimers.forEach(timer => {
      if (!uniqueDevices.has(timer.deviceId)) {
        uniqueDevices.set(timer.deviceId, timer.label);
      }
    });
    return Array.from(uniqueDevices).map(([deviceId, label]) => ({ deviceId, label }));
  }, [completedTimers]);
  
  // Calculate daily usage
  const dailyUsage = useMemo(() => {
    const usage: Record<string, DailyUsage> = {};
    
    filteredTimers.forEach(timer => {
      const date = format(parseISO(timer.completedAt), 'yyyy-MM-dd');
      
      if (!usage[date]) {
        usage[date] = { date, count: 0, totalMinutes: 0 };
      }
      
      usage[date].count += 1;
      usage[date].totalMinutes += timer.durationMinutes;
    });
    
    return Object.values(usage).sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredTimers]);
  
  // Calculate hourly usage (popular times)
  const hourlyUsage = useMemo(() => {
    const hours: Record<number, HourlyUsage> = {};
    
    for (let i = 0; i < 24; i++) {
      hours[i] = { hour: i, count: 0 };
    }
    
    filteredTimers.forEach(timer => {
      const hour = parseISO(timer.startedAt).getHours();
      hours[hour].count += 1;
    });
    
    return Object.values(hours);
  }, [filteredTimers]);
  
  // Calculate device usage
  const deviceUsage = useMemo(() => {
    const usage: Record<string, DeviceUsage> = {};
    
    filteredTimers.forEach(timer => {
      if (!usage[timer.deviceId]) {
        usage[timer.deviceId] = {
          deviceId: timer.deviceId,
          label: timer.label,
          count: 0,
          totalMinutes: 0
        };
      }
      
      usage[timer.deviceId].count += 1;
      usage[timer.deviceId].totalMinutes += timer.durationMinutes;
    });
    
    return Object.values(usage).sort((a, b) => b.count - a.count);
  }, [filteredTimers]);
  
  // Format hour for display
  const formatHour = (hour: number) => {
    return `${hour % 12 === 0 ? 12 : hour % 12}${hour < 12 ? 'am' : 'pm'}`;
  };
  
  // Calculate session duration in minutes based on timestamps
  const calculateSessionDuration = (startTime: string, endTime: string) => {
    const start = parseISO(startTime);
    const end = parseISO(endTime);
    const diffSeconds = differenceInSeconds(end, start);
    return Math.round(diffSeconds / 60);
  };
  
  // Export analytics data as CSV
  const exportCSV = () => {
    // Header row
    let csv = 'Device ID,Device Label,Start Time,Completion Time,Duration (minutes)\n';
    
    // Data rows
    filteredTimers.forEach(timer => {
      const startTime = format(parseISO(timer.startedAt), 'yyyy-MM-dd HH:mm:ss');
      const endTime = format(parseISO(timer.completedAt), 'yyyy-MM-dd HH:mm:ss');
      const calculatedDuration = calculateSessionDuration(timer.startedAt, timer.completedAt);
      
      csv += `${timer.deviceId},${timer.label},${startTime},${endTime},${calculatedDuration}\n`;
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
        <header className="mb-6 sm:mb-8">
          <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" asChild>
                <Link to="/">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1">
                  <span className="flex items-center gap-2">
                    <BarChart2 className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                    Analytics Dashboard
                  </span>
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground">
                  View TV usage patterns and timer statistics
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4">
              <Button
                onClick={exportCSV}
                className="gap-2 items-center flex"
                variant="outline"
              >
                <Download className="h-4 w-4" />
                <span>Export CSV</span>
              </Button>
            </div>
          </div>
        </header>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="sm:w-1/2">
            <div className="mb-4">
              <label className="text-sm font-medium mb-1 block">Time Period</label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Last 7 Days</SelectItem>
                  <SelectItem value="30days">Last 30 Days</SelectItem>
                  <SelectItem value="90days">Last 90 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="sm:w-1/2">
            <div className="mb-4">
              <label className="text-sm font-medium mb-1 block">TV Device</label>
              <Select value={selectedDeviceId} onValueChange={setSelectedDeviceId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select TV" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All TVs</SelectItem>
                  {devices.map(device => (
                    <SelectItem key={device.deviceId} value={device.deviceId}>
                      {device.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Total Sessions</CardTitle>
              <CardDescription>Number of completed timers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{filteredTimers.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Total Usage Time</CardTitle>
              <CardDescription>Minutes spent watching TV</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {totalMinutes} mins
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Average Session</CardTitle>
              <CardDescription>Average minutes per session</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {averageSessionMinutes} mins
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="daily" className="mb-6">
          <TabsList className="mb-4">
            <TabsTrigger value="daily">Daily Usage</TabsTrigger>
            <TabsTrigger value="popular">Popular Times</TabsTrigger>
            <TabsTrigger value="devices">TV Devices</TabsTrigger>
            <TabsTrigger value="history">Session History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="daily">
            <Card>
              <CardHeader>
                <CardTitle>Daily Usage</CardTitle>
                <CardDescription>Sessions and minutes per day</CardDescription>
              </CardHeader>
              <CardContent>
                {dailyUsage.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">No data available for the selected time range</p>
                ) : (
                  <div className="h-[400px]">
                    <ChartContainer config={{
                      sessions: { color: '#2563eb' },
                      minutes: { color: '#8884d8' }
                    }}>
                      <BarChart data={dailyUsage}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={(date) => format(parseISO(date), 'MM/dd')} 
                        />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Bar 
                          dataKey="count" 
                          name="Sessions" 
                          yAxisId="left" 
                          fill="#2563eb" 
                        />
                        <Bar 
                          dataKey="totalMinutes" 
                          name="Minutes" 
                          yAxisId="right" 
                          fill="#8884d8" 
                        />
                      </BarChart>
                    </ChartContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="popular">
            <Card>
              <CardHeader>
                <CardTitle>Popular TV Times</CardTitle>
                <CardDescription>Number of sessions by hour of day</CardDescription>
              </CardHeader>
              <CardContent>
                {filteredTimers.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">No data available for the selected time range</p>
                ) : (
                  <div className="h-[400px]">
                    <ChartContainer config={{
                      count: { color: '#10b981' }
                    }}>
                      <BarChart data={hourlyUsage}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="hour" tickFormatter={formatHour} />
                        <YAxis />
                        <Tooltip content={<ChartTooltipContent />} />
                        <Bar 
                          dataKey="count" 
                          name="Sessions" 
                          fill="#10b981" 
                        />
                      </BarChart>
                    </ChartContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="devices">
            <Card>
              <CardHeader>
                <CardTitle>TV Device Usage</CardTitle>
                <CardDescription>Sessions and minutes by TV</CardDescription>
              </CardHeader>
              <CardContent>
                {deviceUsage.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">No data available for the selected time range</p>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="h-[300px]">
                      <p className="text-sm font-medium mb-2 text-center">Sessions by TV</p>
                      <ChartContainer config={{}}>
                        <RechartPieChart>
                          <Pie
                            data={deviceUsage}
                            dataKey="count"
                            nameKey="label"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label={(entry) => entry.label}
                          >
                            {deviceUsage.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </RechartPieChart>
                      </ChartContainer>
                    </div>
                    
                    <div className="h-[300px]">
                      <p className="text-sm font-medium mb-2 text-center">Minutes by TV</p>
                      <ChartContainer config={{}}>
                        <RechartPieChart>
                          <Pie
                            data={deviceUsage}
                            dataKey="totalMinutes"
                            nameKey="label"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label={(entry) => entry.label}
                          >
                            {deviceUsage.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </RechartPieChart>
                      </ChartContainer>
                    </div>
                    
                    <div className="lg:col-span-2">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>TV Name</TableHead>
                            <TableHead className="text-right">Sessions</TableHead>
                            <TableHead className="text-right">Minutes</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {deviceUsage.map((device) => (
                            <TableRow key={device.deviceId}>
                              <TableCell className="font-medium">{device.label}</TableCell>
                              <TableCell className="text-right">{device.count}</TableCell>
                              <TableCell className="text-right">{device.totalMinutes}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Session History</CardTitle>
                <CardDescription>
                  {filteredTimers.length} sessions in selected time period
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredTimers.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">No data available for the selected time range</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>TV Name</TableHead>
                          <TableHead>Start Time</TableHead>
                          <TableHead>End Time</TableHead>
                          <TableHead className="text-right">Duration</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTimers
                          .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
                          .map((timer, index) => {
                            // Calculate duration based on timestamps
                            const calculatedDuration = calculateSessionDuration(timer.startedAt, timer.completedAt);
                            
                            return (
                              <TableRow key={index}>
                                <TableCell>
                                  {format(parseISO(timer.completedAt), 'MMM d, yyyy')}
                                </TableCell>
                                <TableCell>{timer.label}</TableCell>
                                <TableCell>
                                  {format(parseISO(timer.startedAt), 'h:mm a')}
                                </TableCell>
                                <TableCell>
                                  {format(parseISO(timer.completedAt), 'h:mm a')}
                                </TableCell>
                                <TableCell className="text-right">
                                  {calculatedDuration} mins
                                </TableCell>
                              </TableRow>
                            );
                          })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
