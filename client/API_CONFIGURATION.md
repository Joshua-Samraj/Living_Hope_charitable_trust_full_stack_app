# API Configuration Guide

## Overview

This document explains how the API configuration works in this project and how to properly set it up for different environments (development, production, etc.).

## Environment Configuration

The project uses environment variables to configure the API URL based on the current environment. This approach allows for seamless switching between development and production APIs without code changes.

### Environment Files

The following environment files are used:

- `.env.development` - Used during local development
- `.env.production` - Used for production builds

### Environment Variables

The main environment variable used for API configuration is:

- `VITE_API_URL` - The base URL for API requests

## How It Works

1. During development (`npm run dev`), the application uses `.env.development` values
2. During production build (`npm run build`), the application uses `.env.production` values
3. The `api.ts` service automatically selects the appropriate URL based on the current environment

## API Service

The API service (`src/services/api.ts`) is configured to:

- Use the appropriate API URL based on the environment
- Include proper error handling
- Log API URLs and errors in development mode only

## Modifying API Configuration

### For Local Development

If you need to use a different API during development:

1. Edit `.env.development` and update the `VITE_API_URL` value
2. Restart the development server

### For Production

If you need to change the production API URL:

1. Edit `.env.production` and update the `VITE_API_URL` value
2. Rebuild the application

## API Utilities

The project includes several API utilities to improve reliability and error handling:

- `apiErrorHandler.ts` - Standardizes error handling across the application
- `apiUtils.ts` - Provides retry functionality and connection testing

## Troubleshooting

If you encounter API connection issues:

1. Check that the API server is running
2. Verify that the correct API URL is set in the appropriate `.env` file
3. Use the `testApiConnection()` function from `apiUtils.ts` to test connectivity
4. Check browser console for detailed error messages (in development mode)

## Best Practices

1. Never hardcode API URLs in components or services
2. Always use the `api` instance from `src/services/api.ts` for API requests
3. Use the `makeRequest()` function from `apiUtils.ts` for important API calls that should retry on failure
4. Handle API errors appropriately using the `handleApiError()` function