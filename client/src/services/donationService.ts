import api from './api';

export interface Donation {
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
      const response = await api.get('/donations');
      return response.data;
    } catch (error) {
      console.error('Error fetching donations:', error);
      throw error;
    }
  },
};

export { donationService };
