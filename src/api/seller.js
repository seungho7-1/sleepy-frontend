import api from './index';

export const sellerApi = {
  apply: (data) =>
    api.post(`/sellers/apply`, data),
};
