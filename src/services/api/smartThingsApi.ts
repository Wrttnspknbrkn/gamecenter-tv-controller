import { toast } from "sonner";

const API_BASE_URL = "https://api.smartthings.com/v1";

// Default token for development
let DEFAULT_TOKEN = "604273c0-eff1-4a09-a1c1-ff1f4223aceb";

// Get token from localStorage or use default
const getAccessToken = () => {
  // First check for user-provided token
  const userToken = localStorage.getItem('smartthings_token');
  if (userToken) {
    return userToken;
  }
  
  // Otherwise use the default token
  return DEFAULT_TOKEN;
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
    // Update the default token so it's used for new sessions too
    DEFAULT_TOKEN = token;
    toast.success("API token updated successfully");
  } else {
    toast.error("Invalid API token");
  }
}
