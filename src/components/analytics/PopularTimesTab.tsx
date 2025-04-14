
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRangePicker } from './DateRangePicker';
import { AnalyticsState } from '@/hooks/useTimerControl';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { format, addHours, startOfDay } from "date-fns";

interface PopularTimesTabProps {
  analytics: AnalyticsState;
  dateRange: { from: Date; to: Date };
  setDateRange: React.Dispatch<React.SetStateAction<{ from: Date; to: Date }>>;
}

export const PopularTimesTab: React.FC<PopularTimesTabProps> = ({ analytics, dateRange, setDateRange }) => {
  // Filter sessions by date range
  const filteredSessions = useMemo(() => analytics.sessions.filter(session => {
    const sessionDate = new Date(session.endTime);
    return sessionDate >= dateRange.from && sessionDate <= dateRange.to;
  }), [analytics.sessions, dateRange]);
  
  // Analyze popular hours
  const hourlyData = useMemo(() => {
    // Create 24 hour bins
    const hours = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      displayHour: format(addHours(startOfDay(new Date()), i), 'h a'),
      sessions: 0,
      minutes: 0
    }));
    
    // Count sessions by hour
    filteredSessions.forEach(session => {
      const sessionHour = new Date(session.startTime).getHours();
      hours[sessionHour].sessions += 1;
      hours[sessionHour].minutes += session.durationMinutes;
    });
    
    return hours;
  }, [filteredSessions]);

  // Find peak hours
  const peakHours = useMemo(() => {
    if (hourlyData.length === 0) return [];
    
    // Sort by number of sessions
    const sorted = [...hourlyData].sort((a, b) => b.sessions - a.sessions);
    // Take top 3 if they have sessions
    return sorted.filter(h => h.sessions > 0).slice(0, 3);
  }, [hourlyData]);

  // Configuration for the chart
  const chartConfig = {
    sessions: {
      label: "Sessions",
      color: "hsl(var(--primary))",
    },
    minutes: {
      label: "Minutes",
      color: "hsl(var(--secondary))",
    },
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Popular Gaming Times</CardTitle>
          <DateRangePicker dateRange={dateRange} setDateRange={setDateRange} />
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3 mb-6">
            {peakHours.length > 0 ? (
              peakHours.map((hour, idx) => (
                <Card key={hour.hour} className={idx === 0 ? "border-primary" : ""}>
                  <CardHeader className="py-3">
                    <CardTitle className="text-base">
                      {idx === 0 ? "Most Popular" : idx === 1 ? "Second Popular" : "Third Popular"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{hour.displayHour}</div>
                    <p className="text-sm text-muted-foreground">
                      {hour.sessions} sessions, {hour.minutes} minutes
                    </p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="md:col-span-3 text-center p-4">
                <p className="text-muted-foreground">No data available for the selected period</p>
              </div>
            )}
          </div>
          
          <div className="h-[300px]">
            <ChartContainer config={chartConfig}>
              <BarChart data={hourlyData}>
                <XAxis dataKey="displayHour" />
                <YAxis />
                <Tooltip content={<ChartTooltipContent />} />
                <Bar dataKey="sessions" name="sessions" fill={chartConfig.sessions.color} />
                <Bar dataKey="minutes" name="minutes" fill={chartConfig.minutes.color} />
              </BarChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
