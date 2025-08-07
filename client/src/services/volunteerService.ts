import api from './api';

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
  // Submit volunteer application (open/public)
  submitApplication: async (volunteerData: Omit<Volunteer, '_id'>): Promise<Volunteer> => {
    try {
      const response = await api.post('/volunteers', volunteerData);
      return response.data.volunteer;
    } catch (error) {
      console.error('Error submitting volunteer application:', error);
      throw error;
    }
  },

  // Get all volunteers (no auth required)
  getAllVolunteers: async (): Promise<Volunteer[]> => {
    try {
      const response = await api.get('/volunteers');
      return response.data;
    } catch (error) {
      console.error('Error fetching volunteers:', error);
      throw error;
    }
  },

  // Get volunteer statistics (no auth required)
  getVolunteerStats: async (): Promise<any> => {
    try {
      const response = await api.get('/volunteers/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching volunteer stats:', error);
      throw error;
    }
  },

  // Delete a volunteer (no auth required - risky!)
  deleteVolunteer: async (id: string) => {
    try {
      const response = await api.delete(`/volunteers/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting volunteer:', error);
      throw error;
    }
  },
};
