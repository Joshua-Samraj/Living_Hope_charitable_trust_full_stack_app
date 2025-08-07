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
      // Get admin data from localStorage for authentication
      const adminData = localStorage.getItem('admin');
      if (!adminData) {
        throw new Error('Authentication required');
      }
      console.log("Login", adminData)
      
      // Parse admin data and create authorization header
      const admin = JSON.parse(adminData);
      const token = btoa(JSON.stringify({ id: admin.id }));
      
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
      
      // const response = await api.get('/volunteers', config);
      const response = await api.get('/volunteers');
      return response.data;
    } catch (error) {
      console.error('Error fetching volunteers:', error);
      throw error;
    }
  },

  // Get volunteer statistics (admin only)
  getVolunteerStats: async (): Promise<any> => {
    try {
      const adminData = localStorage.getItem('admin');
      if (!adminData) {
        throw new Error('Authentication required');
      }
      const admin = JSON.parse(adminData);
      const token = btoa(JSON.stringify({ id: admin.id }));
      
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
      
      // const response = await api.get('/volunteers/stats', config);
      const response = await api.get('/volunteers/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching volunteer stats:', error);
      throw error;
    }
  },

  deleteVolunteer: async (id: string) => {
  const response = await api.delete(`/volunteers/${id}`);
  return response.data;
},
};

