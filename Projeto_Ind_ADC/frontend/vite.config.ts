import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // In dev the frontend calls a relative "/rest/..." path (see .env.development).
    // Vite proxies those requests to the deployed backend server-side, which avoids
    // browser CORS issues without needing the backend redeployed.
    proxy: {
      '/rest': {
        target: 'https://adc-final.ey.r.appspot.com',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
