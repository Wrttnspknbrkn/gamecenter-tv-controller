
import { fetchWithAuth } from "../api/smartThingsApi";
import { toast } from "sonner";
import { DeviceCommand, TVSetupConfig } from "../types/smartThingsTypes";

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
    // Source controls
    case "home":
      capability = "mediaInputSource";
      commandName = "setInputSource";
      args = ["digitalTv"]; // Many TVs use digitalTv for home screen
      break;
    case "digitalTV":
      capability = "mediaInputSource";
      commandName = "setInputSource";
      args = ["digitalTv"];
      break;
    case "gameMode":
      capability = "mediaInputSource";
      commandName = "setInputSource";
      args = ["HDMI1"]; // Typically game consoles are on HDMI1
      break;
    // Default for other input sources
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
 * Powers on a TV, sets appropriate HDMI source if game mode is enabled and creates a timer
 */
export async function setupTVForCustomer(
  deviceId: string, 
  config: TVSetupConfig
): Promise<boolean> {
  try {
    // Step 1: Power on the TV
    await controlDevice(deviceId, "on");
    
    // Increased delay to ensure TV is fully ready for next commands (was 3000ms)
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Step 2: If game mode is enabled, set the TV to HDMI1
    if (config.useGameMode) {
      // Set input to HDMI1 for PlayStation
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
