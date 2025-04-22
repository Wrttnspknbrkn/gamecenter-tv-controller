
import { useEffect } from 'react';

/**
 * This adapter listens for timer completions in localStorage and dispatches events
 * that the analytics system can listen to without modifying the core timer logic
 */
export const useTimerCompletionAdapter = () => {
  useEffect(() => {
    // Function to check timer status and dispatch events
    const checkTimerCompletions = () => {
      // We don't directly access timer data here, we just dispatch events
      // when we detect a timer has completed through the storage event
    };

    // This handler will be triggered whenever localStorage changes
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key && event.key.includes('tv-timer-')) {
        try {
          // Parse the new timer data
          const newData = event.newValue ? JSON.parse(event.newValue) : null;
          const oldData = event.oldValue ? JSON.parse(event.oldValue) : null;
          
          // Check if this timer just completed
          if (newData && oldData && 
              oldData.status === 'running' && 
              newData.status === 'completed') {
            
            // Extract device info from the storage key
            const deviceId = event.key.replace('tv-timer-', '');
            const deviceName = newData.deviceName || 'TV Device';
            const duration = newData.duration || 0;
            
            // Dispatch a custom event for the analytics recorder to pick up
            const timerCompletedEvent = new CustomEvent('timerCompleted', {
              detail: {
                deviceId,
                deviceName,
                duration
              }
            });
            
            window.dispatchEvent(timerCompletedEvent);
            console.log('Timer completion detected and event dispatched for', deviceName);
          }
        } catch (error) {
          console.error('Error processing timer completion:', error);
        }
      }
    };

    // We can't directly use the storage event handler in the same window
    // But we can poll localStorage to check for timer completions
    const pollInterval = setInterval(checkTimerCompletions, 1000);
    
    // For cross-window/tab support
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return null;
};
