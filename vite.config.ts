import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type ProxyOptions } from 'vite'
import { mediaManifest } from './media-manifest'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const target = env.API_PROXY_TARGET || 'http://localhost:4000'

  // /api is forwarded to the CMS, so the browser only ever talks to one origin —
  // exactly like production behind a rewrite. That keeps the refresh-token cookie
  // first-party. Remote targets (a deployed API) need their own Host header.
  const proxy: Record<string, ProxyOptions> = {
    '/api': { target, changeOrigin: !/localhost|127\.0\.0\.1/.test(target) },
  }

  return {
    plugins: [react(), tailwindcss(), mediaManifest()],
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    server: { port: 5173, proxy },
    preview: { port: 4173, proxy },
  }
})
