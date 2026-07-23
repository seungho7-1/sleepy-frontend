import api from './index';

export const adminApi = {
  getDashboardStats: () => 
    api.get(`/admin/dashboard/stats`),
  getOldDashboard: () => 
    api.get(`/admin/dashboard`),
  
  // Sellers
  getApplications: () =>
    api.get(`/admin/sellers/applications`),
  approveApplication: (id) =>
    api.post(`/admin/sellers/applications/${id}/approve`),
  rejectApplication: (id, reason) =>
    api.post(`/admin/sellers/applications/${id}/reject`, { reason }),
    
  // Members
  getMembers: () =>
    api.get(`/admin/members`),
  suspendMember: (id) =>
    api.post(`/admin/members/${id}/suspend`),
  unsuspendMember: (id) =>
    api.post(`/admin/members/${id}/unsuspend`),
    
  // Products
  getProducts: () =>
    api.get(`/admin/products`),
  hideProduct: (id) =>
    api.post(`/admin/products/${id}/hide`),
  unhideProduct: (id) =>
    api.post(`/admin/products/${id}/unhide`),
    
  // Reports
  getReports: () =>
    api.get(`/admin/reports`),
  resolveReport: (id, action) =>
    api.post(`/admin/reports/${id}/resolve`, { action }),
  // Inquiries
  getInquiries: () =>
    api.get(`/inquiries/admin`),
  replyToInquiry: (id, reply) =>
    api.post(`/inquiries/admin/${id}/reply`, { reply }),
};
