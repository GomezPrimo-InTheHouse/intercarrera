import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174, // 👈 solo afecta al entorno local
  },
  build: {
    outDir: 'dist', // 👈 asegura que Vercel use esta carpeta
  },
  preview: {
    port: 4173, // 👈 opcional: puerto para "vite preview"
  }
})
