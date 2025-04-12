
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { PieChart as RechartPieChart, Pie, Cell, Tooltip } from 'recharts';
import { ChartContainer } from '@/components/ui/chart';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { DeviceUsage } from '@/hooks/timer/timerTypes';

interface DevicesTabProps {
  deviceUsage: DeviceUsage[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export function DevicesTab({ deviceUsage }: DevicesTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>TV Device Usage</CardTitle>
        <CardDescription>Sessions and minutes by TV</CardDescription>
      </CardHeader>
      <CardContent>
        {deviceUsage.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">No data available for the selected time range</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-[300px]">
              <p className="text-sm font-medium mb-2 text-center">Sessions by TV</p>
              <ChartContainer config={{}}>
                <RechartPieChart>
                  <Pie
                    data={deviceUsage}
                    dataKey="count"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(entry) => entry.label}
                  >
                    {deviceUsage.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartPieChart>
              </ChartContainer>
            </div>
            
            <div className="h-[300px]">
              <p className="text-sm font-medium mb-2 text-center">Minutes by TV</p>
              <ChartContainer config={{}}>
                <RechartPieChart>
                  <Pie
                    data={deviceUsage}
                    dataKey="totalMinutes"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(entry) => entry.label}
                  >
                    {deviceUsage.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartPieChart>
              </ChartContainer>
            </div>
            
            <div className="lg:col-span-2">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>TV Name</TableHead>
                    <TableHead className="text-right">Sessions</TableHead>
                    <TableHead className="text-right">Minutes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deviceUsage.map((device) => (
                    <TableRow key={device.deviceId}>
                      <TableCell className="font-medium">{device.label}</TableCell>
                      <TableCell className="text-right">{device.count}</TableCell>
                      <TableCell className="text-right">{device.totalMinutes}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
