import api from './api';
import { isAuthenticated, createAuthConfig } from '../utils/authUtils';

export interface Volunteer {
  _id?: string;
  name: string;
  age: number;
  phone: string;
  location: string;
  aadhaarNumber: string;
  email: string;
  disclaimerAccepted: boolean;
  createdAt?: string;
  updatedAt?: string;
}



export const volunteerService = {
  // Submit volunteer application
  submitApplication: async (volunteerData: Omit<Volunteer, '_id'>): Promise<Volunteer> => {
    try {
      const response = await api.post('/volunteers', volunteerData);
      return response.data.volunteer;
    } catch (error) {
      console.error('Error submitting volunteer application:', error);
      throw error;
    }
  },

  // Get all volunteers (admin only)
  getAllVolunteers: async (): Promise<Volunteer[]> => {
    try {
      // Check if user is authenticated
      if (!isAuthenticated()) {
        throw new Error('Authentication required');
      }
      
      // Get auth config with Basic Authentication headers
      const config = createAuthConfig();
      
      // Fetch volunteers with auth headers
      const response = await api.get('/volunteers', config);
      return response.data;
    } catch (error) {
      console.error('Error fetching volunteers:', error);
      throw error;
    }
  },

  // Get volunteer statistics (admin only)
  getVolunteerStats: async (): Promise<any> => {
    try {
      // Check if user is authenticated
      if (!isAuthenticated()) {
        throw new Error('Authentication required');
      }
      
      // Get auth config with Basic Authentication headers
      const config = createAuthConfig();
      
      // Fetch volunteer stats with auth headers
      const response = await api.get('/volunteers/stats', config);
      return response.data;
    } catch (error) {
      console.error('Error fetching volunteer stats:', error);
      throw error;
    }
  },

  deleteVolunteer: async (id: string) => {
    try {
      // Check if user is authenticated
      if (!isAuthenticated()) {
        throw new Error('Authentication required');
      }
      
      // Get auth config with Basic Authentication headers
      const config = createAuthConfig();
      
      // Delete volunteer with auth headers
      const response = await api.delete(`/volunteers/${id}`, config);
      return response.data;
    } catch (error) {
      console.error('Error deleting volunteer:', error);
      throw error;
    }
  },
};

