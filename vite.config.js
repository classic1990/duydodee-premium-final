import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'public',
  envDir: '../',
  server: {
    open: '/index.html',
    headers: {
      'Cross-Origin-Opener-Policy': 'unsafe-none'
    }
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug']
      }
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalizedId = id.replace(/\\/g, '/');
          if (normalizedId.includes('node_modules/firebase') || normalizedId.includes('node_modules/@firebase')) {
            return 'firebase-vendor';
          }
          if (
            normalizedId.includes('src/utils/logger.js') ||
            normalizedId.includes('src/utils/error-handler.js') ||
            normalizedId.includes('src/utils/validator.js')
          ) {
            return 'utils';
          }
          if (
            normalizedId.includes('src/services/auth-service.js') ||
            normalizedId.includes('src/services/content-service.js')
          ) {
            return 'services';
          }
        }
      },
      input: {
        main: resolve('public/index.html'),
        category: resolve('public/category.html'),
        login: resolve('public/login.html'),
        register: resolve('public/register.html'),
        profile: resolve('public/profile.html'),
        'edit-profile': resolve('public/edit-profile.html'),
        'watch-movie': resolve('public/watch-movie.html'),
        'watch-series': resolve('public/watch-series.html'),
        'forgot-password': resolve('public/forgot-password.html'),
        'vip-upgrade': resolve('public/vip-upgrade.html'),
        '404': resolve('public/404.html'),
        'admin-manage': resolve('public/admin/admin-manage.html'),
        'admin-add-movie': resolve('public/admin/admin-add-movie.html'),
        'admin-add-series': resolve('public/admin/admin-add-series.html'),
        'admin-edit-movie': resolve('public/admin/admin-edit-movie.html'),
        'admin-edit-series': resolve('public/admin/admin-edit-series.html'),
        'admin-hero-slider': resolve('public/admin/admin-hero-slider.html'),
        'admin-manage-movies': resolve('public/admin/admin-manage-movies.html'),
        'admin-manage-series': resolve('public/admin/admin-manage-series.html'),
        'admin-system': resolve('public/admin/admin-system.html'),
        'admin-users': resolve('public/admin/admin-users.html'),
        'admin-vip-payments': resolve('public/admin/admin-vip-payments.html')
      }
    },
    chunkSizeWarningLimit: 1000
  }
});
