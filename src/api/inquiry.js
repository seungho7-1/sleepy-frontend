import api from './index';

export const inquiryApi = {
  create: (data) => api.post('/inquiries', data),
  getMyInquiries: () => api.get('/inquiries/me'),
  getAdminInquiries: () => api.get('/inquiries/admin'),
  replyInquiry: (id, reply) => api.post(`/inquiries/admin/${id}/reply`, { reply }),
};
