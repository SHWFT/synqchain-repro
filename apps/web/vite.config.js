import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  server: {
    port: 5173,
    host: true,
    cors: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});
