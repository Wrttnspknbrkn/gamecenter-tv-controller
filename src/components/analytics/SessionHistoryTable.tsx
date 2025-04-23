
import React from 'react';
import { format, formatDistanceStrict } from 'date-fns';
import { 
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { TimerAnalyticsSession } from '@/hooks/analytics/useAnalyticsStorage';

interface SessionHistoryTableProps {
  sessions: TimerAnalyticsSession[];
  isLoading?: boolean;
}

export const SessionHistoryTable = ({ sessions, isLoading }: SessionHistoryTableProps) => {
  // Sort sessions by start time (newest first)
  const sortedSessions = [...sessions].sort((a, b) => 
    new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
  );
  
  // Function to format time displays
  const formatDateTime = (dateTimeString: string) => {
    try {
      return format(new Date(dateTimeString), 'MMM d, yyyy h:mm a');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };
  
  // Function to calculate session duration display
  const formatDuration = (session: TimerAnalyticsSession) => {
    // If the session has an accurate actual duration, use it
    if (session.actualDurationSeconds > 0) {
      // Convert to minutes, minimum 1 minute
      const minutes = Math.max(1, Math.ceil(session.actualDurationSeconds / 60));
      return `${minutes} min`;
    }
    
    // Fall back to original duration if actual is not available
    if (session.originalDurationMinutes > 0) {
      return `${session.originalDurationMinutes} min (planned)`;
    }
    
    // If the session is still active, calculate based on current time
    if (session.completionType === 'active') {
      const startDate = new Date(session.startTime);
      const currentDuration = Math.ceil((Date.now() - startDate.getTime()) / 60000);
      return `${currentDuration} min (ongoing)`;
    }
    
    return 'Unknown';
  };
  
  // Get status label based on completion type
  const getStatusLabel = (session: TimerAnalyticsSession) => {
    switch (session.completionType) {
      case 'completed':
        return 'Completed';
      case 'stopped':
        return 'Manually Stopped';
      case 'extended':
        return 'Extended';
      case 'active':
        return 'Active';
      default:
        return 'Unknown';
    }
  };
  
  // Get formatted extensions info
  const getExtensionsInfo = (session: TimerAnalyticsSession) => {
    if (session.extensions.length === 0) {
      return 'None';
    }
    
    const totalExtensionMinutes = session.extensions.reduce(
      (sum, ext) => sum + ext.minutes, 0
    );
    
    return `${session.extensions.length} (${totalExtensionMinutes} min)`;
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading session history...</div>;
  }

  if (sortedSessions.length === 0) {
    return (
      <div className="text-center py-8 border rounded-lg bg-muted/20">
        <p className="text-muted-foreground">No session history data available</p>
      </div>
    );
  }

  return (
    <Table>
      <TableCaption>Session history for TV devices</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Device</TableHead>
          <TableHead>Start Time</TableHead>
          <TableHead>End Time</TableHead>
          <TableHead>Duration</TableHead>
          <TableHead>Extensions</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedSessions.map((session) => (
          <TableRow key={session.id}>
            <TableCell className="font-medium">{session.deviceName}</TableCell>
            <TableCell>{formatDateTime(session.startTime)}</TableCell>
            <TableCell>
              {session.endTime ? formatDateTime(session.endTime) : 'In progress'}
            </TableCell>
            <TableCell>{formatDuration(session)}</TableCell>
            <TableCell>{getExtensionsInfo(session)}</TableCell>
            <TableCell>{getStatusLabel(session)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
