
import React from 'react';
import { cn } from '@/lib/utils';

interface TVStatusIndicatorProps {
  isOn: boolean;
  hasTimer: boolean;
  isTimerActive: boolean;
}

export function TVStatusIndicator({ isOn, hasTimer, isTimerActive }: TVStatusIndicatorProps) {
  const getStatusColor = () => {
    if (!isOn) return 'bg-gray-300 dark:bg-gray-700';
    if (!hasTimer) return 'bg-yellow-400';
    if (isTimerActive) return 'bg-green-500';
    return 'bg-red-500';
  };

  return (
    <div className={cn(
      "w-3 h-3 rounded-full animate-pulse-subtle",
      getStatusColor()
    )} />
  );
}
