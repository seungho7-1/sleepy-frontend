import axios from 'axios';
import { useAuthStore } from '../store';

const api = axios.create({
  baseURL: 'http://localhost:8383/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add the access token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || '서버 오류가 발생했습니다.';
    return Promise.reject(new Error(message));
  }
);

export default api;
