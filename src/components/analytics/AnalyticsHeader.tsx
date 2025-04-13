
import { ArrowLeft, Download, BarChart2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface AnalyticsHeaderProps {
  exportCSV: () => void;
}

export function AnalyticsHeader({ exportCSV }: AnalyticsHeaderProps) {
  return (
    <header className="mb-6 sm:mb-8">
      <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1">
              <span className="flex items-center gap-2">
                <BarChart2 className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                Analytics Dashboard
              </span>
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              View TV usage patterns and timer statistics
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4">
          <Button
            onClick={exportCSV}
            className="gap-2 items-center flex"
            variant="outline"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
