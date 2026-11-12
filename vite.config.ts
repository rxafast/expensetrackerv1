import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => {
  return {
    base: './', // CRITICAL FOR GITHUB PAGES: Uses relative asset paths so it loads correctly under /expensetracker/
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    define: {
      'process.env': {},
    },
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
