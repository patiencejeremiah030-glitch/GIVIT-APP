import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GIVIT Django runs on 8001 (8000 is often used by other projects).
// The proxy sends /api/* to Django so the browser never hits CORS issues.
const DJANGO_DEV_URL = 'http://127.0.0.1:8001'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: DJANGO_DEV_URL,
        changeOrigin: true,
      },
    },
  },
})
