import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'pdf-vendor': ['jspdf', 'html2canvas'],
          'react-vendor': ['react', 'react-dom'],
        },
      },
    },
  },
  server: {
    allowedHosts: [
      'annuity-boozy-acquire.ngrok-free.dev'
    ]
}});
