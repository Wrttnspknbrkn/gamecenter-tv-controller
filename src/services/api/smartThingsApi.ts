
import { toast } from "sonner";

const API_BASE_URL = "https://api.smartthings.com/v1";

// Default token for development - will be updated if user provides a custom token
let CURRENT_TOKEN = "604273c0-eff1-4a09-a1c1-ff1f4223aceb";

// Initialize the token from localStorage on load
(() => {
  const storedToken = localStorage.getItem('smartthings_token');
  if (storedToken) {
    CURRENT_TOKEN = storedToken;
  }
})();

// Get the current token (stored in memory or from localStorage)
const getAccessToken = () => {
  return CURRENT_TOKEN;
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
    // Store in localStorage
    localStorage.setItem('smartthings_token', token);
    
    // Update the in-memory token for immediate use
    CURRENT_TOKEN = token;
    
    toast.success("API token updated successfully");
  } else {
    toast.error("Invalid API token");
  }
}
