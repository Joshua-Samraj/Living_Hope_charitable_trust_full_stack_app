import axios from 'axios';

// Use environment variables for API URL configuration
const API_URL = import.meta.env.VITE_API_URL || 'https://living-hope-charitable-trust-full-stack.onrender.com/api';

// Log the API URL in non-production environments for debugging
if (import.meta.env.DEV) {
  console.log('API URL:', API_URL);
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable sending cookies in cross-origin requests
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log API errors in development environment
    if (import.meta.env.DEV) {
      console.error('API Error:', error);
    }
    return Promise.reject(error);
  }
);

export default api;