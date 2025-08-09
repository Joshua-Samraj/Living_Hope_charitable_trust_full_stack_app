import api from './api';
import { GalleryImage } from '../data/galleryData';

export const galleryService = {
  // Get all gallery images
  getAllImages: async (): Promise<GalleryImage[]> => {
    try {
      const response = await api.get('/gallery');
      const data = response.data;
      
      // Ensure the response data is an array
      if (Array.isArray(data)) {
        return data;
      } else if (data && typeof data === 'object') {
        // In production, the API might return an object with a data property
        // that contains the actual array of images
        console.warn('Gallery API did not return an array, trying to extract array from object:', data);
        
        // Try to find an array property in the response
        const possibleArrayProps = ['data', 'images', 'items', 'results'];
        let foundArray = null;
        
        for (const prop of possibleArrayProps) {
          if (data[prop] && Array.isArray(data[prop])) {
            console.log(`Found array in data.${prop}`);
            foundArray = data[prop];
            break;
          }
        }
        
        if (foundArray) {
          return foundArray;
        } else {
          // If we can't find an array, try to convert the object to an array if it has gallery-like properties
          if (data.title && data.category) {
            console.log('Converting single gallery object to array');
            return [data];
          } else {
            console.error('Could not extract gallery array from data:', data);
            return []; // Return empty array instead of throwing error
          }
        }
      } else {
        console.error('Gallery API did not return an array or object:', data);
        return []; // Return empty array instead of throwing error
      }
    } catch (error) {
      console.error('Error fetching gallery images:', error);
      throw error;
    }
  },

  // Get gallery images by category
  getImagesByCategory: async (category: string): Promise<GalleryImage[]> => {
    try {
      const response = await api.get(`/gallery/category/${category}`);
      // Ensure the response data is an array
      if (Array.isArray(response.data)) {
        return response.data;
      } else {
        console.error(`Gallery API did not return an array for category ${category}:`, response.data);
        return []; // Return empty array instead of throwing error
      }
    } catch (error) {
      console.error(`Error fetching gallery images for category ${category}:`, error);
      throw error;
    }
  },

  // Get a gallery image by ID
  getImageById: async (id: string): Promise<GalleryImage> => {
    try {
      const response = await api.get(`/gallery/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching gallery image with ID ${id}:`, error);
      throw error;
    }
  },

  // Create new gallery images (supports multiple images)
  createImage: async (imageData: Omit<GalleryImage, '_id'>): Promise<GalleryImage | GalleryImage[]> => {
    try {
      const response = await api.post('/gallery', imageData);
      // Handle both single image and multiple images response
      if (response.data.images) {
        return response.data.images; // Multiple images
      }
      return response.data; // Single image (backward compatibility)
    } catch (error) {
      console.error('Error creating gallery image:', error);
      throw error;
    }
  },

  // Update a gallery image
  updateImage: async (id: string, imageData: Partial<GalleryImage>): Promise<GalleryImage> => {
    try {
      const response = await api.patch(`/gallery/${id}`, imageData);
      return response.data;
    } catch (error) {
      console.error(`Error updating gallery image with ID ${id}:`, error);
      throw error;
    }
  },

  // Delete a gallery image
  deleteImage: async (id: string): Promise<void> => {
    try {
      await api.delete(`/gallery/${id}`);
    } catch (error) {
      console.error(`Error deleting gallery image with ID ${id}:`, error);
      throw error;
    }
  },

  // Delete multiple gallery images
  deleteMultipleImages: async (imageIds: string[]): Promise<{ message: string; deletedCount: number; requestedCount: number }> => {
    try {
      const response = await api.delete('/gallery/bulk', {
        data: { imageIds }
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting multiple gallery images:', error);
      throw error;
    }
  },
};