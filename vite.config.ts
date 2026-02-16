import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true,
      },
    },
    host: true,
    port: 5173,
    strictPort: true,
    watch: {
      usePolling: true,
      interval: 120,
    },
    hmr: {
      host: 'localhost',
      port: 5173,
      clientPort: 5173,
    },
  },
});
