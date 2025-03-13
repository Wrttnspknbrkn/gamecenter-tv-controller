
import { toast } from "sonner";

const API_BASE_URL = "https://api.smartthings.com/v1";

// Get token from localStorage or use default (for development only)
const getAccessToken = () => {
  return localStorage.getItem('smartthings_token') || "1d48f094-9e03-4ac4-898e-bc9a628240d0";
};

/**
 * Base function for all API calls to SmartThings with authentication
 */
export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const ACCESS_TOKEN = getAccessToken();
  
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

// Function to set a new access token
export function setAccessToken(token: string): void {
  if (token && token.trim() !== "") {
    localStorage.setItem('smartthings_token', token);
    toast.success("API token updated successfully");
  } else {
    toast.error("Invalid API token");
  }
}
