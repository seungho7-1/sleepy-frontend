import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  token: localStorage.getItem('token') || null,
  role: localStorage.getItem('role') || null,
  nickname: localStorage.getItem('nickname') || null,
  profileImageUrl: localStorage.getItem('profileImageUrl') || null,
  login: (token, role, nickname, profileImageUrl = null) => {
    localStorage.setItem('token', token)
    localStorage.setItem('role', role)
    localStorage.setItem('nickname', nickname)
    if (profileImageUrl) localStorage.setItem('profileImageUrl', profileImageUrl)
    set({ token, role, nickname, profileImageUrl })
  },
  setRole: (role) => {
    if (role) {
      localStorage.setItem('role', role)
    } else {
      localStorage.removeItem('role')
    }
    set({ role })
  },
  setNickname: (nickname) => {
    if (nickname) {
      localStorage.setItem('nickname', nickname)
    } else {
      localStorage.removeItem('nickname')
    }
    set({ nickname })
  },
  setProfileImageUrl: (url) => {
    if (url) {
      localStorage.setItem('profileImageUrl', url)
    } else {
      localStorage.removeItem('profileImageUrl')
    }
    set({ profileImageUrl: url })
  },
  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    localStorage.removeItem('nickname')
    localStorage.removeItem('profileImageUrl')
    set({ token: null, role: null, nickname: null, profileImageUrl: null })
  },
}))
