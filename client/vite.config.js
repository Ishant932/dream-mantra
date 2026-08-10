import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
    cssMinify: true,
    modulePreload: { polyfill: false },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          motion: ['framer-motion'],
          icons: ['lucide-react'],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
  server: {
    host: true,
    port: 5174,
    strictPort: true,
    open: '/login',
    hmr: { overlay: true },
    proxy: {
      '/api': { target: 'http://127.0.0.1:5001', changeOrigin: true },
      '/studio': { target: 'http://127.0.0.1:5001', changeOrigin: true },
    },
  },
});
