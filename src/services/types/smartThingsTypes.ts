
/**
 * Raw device data from SmartThings API
 */
export interface Device {
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

/**
 * Device status response from SmartThings API
 */
export interface DeviceStatus {
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

/**
 * Processed TV device with relevant status information
 */
export interface TvDevice {
  id: string;
  name: string;
  label: string;
  status: {
    switch: string;
    inputSource?: string;
    supportedInputSources?: string[];
    pictureMode?: string;
  };
}

/**
 * Command types for device control
 */
export type DeviceCommand = 
  | "on" 
  | "off" 
  | "mute" 
  | "unmute" 
  | "volumeUp" 
  | "volumeDown" 
  | "setVolume" 
  | "gameMode"
  | string; // For input source changes that start with "input:"

