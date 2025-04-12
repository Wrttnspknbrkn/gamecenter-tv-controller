
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

interface AnalyticsSummaryProps {
  totalSessions: number;
  totalMinutes: number;
  averageSessionMinutes: number;
}

export function AnalyticsSummary({ totalSessions, totalMinutes, averageSessionMinutes }: AnalyticsSummaryProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
          <CardDescription>Minutes spent watching TV</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {totalMinutes} mins
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Average Session</CardTitle>
          <CardDescription>Average minutes per session</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {averageSessionMinutes} mins
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
