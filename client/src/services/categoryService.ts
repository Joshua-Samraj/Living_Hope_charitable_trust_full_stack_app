import api from './api';
import { Category } from '../data/categories';

export const categoryService = {
  // Get all categories
  getAllCategories: async (includeProjectCount: boolean = false): Promise<Category[]> => {
    try {
      const response = await api.get('/categories', {
        params: { includeProjectCount }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  // Get a category by keyword
  getCategoryByKeyword: async (keyword: string, includeProjects: boolean = false): Promise<Category> => {
    try {
      const response = await api.get(`/categories/${keyword}`, {
        params: { includeProjects }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching category with keyword ${keyword}:`, error);
      throw error;
    }
  },

  // Create a new category
  createCategory: async (categoryData: Omit<Category, '_id'>): Promise<Category> => {
    try {
      const response = await api.post('/categories', categoryData);
      return response.data;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  },

  // Update a category
 updateCategory: async (id: string, data: Partial<Category>) => {
  try {
    const response = await api.put(`/categories/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Category update error:', error);
    throw error;
  }
},

  // Delete a category
  deleteCategory: async (_id: string): Promise<void> => {
    try {
      await api.delete(`/categories/${_id}`);
    } catch (error) {
      console.error(`Error deleting category with ID ${_id}:`, error);
      throw error;
    }
  },
};