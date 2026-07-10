import api from './index';

export const adminApi = {
  getDashboard: () => 
    api.get(`/admin/dashboard`),
  getApplications: () =>
    api.get(`/admin/sellers/applications`),
  approveApplication: (id) =>
    api.post(`/admin/sellers/applications/${id}/approve`),
  rejectApplication: (id) =>
    api.post(`/admin/sellers/applications/${id}/reject`),
};
