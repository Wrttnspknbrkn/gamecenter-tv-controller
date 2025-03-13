
import { fetchWithAuth } from "../api/smartThingsApi";
import { DeviceStatus, TvDevice, Device } from "../types/smartThingsTypes";

/**
 * Fetches the status of a specific device
 */
export async function getDeviceStatus(deviceId: string): Promise<DeviceStatus> {
  return fetchWithAuth(`/devices/${deviceId}/status`);
}

/**
 * Extracts supported input sources from device status
 */
function extractSupportedInputSources(status: DeviceStatus): string[] | undefined {
  // Try to get sources from standard path
  if (status.components.main?.mediaInputSource?.supportedInputSources?.value) {
    return status.components.main.mediaInputSource.supportedInputSources.value;
  } 
  
  // Try alternative path for Samsung TVs
  if (status.components.main?.samsungvd) {
    const samsungvd = status.components.main.samsungvd;
    
    if (samsungvd.mediaInputSource) {
      const mediaInputSource = samsungvd.mediaInputSource;
      
      // Check if supportedInputSourcesMap exists with safe access
      if (mediaInputSource["supportedInputSourcesMap"]?.value) {
        const sourceMap = mediaInputSource["supportedInputSourcesMap"].value;
        if (Array.isArray(sourceMap)) {
          return sourceMap.map((src: any) => src.name);
        }
      }
    }
  }
  
  return undefined;
}

/**
 * Processes raw device data into a structured TV device with status
 */
export async function processDeviceWithStatus(device: Device): Promise<TvDevice> {
  try {
    const status = await getDeviceStatus(device.deviceId);
    
    // Extract the relevant status information
    const switchStatus = status.components.main?.switch?.switch?.value || "unknown";
    const inputSource = status.components.main?.mediaInputSource?.inputSource?.value;
    const supportedInputSources = extractSupportedInputSources(status);
    
    return {
      id: device.deviceId,
      name: device.name,
      label: device.label || device.name,
      status: {
        switch: switchStatus,
        inputSource,
        supportedInputSources
      }
    };
  } catch (error) {
    console.error(`Error fetching status for device ${device.deviceId}:`, error);
    return {
      id: device.deviceId,
      name: device.name,
      label: device.label || device.name,
      status: {
        switch: "unknown"
      }
    };
  }
}
