import path from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const rootDir = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react(), tailwindcss()],
  publicDir: path.resolve(rootDir, '../frontend/public'),
  resolve: {
    alias: {
      '@': path.resolve(rootDir, 'src'),
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
    fs: {
      allow: [rootDir, path.resolve(rootDir, '../frontend')],
    },
    proxy: {
      '/api/user/v1': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
      },
    },
  },
})
