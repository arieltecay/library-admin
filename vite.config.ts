import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production'

  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: 5174,
      proxy: isProduction
        ? undefined
        : {
          '/api': {
            target: 'http://localhost:3000',
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api/, ''),
          },
        },
    },
    define: {
      'import.meta.env.VITE_API_BASE_URL': JSON.stringify(process.env.VITE_API_BASE_URL || '/api'),
      'import.meta.env.VITE_POS_BASE_URL': JSON.stringify(process.env.VITE_POS_BASE_URL || 'http://localhost:5173'),
    },
  }
})