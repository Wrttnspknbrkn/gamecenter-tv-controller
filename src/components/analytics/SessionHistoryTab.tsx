
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRangePicker } from './DateRangePicker';
import { AnalyticsState } from '@/hooks/useTimerControl';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { format } from "date-fns";

interface SessionHistoryTabProps {
  analytics: AnalyticsState;
  dateRange: { from: Date; to: Date };
  setDateRange: React.Dispatch<React.SetStateAction<{ from: Date; to: Date }>>;
}

export const SessionHistoryTab: React.FC<SessionHistoryTabProps> = ({ analytics, dateRange, setDateRange }) => {
  // Filter sessions by date range
  const filteredSessions = analytics.sessions
    .filter(session => {
      const sessionDate = new Date(session.endTime);
      return sessionDate >= dateRange.from && sessionDate <= dateRange.to;
    })
    // Sort by end time (most recent first)
    .sort((a, b) => b.endTime - a.endTime);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Session History</CardTitle>
        <DateRangePicker dateRange={dateRange} setDateRange={setDateRange} />
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>TV Name</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Start Time</TableHead>
              <TableHead>End Time</TableHead>
              <TableHead>Duration</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSessions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">No sessions recorded in this date range</TableCell>
              </TableRow>
            ) : (
              filteredSessions.map(session => (
                <TableRow key={session.id}>
                  <TableCell className="font-medium">{session.deviceLabel}</TableCell>
                  <TableCell>{format(new Date(session.endTime), 'MMM dd, yyyy')}</TableCell>
                  <TableCell>{format(new Date(session.startTime), 'HH:mm:ss')}</TableCell>
                  <TableCell>{format(new Date(session.endTime), 'HH:mm:ss')}</TableCell>
                  <TableCell>{session.durationMinutes} minutes</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
