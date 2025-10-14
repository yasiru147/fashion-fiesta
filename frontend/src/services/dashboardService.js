import axios from 'axios';

export const dashboardService = {
  getDashboardStats: async () => {
    const response = await axios.get('/api/dashboard/stats');
    return response.data;
  }
};