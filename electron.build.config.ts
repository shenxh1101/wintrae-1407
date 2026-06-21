import { defineConfig } from 'electron-vite';
import path from 'path';

export default defineConfig({
  main: {
    build: {
      outDir: 'dist-electron',
      lib: {
        entry: 'electron/main.ts',
        formats: ['cjs'],
        fileName: 'main'
      },
      rollupOptions: {
        external: ['better-sqlite3', 'electron']
      }
    }
  },
  preload: {
    build: {
      outDir: 'dist-electron',
      lib: {
        entry: 'electron/preload.ts',
        formats: ['cjs'],
        fileName: 'preload'
      },
      rollupOptions: {
        external: ['electron']
      }
    }
  }
});
