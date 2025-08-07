/**
 * Utility functions for API operations
 */

import api from '../services/api';
import { handleApiError } from './apiErrorHandler';

/**
 * Tests the connection to the API server
 * @returns Promise that resolves to a boolean indicating if the connection is successful
 */
export const testApiConnection = async (): Promise<{ success: boolean; message: string }> => {
  try {
    // Try to connect to the API health endpoint
    const response = await api.get('/health', { timeout: 5000 });
    return { 
      success: true, 
      message: `API connection successful. Server status: ${response.data.status || 'OK'}` 
    };
  } catch (error) {
    console.error('API connection test failed:', error);
    return { 
      success: false, 
      message: `API connection failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
};

/**
 * Configuration options for API requests
 */
interface RequestOptions {
  retries?: number;
  retryDelay?: number;
  showError?: boolean;
}

/**
 * Default request options
 */
const defaultOptions: RequestOptions = {
  retries: 2,
  retryDelay: 1000,
  showError: true,
};

/**
 * Makes an API request with retry functionality
 * @param requestFn - The API request function to execute
 * @param options - Request options including retry configuration
 * @returns Promise with the API response
 */
export const makeRequest = async <T>(
  requestFn: () => Promise<T>,
  options: RequestOptions = {}
): Promise<T> => {
  const { retries, retryDelay, showError } = { ...defaultOptions, ...options };
  let lastError: unknown;
  
  // Try the request with retries
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;
      
      // Log retry attempts in development
      if (import.meta.env.DEV) {
        console.log(`API request failed (attempt ${attempt + 1}/${retries + 1})`, error);
      }
      
      // Don't wait on the last attempt
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }
  
  // If we get here, all attempts failed
  if (showError) {
    const errorMessage = handleApiError(lastError);
    // You could integrate with a notification system here
    console.error(errorMessage);
  }
  
  throw lastError;
};

/**
 * Utility to create a cancelable request
 * @returns An object with the request function and a cancel function
 */
export const createCancelableRequest = <T>(requestFn: () => Promise<T>) => {
  const controller = new AbortController();
  
  const request = () => {
    // Add the signal to the request config
    return requestFn();
  };
  
  const cancel = () => {
    controller.abort();
  };
  
  return { request, cancel };
};