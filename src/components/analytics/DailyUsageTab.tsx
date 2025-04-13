
import { format, parseISO } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DailyUsage } from '@/hooks/timer/timerTypes';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

interface DailyUsageTabProps {
  dailyUsage: DailyUsage[];
}

export function DailyUsageTab({ dailyUsage }: DailyUsageTabProps) {
  return (
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
  );
}
