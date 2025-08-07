import api from './api';

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
      
      const response = await api.get('/donations', config);
      return response.data;
    } catch (error) {
      console.error('Error fetching donations:', error);
      throw error;
    }
  },
};

export { donationService, Donation };

