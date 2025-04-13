
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface SummaryCardsProps {
  totalSessions: number;
  totalMinutes: number;
}

export function SummaryCards({ totalSessions, totalMinutes }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Total Sessions</CardTitle>
          <CardDescription>Number of completed timers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{totalSessions}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Total Usage Time</CardTitle>
          <CardDescription>Minutes spent gaming</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {totalMinutes} mins
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
