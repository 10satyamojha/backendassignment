import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': { // Any request starting with /api will be proxied
        target: 'http://localhost:5000', // Your backend's address
        changeOrigin: true, // Changes the origin of the request to match the target URL
        rewrite: (path) => path.replace(/^\/api/, ''), // Remove the /api prefix before forwarding
        
      },
    },
  },
})
