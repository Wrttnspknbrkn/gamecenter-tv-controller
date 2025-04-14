
import React from 'react';
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { format, isValid } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface DateRangePickerProps {
  dateRange: { from: Date; to: Date };
  setDateRange: React.Dispatch<React.SetStateAction<{ from: Date; to: Date }>>;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({ dateRange, setDateRange }) => {
  // Validate dates before using them
  const from = isValid(dateRange.from) ? dateRange.from : new Date();
  const to = isValid(dateRange.to) ? dateRange.to : new Date();

  const handleRangeSelect = (range: { from?: Date; to?: Date }) => {
    if (range?.from && range?.to) {
      console.log(`Selected date range: ${range.from.toLocaleDateString()} to ${range.to.toLocaleDateString()}`);
      setDateRange({ from: range.from, to: range.to });
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-[240px] justify-start text-left font-normal",
              !dateRange && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {from && to ? (
              <>
                {format(from, "LLL dd, y")} -{" "}
                {format(to, "LLL dd, y")}
              </>
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            defaultMonth={from}
            selected={{
              from: from,
              to: to,
            }}
            onSelect={handleRangeSelect}
            numberOfMonths={2}
            className="pointer-events-auto" // Ensure click events work properly
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};
