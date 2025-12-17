import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
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
