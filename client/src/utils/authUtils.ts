import axios, { AxiosRequestConfig } from 'axios';

/**
 * Interface for admin data stored in localStorage
 */
export interface AdminData {
  id: string;
  username: string;
  password?: string; // Added password field
  message?: string;
}

/**
 * Gets the admin data from localStorage
 * @returns The admin data or null if not found
 */
export const getAdminData = (): AdminData | null => {
  console.log('Attempting to get admin data from localStorage');
  const adminData = localStorage.getItem('admin');
  console.log('Admin data exists in localStorage:', !!adminData);
  
  if (!adminData) return null;
  
  try {
    const parsedData = JSON.parse(adminData) as AdminData;
    console.log('Admin data parsed successfully:', { 
      id: parsedData.id,
      username: parsedData.username,
      hasPassword: !!parsedData.password
    });
    return parsedData;
  } catch (error) {
    console.error('Error parsing admin data:', error);
    return null;
  }
};

/**
 * Creates an axios config object with Basic Authentication headers
 * @param contentType Optional content type header (defaults to 'application/json')
 * @returns Axios config object with auth headers or empty object if no admin data
 */
export const createAuthConfig = (contentType = 'application/json'): AxiosRequestConfig => {
  console.log('Creating auth config with content type:', contentType);
  const adminData = getAdminData();
  
  if (!adminData) {
    console.log('No admin data found, returning empty config');
    return {};
  }
  
  // Get password from stored admin data
  const password = adminData.password || '';
  console.log('Password exists:', !!password);
  
  // Create Basic Auth header using username and password from admin data
  let basicAuthToken;
  try {
    // Standard browser API for base64 encoding
    basicAuthToken = btoa(`${adminData.username}:${password}`);
    console.log('Basic auth token created successfully');
  } catch (error) {
    console.error('Error creating basic auth token:', error);
    // Fallback implementation using manual base64 encoding
    // This is a simple implementation and not for production use
    const str = `${adminData.username}:${password}`;
    const base64 = window.btoa(str);
    basicAuthToken = base64;
    console.log('Used fallback method to create basic auth token');
  }
  
  const config = {
    headers: {
      'Content-Type': contentType,
      'Authorization': `Basic ${basicAuthToken}`
    }
  };
  
  console.log('Auth config created:', JSON.stringify({
    headers: {
      'Content-Type': config.headers['Content-Type'],
      'Authorization': config.headers['Authorization'] ? 'Basic [TOKEN]' : 'none'
    }
  }));
  
  return config;
};

/**
 * Checks if the user is authenticated
 * @returns True if authenticated, false otherwise
 */
export const isAuthenticated = (): boolean => {
  return getAdminData() !== null;
};

/**
 * Logs out the user by removing admin data from localStorage
 */
export const logout = (): void => {
  localStorage.removeItem('admin');
};