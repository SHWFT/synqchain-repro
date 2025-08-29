// API Client for SynqChain
import { config } from './config.js';

const API_BASE = config.API_BASE_URL;

export async function api(path, { method = 'GET', body, headers } = {}) {
  const requestConfig = {
    method,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(headers || {})
    }
  };

  if (body) {
    requestConfig.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE}${path}`, requestConfig);
  
  if (!response.ok) {
    try {
      const errorData = await response.json();
      // Create structured error with API response
      const error = new Error(errorData.message || `HTTP ${response.status}`);
      error.code = errorData.code;
      error.details = errorData.details;
      error.status = response.status;
      throw error;
    } catch (parseError) {
      // Fallback for non-JSON responses
      const errorText = await response.text();
      const error = new Error(`${response.status} ${errorText}`);
      error.status = response.status;
      throw error;
    }
  }

  // Handle 204 No Content responses
  if (response.status === 204) {
    return null;
  }

  return response.json();
}

// Special function for file uploads
export async function uploadFile(path, formData) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    credentials: 'include',
    body: formData // Don't set Content-Type for FormData
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`${response.status} ${errorText}`);
  }

  return response.json();
}
