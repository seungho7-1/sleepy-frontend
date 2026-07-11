import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/oauth2/authorization': 'http://localhost:8383',
      '/login/oauth2': 'http://localhost:8383',
    }
  }
})
