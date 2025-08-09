import api from './api';
import { isAuthenticated, createAuthConfig } from '../utils/authUtils';

interface Donation {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  amount: number;
  frequency: 'one-time' | 'monthly' | 'yearly';
  categories: string[];
  createdAt: string;
}

const donationService = {
  getAllDonations: async (): Promise<Donation[]> => {
    try {
      // Check if user is authenticated
      if (!isAuthenticated()) {
        throw new Error('Authentication required');
      }
      
      // Get auth config with Basic Authentication headers
      const config = createAuthConfig();
      
      // Fetch donations with auth headers
      const response = await api.get('/donations', config);
      return response.data;
    } catch (error) {
      console.error('Error fetching donations:', error);
      throw error;
    }
  },
};

export { donationService};

