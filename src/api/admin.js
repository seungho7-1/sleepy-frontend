import api from './index';

export const adminApi = {
  getDashboard: () => 
    api.get(`/admin/dashboard`),
};
