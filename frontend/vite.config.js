import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Don't watch static SFX assets — new mp3/wav files landing in this
    // folder are locked mid-copy on Windows (EBUSY) and would crash the
    // whole dev server. No HMR is needed for these files.
    watch: {
      ignored: ['**/public/sfx/**'],
    },
  },
})
