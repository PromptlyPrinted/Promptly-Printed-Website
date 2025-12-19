import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    lib: {
      entry: 'src/main.tsx',
      name: 'PromptlyPrintedWidget',
      fileName: 'widget',
      formats: ['iife'],
    },
    rollupOptions: {
      output: {
        entryFileNames: 'widget.js',
        assetFileNames: 'widget.[ext]',
      },
    },
    cssCodeSplit: false,
  },
});
