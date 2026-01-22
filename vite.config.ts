import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import os from 'os'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    allowedHosts: [
      os.hostname().toLowerCase()
    ]
  }
})
