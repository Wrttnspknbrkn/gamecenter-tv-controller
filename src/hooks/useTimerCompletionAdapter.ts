
import { useEffect } from 'react';

/**
 * This adapter listens for timer completions in localStorage and dispatches events
 * that the analytics system can listen to without modifying the core timer logic
 */
export const useTimerCompletionAdapter = () => {
  useEffect(() => {
    // Track timer states for detecting changes
    const timerStates: Record<string, any> = {};

    // Function to check timer status and dispatch events
    const checkTimerCompletions = () => {
      try {
        // Scan localStorage for timer-related keys
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('tv-timer-')) {
            const deviceId = key.replace('tv-timer-', '');
            const timerData = JSON.parse(localStorage.getItem(key) || '{}');
            const previousState = timerStates[deviceId];
            
            // Store current state for next comparison
            timerStates[deviceId] = { ...timerData };
            
            // Skip if no previous state to compare
            if (!previousState) continue;
            
            // Detect timer completion: running -> completed
            if (previousState.isActive === true && timerData.isActive === false) {
              console.log('Timer completion detected for device:', deviceId);
              
              // If we have both states, we can calculate the actual duration that elapsed
              const elapsedDuration = previousState.remainingSeconds;
              
              // Dispatch a custom event with accurate duration
              const timerCompletedEvent = new CustomEvent('timerCompleted', {
                detail: {
                  deviceId,
                  deviceName: timerData.label || 'TV Device',
                  duration: elapsedDuration
                }
              });
              
              window.dispatchEvent(timerCompletedEvent);
              console.log(`Timer completion adapter: Dispatched event for ${deviceId} with duration ${elapsedDuration}s`);
            }
            
            // Detect timer extension: remaining seconds increased while active
            if (previousState.isActive && timerData.isActive && 
                timerData.remainingSeconds > previousState.remainingSeconds) {
              console.log('Timer extension detected for device:', deviceId);
              // Could dispatch a timer extension event here if needed
            }
          }
        }
      } catch (error) {
        console.error('Error in timer completion adapter:', error);
      }
    };

    // This handler will be triggered whenever localStorage changes
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key && event.key.includes('tv-timer-')) {
        try {
          // Parse the new timer data
          const newData = event.newValue ? JSON.parse(event.newValue) : null;
          const oldData = event.oldValue ? JSON.parse(event.oldValue) : null;
          
          // Extract device info from the storage key
          const deviceId = event.key.replace('tv-timer-', '');
          
          // Check if this timer just completed
          if (newData && oldData && 
              oldData.isActive === true && 
              newData.isActive === false) {
            
            // The duration is the remaining seconds from the old state
            // This represents how much time was actually used
            const duration = oldData.remainingSeconds;
            const deviceName = newData.label || 'TV Device';
            
            // Dispatch a custom event for the analytics recorder to pick up
            const timerCompletedEvent = new CustomEvent('timerCompleted', {
              detail: {
                deviceId,
                deviceName,
                duration
              }
            });
            
            window.dispatchEvent(timerCompletedEvent);
            console.log('Timer completion detected and event dispatched for', deviceName, 'with duration', duration);
          }
        } catch (error) {
          console.error('Error processing timer completion:', error);
        }
      }
    };

    // Poll localStorage to check for timer completions since storage event
    // doesn't fire in the same window
    const pollInterval = setInterval(checkTimerCompletions, 1000);
    
    // For cross-window/tab support
    window.addEventListener('storage', handleStorageChange);
    
    // Initial check to get current state
    checkTimerCompletions();
    
    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return null;
};
