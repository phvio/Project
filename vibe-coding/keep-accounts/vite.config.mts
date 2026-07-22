import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  // Electron 开发模式下，Vite 开发服务器的配置
  server: {
    port: 5173,
    strictPort: true,
  },
  // 构建输出到 dist/ 目录（Electron 主进程会从这加载）
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})
