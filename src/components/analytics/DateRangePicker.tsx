
import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface DateRangePickerProps {
  dateRange: { start: Date; end: Date };
  onDateRangeChange: (range: { start: Date; end: Date }) => void;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({ 
  dateRange, 
  onDateRangeChange 
}) => {
  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false);
  const [selectedRange, setSelectedRange] = React.useState<{
    from: Date;
    to: Date | undefined;
  }>({
    from: dateRange.start,
    to: dateRange.end,
  });

  // Predefined date ranges
  const dateRanges = [
    { 
      label: 'Today', 
      getDates: () => {
        const today = new Date();
        return { start: today, end: today };
      }
    },
    { 
      label: 'Yesterday', 
      getDates: () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return { start: yesterday, end: yesterday };
      }
    },
    { 
      label: 'Last 7 Days', 
      getDates: () => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 6);
        return { start, end };
      }
    },
    { 
      label: 'Last 30 Days', 
      getDates: () => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 29);
        return { start, end };
      }
    },
  ];

  const handleRangeSelect = (range: { from: Date; to: Date | undefined }) => {
    setSelectedRange(range);
    if (range.from && range.to) {
      onDateRangeChange({ start: range.from, end: range.to });
      setIsCalendarOpen(false);
    }
  };

  const handlePredefinedRangeSelect = (getDates: () => { start: Date; end: Date }) => {
    const { start, end } = getDates();
    setSelectedRange({ from: start, to: end });
    onDateRangeChange({ start, end });
    setIsCalendarOpen(false);
  };

  return (
    <div className="flex items-center space-x-2">
      <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "justify-start text-left font-normal w-full max-w-[280px]",
              !dateRange.start && "text-muted-foreground"
            )}
          >
            <CalendarDays className="mr-2 h-4 w-4" />
            {dateRange.start ? (
              dateRange.start.toDateString() === dateRange.end.toDateString() ? (
                format(dateRange.start, "PPP")
              ) : (
                <>
                  {format(dateRange.start, "PPP")} - {format(dateRange.end, "PPP")}
                </>
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="grid grid-cols-2 gap-2 p-2">
            {dateRanges.map((range) => (
              <Button
                key={range.label}
                size="sm"
                variant="outline"
                className="h-8"
                onClick={() => handlePredefinedRangeSelect(range.getDates)}
              >
                {range.label}
              </Button>
            ))}
          </div>
          <Calendar
            mode="range"
            selected={selectedRange}
            onSelect={(range) => handleRangeSelect(range || { from: new Date(), to: new Date() })}
            initialFocus
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};
