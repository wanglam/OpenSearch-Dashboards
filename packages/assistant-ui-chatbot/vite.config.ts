import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: '/demo.html',
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'AssistantUIChatbot',
      formats: ['umd'],
      fileName: () => 'index.js',
    },
    rollupOptions: {
      // Bundle everything including React 19
      external: [],
      output: {
        globals: {},
      },
    },
    outDir: 'dist',
    emptyOutDir: true,
  },
});
