import axios, { AxiosError } from 'axios';

/**
 * Standard API error response structure
 */
export interface ApiErrorResponse {
  message: string;
  status?: number;
  details?: any;
}

/**
 * Formats API errors into a standardized structure
 * @param error - The error object from axios
 * @returns A standardized error object
 */
export const formatApiError = (error: unknown): ApiErrorResponse => {
  // Handle Axios errors
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<any>;
    
    // Handle server response errors
    if (axiosError.response) {
      const { status, data } = axiosError.response;
      
      // If the server returned a structured error
      if (data && typeof data === 'object') {
        return {
          message: data.message || 'An error occurred with the server response',
          status,
          details: data
        };
      }
      
      // Server responded but without structured data
      return {
        message: getDefaultMessageForStatus(status),
        status
      };
    }
    
    // Handle network errors
    if (axiosError.request && !axiosError.response) {
      return {
        message: 'Network error. Please check your connection and try again.',
        status: 0
      };
    }
  }
  
  // Handle non-Axios errors
  return {
    message: error instanceof Error ? error.message : 'An unknown error occurred',
  };
};

/**
 * Get a default message for HTTP status codes
 */
const getDefaultMessageForStatus = (status?: number): string => {
  if (!status) return 'An unknown error occurred';
  
  switch (status) {
    case 400:
      return 'Bad request. Please check your input.';
    case 401:
      return 'You are not authorized. Please log in and try again.';
    case 403:
      return 'You do not have permission to access this resource.';
    case 404:
      return 'The requested resource was not found.';
    case 500:
      return 'Server error. Please try again later.';
    default:
      return `Error ${status}. Please try again later.`;
  }
};

/**
 * Handles API errors in a consistent way across the application
 * @param error - The error object from axios
 * @param fallbackMessage - Optional fallback message
 * @returns The formatted error message
 */
export const handleApiError = (error: unknown, fallbackMessage = 'An error occurred'): string => {
  const formattedError = formatApiError(error);
  
  // Log detailed error in development
  if (import.meta.env.DEV) {
    console.error('API Error:', error);
    console.error('Formatted Error:', formattedError);
  }
  
  return formattedError.message || fallbackMessage;
};