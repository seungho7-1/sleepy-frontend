import api from './index';

export const inquiryApi = {
  create: (data) => api.post('/inquiries', data),
  getMyInquiries: () => api.get('/inquiries/my'),
};
