
import React from 'react';
import { Button } from "@/components/ui/button";
import { Download } from 'lucide-react';
import { AnalyticsState } from '@/hooks/useTimerControl';

interface ExportAnalyticsProps {
  analytics: AnalyticsState;
  dateRange: { from: Date; to: Date };
}

export const ExportAnalytics: React.FC<ExportAnalyticsProps> = ({ analytics, dateRange }) => {
  const handleExportCSV = () => {
    // Filter sessions by date range
    const filteredSessions = analytics.sessions.filter(session => {
      const sessionDate = new Date(session.endTime);
      return sessionDate >= dateRange.from && sessionDate <= dateRange.to;
    });

    // Define CSV headers
    const headers = ['TV ID', 'TV Name', 'Start Time', 'End Time', 'Duration (minutes)'];
    
    // Create CSV content
    const csvRows = [
      headers.join(','),
      ...filteredSessions.map(session => [
        session.deviceId,
        session.deviceLabel,
        new Date(session.startTime).toLocaleString(),
        new Date(session.endTime).toLocaleString(),
        session.durationMinutes
      ].join(','))
    ];
    
    const csvContent = csvRows.join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `tv-analytics-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = () => {
    // Filter sessions by date range
    const filteredSessions = analytics.sessions.filter(session => {
      const sessionDate = new Date(session.endTime);
      return sessionDate >= dateRange.from && sessionDate <= dateRange.to;
    });

    // Create JSON content
    const jsonContent = JSON.stringify(filteredSessions, null, 2);
    
    // Create download link
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `tv-analytics-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex gap-2">
      <Button onClick={handleExportCSV} variant="outline" className="flex items-center gap-2">
        <Download className="h-4 w-4" />
        Export CSV
      </Button>
      <Button onClick={handleExportJSON} variant="outline" className="flex items-center gap-2">
        <Download className="h-4 w-4" />
        Export JSON
      </Button>
    </div>
  );
};
