import api from './index';

export const sellerApi = {
  apply: (data) =>
    api.post(`/seller/apply`, data),
  verifyBusinessNumber: (businessNumber) =>
    api.post(`/seller/verify-business-number`, { businessNumber }),
  getLatest: () =>
    api.get(`/seller/latest`),
};
