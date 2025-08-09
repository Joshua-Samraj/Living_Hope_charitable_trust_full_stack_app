/**
 * Utility functions for handling images, including base64 conversions
 */

/**
 * Checks if a URL is a base64 data URL
 * @param url The URL to check
 * @returns True if the URL is a base64 data URL
 */
export const isBase64Image = (url: string): boolean => {
  return url?.startsWith('data:image');
};

/**
 * Ensures a URL is valid for display
 * This function handles both regular URLs and base64 data URLs
 * @param url The URL or base64 string
 * @returns A valid URL for display
 */
export const base64ToUrl = (url: string): string => {
  // If it's already a valid URL or base64 data URL, return it as is
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('data:')) {
    return url;
  }
  // If it's a base64 string without the data URL prefix, add it
  if (url.match(/^[A-Za-z0-9+/=]+$/)) {
    return `data:image/jpeg;base64,${url}`;
  }
  return url;
};