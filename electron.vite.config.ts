import { defineConfig } from 'electron-vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  server: {
    port: 5175
  },
  main: {
    outDir: 'dist-electron',
    build: {
      lib: {
        entry: 'electron/main.ts',
        formats: ['cjs']
      },
      rollupOptions: {
        external: ['better-sqlite3', 'electron']
      }
    }
  },
  preload: {
    outDir: 'dist-electron',
    build: {
      lib: {
        entry: 'electron/preload.ts',
        formats: ['cjs']
      },
      rollupOptions: {
        external: ['electron']
      }
    }
  },
  renderer: {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@shared': path.resolve(__dirname, 'shared')
      }
    },
    build: {
      outDir: 'dist'
    }
  }
});
