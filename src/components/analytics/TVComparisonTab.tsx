
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRangePicker } from './DateRangePicker';
import { AnalyticsState } from '@/hooks/useTimerControl';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";

interface TVComparisonTabProps {
  analytics: AnalyticsState;
  dateRange: { from: Date; to: Date };
  setDateRange: React.Dispatch<React.SetStateAction<{ from: Date; to: Date }>>;
}

export const TVComparisonTab: React.FC<TVComparisonTabProps> = ({ analytics, dateRange, setDateRange }) => {
  // Filter sessions by date range
  const filteredSessions = analytics.sessions.filter(session => {
    const sessionDate = new Date(session.endTime);
    return sessionDate >= dateRange.from && sessionDate <= dateRange.to;
  });

  // Group by TV and get stats
  const tvStats = useMemo(() => {
    const stats = new Map<string, { 
      deviceId: string, 
      label: string, 
      sessions: number, 
      totalMinutes: number 
    }>();
    
    filteredSessions.forEach(session => {
      const existing = stats.get(session.deviceId) || { 
        deviceId: session.deviceId, 
        label: session.deviceLabel, 
        sessions: 0, 
        totalMinutes: 0 
      };
      
      existing.sessions += 1;
      existing.totalMinutes += session.durationMinutes;
      
      stats.set(session.deviceId, existing);
    });
    
    return Array.from(stats.values());
  }, [filteredSessions]);

  // Prepare data for pie charts
  const sessionData = tvStats.map(tv => ({
    name: tv.label,
    value: tv.sessions
  }));

  const timeData = tvStats.map(tv => ({
    name: tv.label,
    value: tv.totalMinutes
  }));

  // Colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  // Chart configurations
  const chartConfig = {
    sessions: {
      label: "Sessions by TV",
      color: "hsl(var(--primary))",
    },
    minutes: {
      label: "Time by TV",
      color: "hsl(var(--secondary))",
    },
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>TV Comparison</CardTitle>
        <DateRangePicker dateRange={dateRange} setDateRange={setDateRange} />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-[300px]">
            <h3 className="text-lg font-medium mb-2 text-center">Sessions by TV</h3>
            <ChartContainer config={chartConfig}>
              <PieChart>
                <Pie
                  data={sessionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                >
                  {sessionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend 
                  content={<ChartLegendContent />} 
                  layout="horizontal"
                  verticalAlign="bottom"
                />
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
          </div>
          
          <div className="h-[300px]">
            <h3 className="text-lg font-medium mb-2 text-center">Total Time by TV (minutes)</h3>
            <ChartContainer config={chartConfig}>
              <PieChart>
                <Pie
                  data={timeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                >
                  {timeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend 
                  content={<ChartLegendContent />} 
                  layout="horizontal"
                  verticalAlign="bottom"
                />
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
