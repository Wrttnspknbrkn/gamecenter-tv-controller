
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HourlyUsage } from '@/hooks/timer/timerTypes';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

interface PopularTimesTabProps {
  hourlyUsage: HourlyUsage[];
  isEmpty: boolean;
}

export function PopularTimesTab({ hourlyUsage, isEmpty }: PopularTimesTabProps) {
  // Format hour for display
  const formatHour = (hour: number) => {
    return `${hour % 12 === 0 ? 12 : hour % 12}${hour < 12 ? 'am' : 'pm'}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Popular Gaming Times</CardTitle>
        <CardDescription>Number of sessions by hour of day</CardDescription>
      </CardHeader>
      <CardContent>
        {isEmpty ? (
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
