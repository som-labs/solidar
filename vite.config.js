import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import ViteYaml from '@modyfi/vite-plugin-yaml'
import svgr from 'vite-plugin-svgr'

// https://vitejs.dev/config/

export default defineConfig({
  plugins: [react(), ViteYaml(), svgr()],
  server: {
    proxy: {
        '^.*\\.php': {
        target: 'http://localhost:80',
        rewrite: (path) => path,
      }
    }
  },
  test: {
    environment: 'jsdom',
    testMatch: ['./src/**/*.test.jsx'],
    globals: true,
  },
})
