
import { useEffect } from 'react';

/**
 * DEVELOPMENT ONLY: This hook simulates timer completion events for testing
 * It should be removed in production and replaced with actual timer event integration
 */
export const useTimerEventSimulator = () => {
  useEffect(() => {
    // DEBUG function to simulate a timer completion for analytics testing
    const simulateTimerCompletion = () => {
      const deviceIds = ['living-room-tv', 'bedroom-tv', 'kitchen-tv'];
      const deviceNames = ['Living Room TV', 'Bedroom TV', 'Kitchen TV'];
      const durations = [60, 120, 180]; // 1, 2, 3 minutes in seconds
      
      // Pick random values
      const randomIndex = Math.floor(Math.random() * deviceIds.length);
      const randomDuration = durations[randomIndex];
      
      const timerCompletedEvent = new CustomEvent('timerCompleted', {
        detail: {
          deviceId: deviceIds[randomIndex],
          deviceName: deviceNames[randomIndex],
          duration: randomDuration
        }
      });
      
      window.dispatchEvent(timerCompletedEvent);
      console.log(`DEBUG: Simulated timer completion for ${deviceNames[randomIndex]} with ${randomDuration} seconds duration`);
    };

    // Add a debug button to the UI for testing
    const addDebugButton = () => {
      if (process.env.NODE_ENV !== 'production') {
        const existingButton = document.getElementById('simulate-timer-button');
        if (!existingButton) {
          const button = document.createElement('button');
          button.id = 'simulate-timer-button';
          button.textContent = 'Simulate Timer Completion';
          button.style.position = 'fixed';
          button.style.bottom = '10px';
          button.style.right = '10px';
          button.style.zIndex = '9999';
          button.style.padding = '8px';
          button.style.background = '#4f46e5';
          button.style.color = 'white';
          button.style.borderRadius = '4px';
          button.style.cursor = 'pointer';
          button.style.fontSize = '12px';
          
          button.addEventListener('click', simulateTimerCompletion);
          document.body.appendChild(button);
        }
      }
    };

    // Call once to add button
    addDebugButton();

    return () => {
      // Remove debug button on cleanup
      const debugButton = document.getElementById('simulate-timer-button');
      if (debugButton) {
        debugButton.removeEventListener('click', simulateTimerCompletion);
        debugButton.remove();
      }
    };
  }, []);

  return null;
};
