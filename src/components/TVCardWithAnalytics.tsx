
import React from 'react';
import { TVCard } from '@/components/TVCard';
import { useTimerControlWithAnalytics } from '@/hooks/analytics/useTimerControlWithAnalytics';
import { TvDevice } from '@/services/smartThingsService';
import { TimerState } from '@/hooks/useTimerControl';

interface TVCardWithAnalyticsProps {
  tv: TvDevice;
  timer: TimerState;
  devices: TvDevice[];
}

export const TVCardWithAnalytics = ({ tv, timer, devices }: TVCardWithAnalyticsProps) => {
  const { 
    startTimer, 
    pauseTimer, 
    resumeTimer, 
    stopTimer, 
    extendTimer,
    formatTime
  } = useTimerControlWithAnalytics(devices);
  
  return (
    <TVCard
      key={tv.id}
      tv={tv}
      timer={timer}
      onStartTimer={(duration) => startTimer(tv.id, tv.label, duration)}
      onPauseTimer={() => pauseTimer(tv.id)}
      onResumeTimer={() => resumeTimer(tv.id)}
      onStopTimer={() => stopTimer(tv.id)}
      onExtendTimer={(duration) => extendTimer(tv.id, duration)}
      formatTime={formatTime}
    />
  );
};
