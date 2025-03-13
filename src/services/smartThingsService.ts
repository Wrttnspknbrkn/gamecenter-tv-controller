
import { toast } from "sonner";
import { TvDevice, Device } from "./types/smartThingsTypes";
import { fetchWithAuth } from "./api/smartThingsApi";
import { processDeviceWithStatus } from "./devices/deviceStatusService";
import { controlDevice as sendDeviceCommand } from "./devices/deviceControlService";

/**
 * Gets all TV devices with their status information
 */
export async function getDevices(): Promise<TvDevice[]> {
  try {
    const { items } = await fetchWithAuth("/devices");
    
    // Filter to only include Samsung TVs
    const tvDevices = items.filter((device: Device) => {
      return device.components.some(component => 
        component.capabilities.some(cap => 
          cap.id === "switch" || cap.id === "mediaInputSource"));
    });
    
    // Process each device to get status information
    const devicePromises = tvDevices.map(processDeviceWithStatus);
    
    return await Promise.all(devicePromises);
  } catch (error) {
    console.error("Error fetching devices:", error);
    toast.error("Failed to fetch TV devices");
    throw error;
  }
}

// Re-export types and functions for backward compatibility
export type { TvDevice } from "./types/smartThingsTypes";
export { controlDevice } from "./devices/deviceControlService";
export { getDeviceStatus } from "./devices/deviceStatusService";
