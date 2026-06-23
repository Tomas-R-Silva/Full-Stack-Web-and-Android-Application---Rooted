import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // In dev the frontend calls a relative "/rest/..." path (VITE_API_URL=/rest).
    // Vite proxies those requests to the deployed backend server-side, which avoids
    // browser CORS issues. In production the app is served from the same App Engine
    // domain, so "/rest" is same-origin and needs no proxy.
    proxy: {
      "/rest": {
        target: "https://adc-final.ey.r.appspot.com",
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
