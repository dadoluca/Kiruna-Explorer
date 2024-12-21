import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  server: { 
    host: process.env.DOCKER ? '0.0.0.0' : 'localhost',
    port: 5173, 
  },
  plugins: [react()],
  build: {
    outDir: 'build',
  },
})
