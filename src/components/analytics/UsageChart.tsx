
import React from 'react';
import { DailyUsage, HourlyUsage } from '@/types/analyticsTypes';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface DailyUsageChartProps {
  dailyUsage: DailyUsage[];
}

export const DailyUsageChart: React.FC<DailyUsageChartProps> = ({ dailyUsage }) => {
  // Group and format data for the chart
  const chartData = dailyUsage.reduce<Record<string, any>>((acc, usage) => {
    const date = usage.date;
    if (!acc[date]) {
      acc[date] = { date };
    }
    acc[date][usage.deviceName] = Math.round(usage.totalMinutes);
    return acc;
  }, {});

  const formattedData = Object.values(chartData);
  
  // Get unique device names for bars
  const deviceNames = Array.from(
    new Set(dailyUsage.map((item) => item.deviceName))
  );
  
  // Generate colors for each device
  const colors = [
    "#4f46e5", "#10b981", "#f59e0b", "#ef4444", 
    "#8b5cf6", "#ec4899", "#06b6d4", "#14b8a6"
  ];

  return (
    <div className="w-full h-80">
      {formattedData.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={formattedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(value) => {
                const date = new Date(value);
                return new Intl.DateTimeFormat('en-US', {
                  month: 'short',
                  day: 'numeric'
                }).format(date);
              }}
            />
            <YAxis label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }} />
            <Tooltip 
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-md">
                      <div className="font-medium">
                        {new Date(label).toLocaleDateString()}
                      </div>
                      <div className="pt-1">
                        {payload.map((entry, index) => (
                          <div key={`item-${index}`} className="flex items-center gap-2">
                            <div
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: entry.color }}
                            />
                            <span className="text-sm">{entry.name}: {entry.value} mins</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend />
            {deviceNames.map((device, index) => (
              <Bar 
                key={device} 
                dataKey={device} 
                fill={colors[index % colors.length]} 
                name={device}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-full w-full flex items-center justify-center text-muted-foreground">
          No usage data available for the selected period
        </div>
      )}
    </div>
  );
};

interface HourlyUsageChartProps {
  hourlyUsage: HourlyUsage[];
}

export const HourlyUsageChart: React.FC<HourlyUsageChartProps> = ({ hourlyUsage }) => {
  // Format data for the chart
  const chartData = hourlyUsage.map(item => ({
    hour: item.hour,
    count: item.count,
    label: `${item.hour}:00 - ${item.hour + 1}:00`
  }));

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="hour" 
            tickFormatter={(value) => `${value}:00`}
            label={{ value: 'Hour of Day', position: 'insideBottom', offset: -5 }}
          />
          <YAxis label={{ value: 'Number of Sessions', angle: -90, position: 'insideLeft' }} />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-md">
                    <div className="font-medium">{data.label}</div>
                    <div className="pt-1">
                      <span className="text-sm">{data.count} sessions</span>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="count" fill="#4f46e5" name="Sessions" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
