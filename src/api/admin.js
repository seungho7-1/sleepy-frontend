import api from './index';

export const adminApi = {
  getDashboard: () => 
    api.get(`/admin/dashboard`),
  getApplications: () =>
    api.get(`/admin/applications`),
  approveApplication: (id) =>
    api.post(`/admin/applications/${id}/approve`),
  rejectApplication: (id, reason) =>
    api.post(`/admin/applications/${id}/reject`, { reason }),
};
