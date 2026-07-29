import api from './index';

export const sellerApi = {
  apply: (data) =>
    api.post(`/seller/apply`, data),
  verifyBusinessNumber: (businessNumber, repName, startDate) =>
    api.post(`/seller/verify-business-number`, { businessNumber, repName, startDate }),
  getLatest: () =>
    api.get(`/seller/latest`),
};
