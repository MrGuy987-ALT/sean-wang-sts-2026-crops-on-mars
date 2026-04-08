import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/sean-wang-sts-2026-crops-on-mars/',
  build: {
    sourcemap: false,
  },
})