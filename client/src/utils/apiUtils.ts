/**
 * Utility functions for API operations
 */

import api from '../services/api';

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