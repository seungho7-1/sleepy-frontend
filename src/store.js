import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  token: localStorage.getItem('token') || null,
  role: localStorage.getItem('role') || null,
  nickname: localStorage.getItem('nickname') || null,
  login: (token, role, nickname) => {
    localStorage.setItem('token', token)
    localStorage.setItem('role', role)
    localStorage.setItem('nickname', nickname)
    set({ token, role, nickname })
  },
  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    localStorage.removeItem('nickname')
    set({ token: null, role: null, nickname: null })
  },
}))
