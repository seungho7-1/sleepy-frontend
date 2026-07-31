import axios from 'axios';
import { useAuthStore } from '../store';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  // 🔥 추가: 백엔드와 쿠키(Refresh Token)를 주고받으려면 무조건 true여야 합니다!
  withCredentials: true, 
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: 헤더에 Access Token을 실어 보냅니다. (이건 기존과 동일)
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

// Response interceptor: 401 에러(토큰 만료) 발생 시 몰래 재발급(Refresh)을 시도합니다.
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    // 만약 에러가 401(인증 실패)이고, 아직 재시도를 안 한 요청이라면?
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // 무한 루프 방지용 플래그

      try {
        // 1. 백엔드에 재발급(Refresh) 요청을 보냅니다. (쿠키가 알아서 날아감)
        // 무한 루프를 막기 위해 api 인스턴스 대신 날것의 axios를 씁니다.
        const res = await axios.post(
          (import.meta.env.VITE_API_BASE_URL || '/api') + '/auth/refresh',
          {},
          { withCredentials: true } 
        );

        // 2. 백엔드가 준 새 Access Token을 가져옵니다.
        const newAccessToken = res.data.accessToken;

        // 3. Zustand(또는 Redux) Store에 새 토큰을 덮어씌웁니다.
        useAuthStore.getState().setToken(newAccessToken); 
        // (주의: store.js에 setToken 메서드가 없다면 7단계에서 만들 겁니다!)

        // 4. 실패했던 원래 요청의 헤더에 새 토큰을 끼워넣고 다시 쏩니다!
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        const retryResponse = await axios(originalRequest);
        return retryResponse.data; // 재시도 성공 결과 반환

      } catch (refreshError) {
        // Refresh Token마저 만료/조작되었다면? 얄짤없이 강제 로그아웃
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }

    // 401 에러가 아니면 원래대로 에러 반환
    const message = error.response?.data?.message || error.message || '서버 오류가 발생했습니다.';
    return Promise.reject(new Error(message));
  }
);

export default api;