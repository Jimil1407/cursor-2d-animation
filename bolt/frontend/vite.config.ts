import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          // Firebase is the largest dependency; splitting it keeps the initial
          // bundle small and lets it be cached independently of app code.
          firebase: ['firebase/app', 'firebase/auth', 'firebase/database'],
          ui: ['framer-motion', 'lucide-react', 'react-hot-toast', '@headlessui/react'],
          editor: ['react-simple-code-editor', 'prismjs'],
        },
      },
    },
  },
});
