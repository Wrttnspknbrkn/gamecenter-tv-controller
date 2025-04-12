
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { HourlyUsage } from '@/hooks/timer/timerTypes';

interface PopularTimesTabProps {
  hourlyUsage: HourlyUsage[];
  hasData: boolean;
}

export function PopularTimesTab({ hourlyUsage, hasData }: PopularTimesTabProps) {
  // Format hour for display
  const formatHour = (hour: number) => {
    return `${hour % 12 === 0 ? 12 : hour % 12}${hour < 12 ? 'am' : 'pm'}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Popular TV Times</CardTitle>
        <CardDescription>Number of sessions by hour of day</CardDescription>
      </CardHeader>
      <CardContent>
        {!hasData ? (
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
  );
}
