import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://proyecto-m4-guillermo-cely.vercel.app',
        changeOrigin: true,
      },
    },
  },
})
