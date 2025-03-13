
import { toast } from "sonner";

const API_BASE_URL = "https://api.smartthings.com/v1";
const ACCESS_TOKEN = "1d48f094-9e03-4ac4-898e-bc9a628240d0";

interface Device {
  deviceId: string;
  name: string;
  label: string;
  components: Array<{
    id: string;
    capabilities: Array<{
      id: string;
      version: number;
    }>;
  }>;
}

interface DeviceStatus {
  components: {
    [key: string]: {
      [capability: string]: {
        [attribute: string]: {
          value: any;
          timestamp?: string;
          unit?: string;
        };
      };
    };
  };
}

export interface TvDevice {
  id: string;
  name: string;
  label: string;
  status: {
    switch: string;
    inputSource?: string;
    supportedInputSources?: string[];
  };
}

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers = {
    "Authorization": `Bearer ${ACCESS_TOKEN}`,
    "Content-Type": "application/json",
    ...options.headers
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error (${response.status}): ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("SmartThings API error:", error);
    toast.error("Failed to communicate with SmartThings API");
    throw error;
  }
}

export async function getDevices(): Promise<TvDevice[]> {
  try {
    const { items } = await fetchWithAuth("/devices");
    
    // Filter to only include Samsung TVs
    const tvDevices = items.filter((device: Device) => {
      return device.components.some(component => 
        component.capabilities.some(cap => 
          cap.id === "switch" || cap.id === "mediaInputSource"));
    });
    
    // We need to fetch status for each device
    const devicePromises = tvDevices.map(async (device: Device) => {
      try {
        const status = await getDeviceStatus(device.deviceId);
        
        // Extract the relevant status information
        const switchStatus = status.components.main?.switch?.switch?.value || "unknown";
        const inputSource = status.components.main?.mediaInputSource?.inputSource?.value;
        
        // Fix: Safely access supportedInputSources from multiple possible paths
        let supportedInputSources;
        
        if (status.components.main?.mediaInputSource?.supportedInputSources?.value) {
          supportedInputSources = status.components.main.mediaInputSource.supportedInputSources.value;
        } else if (status.components.main?.samsungvd) {
          // First check if samsungvd exists
          const samsungvd = status.components.main.samsungvd;
          // Then check if mediaInputSource exists within samsungvd
          if (samsungvd.mediaInputSource) {
            // Finally check if supportedInputSourcesMap exists and has a value property
            const sourceMap = samsungvd.mediaInputSource.supportedInputSourcesMap?.value;
            if (Array.isArray(sourceMap)) {
              supportedInputSources = sourceMap.map((src: any) => src.name);
            }
          }
        }
        
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
    });
    
    return await Promise.all(devicePromises);
  } catch (error) {
    console.error("Error fetching devices:", error);
    toast.error("Failed to fetch TV devices");
    throw error;
  }
}

export async function getDeviceStatus(deviceId: string): Promise<DeviceStatus> {
  return fetchWithAuth(`/devices/${deviceId}/status`);
}

export async function controlDevice(deviceId: string, command: string): Promise<void> {
  let componentId = "main";
  let capability = "switch";
  let commandName = command;
  let args: any[] = [];

  // Configure the command based on input
  switch (command) {
    case "on":
    case "off":
      capability = "switch";
      commandName = command;
      break;
    case "mute":
      capability = "audioMute";
      commandName = "mute";
      break;
    case "unmute":
      capability = "audioMute";
      commandName = "unmute";
      break;
    case "volumeUp":
      capability = "audioVolume";
      commandName = "volumeUp";
      break;
    case "volumeDown":
      capability = "audioVolume";
      commandName = "volumeDown";
      break;
    case "setVolume":
      capability = "audioVolume";
      commandName = "setVolume";
      args = [10]; // Default volume level
      break;
    default:
      // If it's an input source change
      if (command.startsWith("input:")) {
        capability = "mediaInputSource";
        commandName = "setInputSource";
        args = [command.replace("input:", "")];
      }
      break;
  }

  try {
    const response = await fetchWithAuth(`/devices/${deviceId}/commands`, {
      method: "POST",
      body: JSON.stringify({
        commands: [
          {
            component: componentId,
            capability,
            command: commandName,
            arguments: args
          }
        ]
      })
    });
    
    toast.success(`TV command sent: ${commandName}`);
    return response;
  } catch (error) {
    console.error("Error controlling device:", error);
    toast.error(`Failed to send command: ${commandName}`);
    throw error;
  }
}
