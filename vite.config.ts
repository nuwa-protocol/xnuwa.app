import { readFileSync } from 'node:fs';
import path, { resolve } from 'node:path';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';

const pkg = JSON.parse(
  readFileSync(resolve(__dirname, 'package.json'), 'utf-8'),
);

// https://vite.dev/config/
export default defineConfig({
  build: {
    sourcemap: false,
  },
  plugins: [
    react(),
    sentryVitePlugin({
      org: 'nuwa-ai',
      project: 'nuwa-client',
      authToken: process.env.VITE_SENTRY_AUTH_TOKEN,
      release: {
        name: `nuwa-client@${pkg.version}`,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
});
