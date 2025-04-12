
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { format, parseISO, differenceInSeconds } from 'date-fns';
import { CompletedTimer } from '@/hooks/timer/timerTypes';

interface SessionHistoryTabProps {
  filteredTimers: CompletedTimer[];
}

export function SessionHistoryTab({ filteredTimers }: SessionHistoryTabProps) {
  // Calculate session duration in minutes based on timestamps
  const calculateSessionDuration = (startTime: string, endTime: string) => {
    const start = parseISO(startTime);
    const end = parseISO(endTime);
    const diffSeconds = differenceInSeconds(end, start);
    return Math.round(diffSeconds / 60);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Session History</CardTitle>
        <CardDescription>
          {filteredTimers.length} sessions in selected time period
        </CardDescription>
      </CardHeader>
      <CardContent>
        {filteredTimers.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">No data available for the selected time range</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>TV Name</TableHead>
                  <TableHead>Start Time</TableHead>
                  <TableHead>End Time</TableHead>
                  <TableHead className="text-right">Duration</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTimers
                  .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
                  .map((timer, index) => {
                    // Calculate duration based on timestamps
                    const calculatedDuration = calculateSessionDuration(timer.startedAt, timer.completedAt);
                    
                    return (
                      <TableRow key={index}>
                        <TableCell>
                          {format(parseISO(timer.completedAt), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>{timer.label}</TableCell>
                        <TableCell>
                          {format(parseISO(timer.startedAt), 'h:mm a')}
                        </TableCell>
                        <TableCell>
                          {format(parseISO(timer.completedAt), 'h:mm a')}
                        </TableCell>
                        <TableCell className="text-right">
                          {calculatedDuration} mins
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
