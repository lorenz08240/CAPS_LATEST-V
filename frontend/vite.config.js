import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['gsap', 'gsap/ScrollTrigger'],
  },
  build: {
    // This app bundles three.js + React 3D tooling, so a ~3 MB entry chunk is
    // expected. Manual vendor grouping changed module initialisation order and
    // broke the production app, so splitting is intentionally left at Vite's
    // default; this just raises the informational warning threshold.
    chunkSizeWarningLimit: 3200,
  },
  server: {
    allowedHosts: true,
    // Don't watch static SFX assets ΓÇö new mp3/wav files landing in this
    // folder are locked mid-copy on Windows (EBUSY) and would crash the
    // whole dev server. No HMR is needed for these files.
    watch: {
      ignored: ['**/public/sfx/**'],
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 5173,
    host: true,
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
