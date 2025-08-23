import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      }
    },
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        '/api/cnpj': {
          target: 'https://brasilapi.com.br',
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/api\/cnpj/, '/api/cnpj/v1')
        }
      }
    }
  }
})
