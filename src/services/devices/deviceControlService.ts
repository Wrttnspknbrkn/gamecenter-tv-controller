
import { fetchWithAuth } from "../api/smartThingsApi";
import { toast } from "sonner";
import { DeviceCommand } from "../types/smartThingsTypes";

/**
 * Controls a device with the specified command
 */
export async function controlDevice(deviceId: string, command: DeviceCommand): Promise<void> {
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
    case "gameMode":
      capability = "custom.pictureMode";
      commandName = "setPictureMode";
      args = ["GAME"];
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

/**
 * Powers on a TV, sets input source and creates a timer in one operation
 */
export async function setupTVForCustomer(
  deviceId: string, 
  inputSource: string, 
  useGameMode: boolean = false, 
  timerMinutes: number = 60
): Promise<boolean> {
  try {
    // Step 1: Power on the TV
    await controlDevice(deviceId, "on");
    
    // Small delay to ensure TV is ready for next commands
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Step 2: Set input source if provided
    if (inputSource) {
      await controlDevice(deviceId, `input:${inputSource}`);
    }
    
    // Step 3: Set game mode if requested
    if (useGameMode) {
      await controlDevice(deviceId, "gameMode");
    }
    
    toast.success(`TV setup complete for new customer`);
    return true;
  } catch (error) {
    console.error("Failed to setup TV:", error);
    toast.error("Setup failed. Please try again.");
    return false;
  }
}
