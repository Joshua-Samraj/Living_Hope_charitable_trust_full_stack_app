import axios from 'axios';

// Use environment variables for API URL configuration
const API_URL = import.meta.env.VITE_API_URL || 'https://living-hope-charitable-trust-full-stack.onrender.com/api';

// Log the API URL for debugging (always log in production to help debug)
console.log('API URL:', API_URL);
console.log('Environment:', import.meta.env.MODE);
console.log('Is Dev:', import.meta.env.DEV);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable sending cookies in cross-origin requests
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`
    });
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      status: response.status,
      url: response.config.url,
      dataType: typeof response.data,
      isArray: Array.isArray(response.data)
    });
    return response;
  },
  (error) => {
    console.error('API Error Details:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      responseData: error.response?.data,
      responseType: typeof error.response?.data
    });
    
    // If we get HTML instead of JSON, it means we're hitting the wrong endpoint
    if (error.response?.data && typeof error.response.data === 'string' && error.response.data.includes('<!doctype html>')) {
      console.error('CRITICAL: API returned HTML instead of JSON. This usually means:');
      console.error('1. The API endpoint does not exist');
      console.error('2. The request is being redirected to the frontend');
      console.error('3. There is a CORS or routing issue');
      console.error('Full URL attempted:', `${error.config?.baseURL}${error.config?.url}`);
    }
    
    return Promise.reject(error);
  }
);

export default api;