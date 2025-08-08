import api from './api';
import { GalleryImage } from '../data/galleryData';

export const galleryService = {
  // Get all gallery images
  getAllImages: async (): Promise<GalleryImage[]> => {
    try {
      const response = await api.get('/gallery');
      const data = response.data;
      
      // Fast path for array data
      if (Array.isArray(data)) {
        return data;
      }
      
      // Handle non-array responses efficiently
      if (data && typeof data === 'object') {
        // Try to find an array property in the response
        const possibleArrayProps = ['data', 'images', 'items', 'results'];
        
        for (const prop of possibleArrayProps) {
          if (data[prop] && Array.isArray(data[prop])) {
            return data[prop];
          }
        }
        
        // Single object to array conversion
        if (data.title && data.category) {
          return [data];
        }
      }
      
      console.warn('Gallery API returned unexpected format:', data);
      return [];
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

  // Create a new gallery image
  createImage: async (imageData: Omit<GalleryImage, '_id'>): Promise<GalleryImage> => {
    try {
      const response = await api.post('/gallery', imageData);
      return response.data;
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
};