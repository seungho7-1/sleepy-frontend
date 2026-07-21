import api from './index';

export const authApi = {
  login: (data) => 
    api.post(`/auth/login`, data),

  signup: (data) => 
    api.post(`/auth/signup`, data),

  oauth2Onboarding: (data) =>
    api.post(`/auth/oauth2/onboarding`, data),

  withdraw: () =>
    api.delete(`/auth/withdraw`),

  me: () =>
    api.get(`/auth/me`),

  updateProfile: (data) =>
    api.put(`/auth/me`, data),

  checkUsername: (username) =>
    api.get(`/auth/check-username?username=${username}`),

  checkEmail: (email) =>
    api.get(`/auth/check-email?email=${email}`),

  checkNickname: (nickname) =>
    api.get(`/auth/check-nickname?nickname=${nickname}`),

  sendPasswordResetCode: (data) =>
    api.post(`/auth/password/send-code`, data),

  verifyPasswordResetCode: (data) =>
    api.post(`/auth/password/verify-code`, data),

  resetPassword: (data) =>
    api.post(`/auth/password/reset`, data),
};
