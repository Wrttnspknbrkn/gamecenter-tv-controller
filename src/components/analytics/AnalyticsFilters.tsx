
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Device {
  deviceId: string;
  label: string;
}

interface AnalyticsFiltersProps {
  dateRange: string;
  setDateRange: (value: string) => void;
  selectedDeviceId: string;
  setSelectedDeviceId: (value: string) => void;
  devices: Device[];
}

export function AnalyticsFilters({
  dateRange,
  setDateRange,
  selectedDeviceId,
  setSelectedDeviceId,
  devices
}: AnalyticsFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="sm:w-1/2">
        <div className="mb-4">
          <label className="text-sm font-medium mb-1 block">Time Period</label>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger>
              <SelectValue placeholder="Select date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="90days">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="sm:w-1/2">
        <div className="mb-4">
          <label className="text-sm font-medium mb-1 block">TV Device</label>
          <Select value={selectedDeviceId} onValueChange={setSelectedDeviceId}>
            <SelectTrigger>
              <SelectValue placeholder="Select TV" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All TVs</SelectItem>
              {devices.map(device => (
                <SelectItem key={device.deviceId} value={device.deviceId}>
                  {device.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
