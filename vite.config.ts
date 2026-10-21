import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const rootDir = path.dirname(fileURLToPath(import.meta.url))

function resolveAsnafFrontend() {
  const candidates = [
    process.env.ASNAF_FRONTEND_DIR,
    path.resolve(rootDir, '../frontend'),
    path.resolve(rootDir, 'vendor/asnaf-frontend'),
  ].filter((dir): dir is string => Boolean(dir))

  for (const dir of candidates) {
    if (fs.existsSync(path.join(dir, 'src/components/ui/DateText.tsx'))) {
      return dir
    }
  }

  return path.resolve(rootDir, 'vendor/asnaf-frontend')
}

const asnafFrontend = resolveAsnafFrontend()

export default defineConfig({
  plugins: [react(), tailwindcss()],
  publicDir: path.resolve(asnafFrontend, 'public'),
  resolve: {
    alias: {
      '@': path.resolve(rootDir, 'src'),
      '@asnaf': path.resolve(asnafFrontend, 'src'),
      react: path.resolve(rootDir, 'node_modules/react'),
      'react-dom': path.resolve(rootDir, 'node_modules/react-dom'),
      'lucide-react': path.resolve(rootDir, 'node_modules/lucide-react'),
    },
    dedupe: ['react', 'react-dom', 'react-i18next', 'i18next', 'lucide-react'],
  },
  server: {
    host: '127.0.0.1',
    port: 5174,
    strictPort: true,
    allowedHosts: true,
    fs: {
      allow: [rootDir, asnafFrontend],
    },
    proxy: {
      '/api/user/v1': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
      },
    },
  },
})
