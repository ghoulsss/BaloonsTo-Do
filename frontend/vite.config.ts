import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')
  const proxy = { '/api': env.API_PROXY_TARGET || 'http://127.0.0.1:18080' }
  return {
    server: { proxy },
    preview: { proxy },
    plugins: [
      react({ babel: { plugins: [['babel-plugin-react-compiler']] } }),
    ],
  }
})
