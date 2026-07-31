import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  // localStorage 접근 금지! 오직 메모리에만 둡니다. (새로고침하면 null이 됨)
  token: null,
  role: null,
  nickname: null,
  profileImageUrl: null,
  
  // axios interceptor에서 새 토큰을 덮어씌울 때 쓰는 함수
  setToken: (token) => {
    set({ token })
  },

  // 로그인 시 상태 저장
  login: (token, role, nickname, profileImageUrl = null) => {
    set({ token, role, nickname, profileImageUrl })
  },
  
  setRole: (role) => set({ role }),
  setNickname: (nickname) => set({ nickname }),
  setProfileImageUrl: (url) => set({ profileImageUrl: url }),
  
  // 로그아웃 시 상태 초기화
  logout: () => {
    set({ token: null, role: null, nickname: null, profileImageUrl: null })
  },
}))