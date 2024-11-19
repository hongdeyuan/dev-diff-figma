import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  base: './',
  build: {
    rollupOptions: {
      input: {
        index: './index.html',
        inspector: './src/style/inspector.css',
        content: './src/content.ts',
        background: './src/background.ts',
      },
      output: {
        chunkFileNames: 'assets/[name].js',
        entryFileNames: '[name].js',
        assetFileNames: 'assets/[name].[ext]',
      },
    },
  },
});
