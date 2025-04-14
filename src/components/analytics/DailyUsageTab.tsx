
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRangePicker } from './DateRangePicker';
import { AnalyticsState } from '@/hooks/useTimerControl';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { addDays, format, eachDayOfInterval } from "date-fns";

interface DailyUsageTabProps {
  analytics: AnalyticsState;
  dateRange: { from: Date; to: Date };
  setDateRange: React.Dispatch<React.SetStateAction<{ from: Date; to: Date }>>;
}

export const DailyUsageTab: React.FC<DailyUsageTabProps> = ({ analytics, dateRange, setDateRange }) => {
  // Create an array of all days in the date range
  const days = eachDayOfInterval({
    start: dateRange.from,
    end: dateRange.to
  });

  // Initialize data for each day with zeros
  const dailyData = days.map(day => ({
    date: format(day, 'yyyy-MM-dd'),
    displayDate: format(day, 'MMM dd'),
    sessions: 0,
    minutes: 0
  }));

  // Populate the data with actual session counts and durations
  analytics.sessions.forEach(session => {
    const sessionDate = new Date(session.endTime);
    const dateStr = format(sessionDate, 'yyyy-MM-dd');
    
    const dayEntry = dailyData.find(d => d.date === dateStr);
    if (dayEntry) {
      dayEntry.sessions += 1;
      dayEntry.minutes += session.durationMinutes;
    }
  });

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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Daily Usage</CardTitle>
        <DateRangePicker dateRange={dateRange} setDateRange={setDateRange} />
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ChartContainer config={chartConfig}>
            <BarChart data={dailyData}>
              <XAxis dataKey="displayDate" />
              <YAxis />
              <Tooltip content={<ChartTooltipContent />} />
              <Bar dataKey="sessions" name="sessions" fill={chartConfig.sessions.color} />
              <Bar dataKey="minutes" name="minutes" fill={chartConfig.minutes.color} />
            </BarChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};
