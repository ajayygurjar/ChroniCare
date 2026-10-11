import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Where the ChroniCare API (services/core-api) listens. Not prefixed VITE_, so it never reaches the browser bundle.
  const env = loadEnv(mode, process.cwd(), '')
  const apiProxy = {
    // The browser calls /api on its own origin; Vite forwards it, so there is no CORS and the
    // refresh cookie is a plain same-site cookie. In production the gateway does this job.
    '/api': { target: env.API_PROXY_TARGET || 'http://localhost:4000' },
  }

  return {
    plugins: [react()],
    server: { proxy: apiProxy },
    preview: { proxy: apiProxy },
  }
})
