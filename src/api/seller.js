import api from './index';

export const sellerApi = {
  apply: (data) =>
    api.post(`/seller/apply`, data),
  getLatest: () =>
    api.get(`/seller/latest`),
};
