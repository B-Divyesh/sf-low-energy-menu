import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  build: {
    target: 'es2022',
    sourcemap: true,
    rollupOptions: {
      input: {
        app: resolve(process.cwd(), 'index.html'),
        demo: resolve(process.cwd(), 'demo/index.html'),
        privacy: resolve(process.cwd(), 'privacy/index.html'),
        terms: resolve(process.cwd(), 'terms/index.html'),
        notFound: resolve(process.cwd(), '404.html'),
      },
    },
  },
  test: {
    environment: 'node',
    include: ['tests/*.test.ts'],
  },
});
