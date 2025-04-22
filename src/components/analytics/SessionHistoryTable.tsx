
import React from 'react';
import { TimerSession } from '@/types/analyticsTypes';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';

interface SessionHistoryTableProps {
  sessions: TimerSession[];
}

export const SessionHistoryTable: React.FC<SessionHistoryTableProps> = ({ sessions }) => {
  // Helper function to format date and time
  const formatDateTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Helper function to format duration
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min${minutes !== 1 ? 's' : ''}`;
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Device</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Start Time</TableHead>
            <TableHead>End Time</TableHead>
            <TableHead>Duration</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sessions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                No sessions recorded in this time period
              </TableCell>
            </TableRow>
          ) : (
            sessions.map((session, index) => (
              <TableRow key={`${session.deviceId}-${session.startTime}-${index}`}>
                <TableCell className="font-medium">{session.deviceName}</TableCell>
                <TableCell>
                  {new Date(session.date).toLocaleDateString()}
                </TableCell>
                <TableCell>{formatDateTime(session.startTime)}</TableCell>
                <TableCell>{formatDateTime(session.endTime)}</TableCell>
                <TableCell>{formatDuration(session.duration)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
