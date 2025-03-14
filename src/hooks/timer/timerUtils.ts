
/**
 * Utility functions for timer management
 */

/**
 * Format remaining time as MM:SS
 */
export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/**
 * Calculate the end time based on the current time and duration in seconds
 */
export const calculateEndTime = (durationSeconds: number): number => {
  return Date.now() + durationSeconds * 1000;
};

/**
 * Calculate remaining seconds based on end time
 */
export const calculateRemainingSeconds = (endTime: number): number => {
  return Math.max(0, Math.floor((endTime - Date.now()) / 1000));
};
