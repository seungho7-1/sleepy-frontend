import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    headers: {
      'Cross-Origin-Embedder-Policy': 'credentialless',
      'Cross-Origin-Opener-Policy': 'same-origin',
    },
    proxy: {
      '/oauth2/authorization': 'http://localhost:8080',
      '/login/oauth2': 'http://localhost:8080',
      '/api': 'http://localhost:8080',
      '/uploads': 'http://localhost:8080',
    }
  },
  optimizeDeps: {
    exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'vendor';
            }
            if (id.includes('zustand')) {
              return 'state';
            }
            if (id.includes('lucide-react')) {
              return 'ui';
            }
            return 'vendor-other';
          }
        }
      }
    }
  }
})
