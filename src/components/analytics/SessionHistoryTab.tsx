
import { format, parseISO } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CompletedTimer } from '@/hooks/timer/timerTypes';

interface SessionHistoryTabProps {
  filteredTimers: CompletedTimer[];
}

export function SessionHistoryTab({ filteredTimers }: SessionHistoryTabProps) {
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
                    // Use the stored duration directly as it should now be correct
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
                        <TableCell className="text-right font-medium">
                          {timer.durationMinutes} mins
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
