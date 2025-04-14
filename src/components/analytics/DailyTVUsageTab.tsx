
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRangePicker } from './DateRangePicker';
import { AnalyticsState } from '@/hooks/useTimerControl';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format, eachDayOfInterval, isEqual, parseISO } from "date-fns";

interface DailyTVUsageTabProps {
  analytics: AnalyticsState;
  dateRange: { from: Date; to: Date };
  setDateRange: React.Dispatch<React.SetStateAction<{ from: Date; to: Date }>>;
}

export const DailyTVUsageTab: React.FC<DailyTVUsageTabProps> = ({ analytics, dateRange, setDateRange }) => {
  // Filter sessions by date range
  const filteredSessions = useMemo(() => {
    return analytics.sessions.filter(session => {
      const sessionDate = new Date(session.endTime);
      return sessionDate >= dateRange.from && sessionDate <= dateRange.to;
    });
  }, [analytics.sessions, dateRange]);

  // Generate all days in the date range
  const days = useMemo(() => {
    return eachDayOfInterval({
      start: dateRange.from,
      end: dateRange.to
    });
  }, [dateRange]);

  // Get unique TV IDs
  const tvIds = useMemo(() => {
    return [...new Set(filteredSessions.map(session => session.deviceId))];
  }, [filteredSessions]);

  // Get TV names
  const tvNames = useMemo(() => {
    const names: Record<string, string> = {};
    filteredSessions.forEach(session => {
      names[session.deviceId] = session.deviceLabel;
    });
    return names;
  }, [filteredSessions]);

  // Calculate daily usage per TV
  const dailyUsageByTV = useMemo(() => {
    const usage: Record<string, Record<string, number>> = {};
    
    // Initialize with all TVs and days
    tvIds.forEach(tvId => {
      usage[tvId] = {};
      days.forEach(day => {
        usage[tvId][format(day, 'yyyy-MM-dd')] = 0;
      });
    });
    
    // Fill in the data
    filteredSessions.forEach(session => {
      const sessionDate = format(new Date(session.endTime), 'yyyy-MM-dd');
      if (usage[session.deviceId] && usage[session.deviceId][sessionDate] !== undefined) {
        usage[session.deviceId][sessionDate] += session.durationMinutes;
      }
    });
    
    return usage;
  }, [filteredSessions, tvIds, days]);

  // Calculate daily totals
  const dailyTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    
    days.forEach(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      totals[dateStr] = 0;
      
      tvIds.forEach(tvId => {
        if (dailyUsageByTV[tvId] && dailyUsageByTV[tvId][dateStr] !== undefined) {
          totals[dateStr] += dailyUsageByTV[tvId][dateStr];
        }
      });
    });
    
    return totals;
  }, [days, tvIds, dailyUsageByTV]);

  // Calculate TV totals
  const tvTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    
    tvIds.forEach(tvId => {
      totals[tvId] = 0;
      
      days.forEach(day => {
        const dateStr = format(day, 'yyyy-MM-dd');
        if (dailyUsageByTV[tvId] && dailyUsageByTV[tvId][dateStr] !== undefined) {
          totals[tvId] += dailyUsageByTV[tvId][dateStr];
        }
      });
    });
    
    return totals;
  }, [days, tvIds, dailyUsageByTV]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Daily TV Usage Report</CardTitle>
        <DateRangePicker dateRange={dateRange} setDateRange={setDateRange} />
      </CardHeader>
      <CardContent>
        {tvIds.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground">No TV usage data found for the selected date range</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky left-0 bg-background">TV Name</TableHead>
                  {days.map(day => (
                    <TableHead key={day.toISOString()}>
                      {format(day, 'MMM dd')}
                    </TableHead>
                  ))}
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tvIds.map(tvId => (
                  <TableRow key={tvId}>
                    <TableCell className="font-medium sticky left-0 bg-background">{tvNames[tvId]}</TableCell>
                    {days.map(day => {
                      const dateStr = format(day, 'yyyy-MM-dd');
                      const minutes = dailyUsageByTV[tvId][dateStr] || 0;
                      return (
                        <TableCell key={day.toISOString()} className={minutes > 0 ? 'font-semibold' : ''}>
                          {minutes > 0 ? `${minutes} min` : '-'}
                        </TableCell>
                      );
                    })}
                    <TableCell className="font-bold">{tvTotals[tvId]} min</TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-muted/50">
                  <TableCell className="font-bold sticky left-0 bg-muted/50">Daily Total</TableCell>
                  {days.map(day => {
                    const dateStr = format(day, 'yyyy-MM-dd');
                    return (
                      <TableCell key={day.toISOString()} className="font-bold">
                        {dailyTotals[dateStr]} min
                      </TableCell>
                    );
                  })}
                  <TableCell className="font-bold">
                    {Object.values(dailyTotals).reduce((sum, min) => sum + min, 0)} min
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
