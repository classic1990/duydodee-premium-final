import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'public',
  server: {
    open: '/index.html',
    headers: {
      'Cross-Origin-Opener-Policy': 'unsafe-none'
    }
  },
  css: {
    postcss: './postcss.config.cjs',
    devSourcemap: true, // ช่วยในการ Debug CSS ใน Developer Tools
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve('public/index.html'),
        category: resolve('public/category.html'),
        search: resolve('public/search.html'),
        login: resolve('public/login.html'),
        register: resolve('public/register.html'),
        profile: resolve('public/profile.html'),
        'edit-profile': resolve('public/edit-profile.html'),
        'watch-movie': resolve('public/watch-movie.html'),
        'watch-series': resolve('public/watch-series.html'),
        'forgot-password': resolve('public/forgot-password.html'),
        'vip-upgrade': resolve('public/vip-upgrade.html'),
        '404': resolve('public/404.html'),
        'admin-manage': resolve('public/src/pages/admin/admin-manage.html'),
        'admin-add-movie': resolve('public/src/pages/admin/admin-add-movie.html'),
        'admin-add-series': resolve('public/src/pages/admin/admin-add-series.html'),
        'admin-edit-movie': resolve('public/src/pages/admin/admin-edit-movie.html'),
        'admin-edit-series': resolve('public/src/pages/admin/admin-edit-series.html'),
        'admin-hero-slider': resolve('public/src/pages/admin/admin-hero-slider.html'),
        'admin-manage-movies': resolve('public/src/pages/admin/admin-manage-movies.html'),
        'admin-manage-series': resolve('public/src/pages/admin/admin-manage-series.html'),
        'admin-system': resolve('public/src/pages/admin/admin-system.html'),
        'admin-users': resolve('public/src/pages/admin/admin-users.html'),
        'admin-vip-payments': resolve('public/src/pages/admin/admin-vip-payments.html'),
        'admin-activity-logs': resolve('public/src/pages/admin/admin-activity-logs.html'),
        'admin-stats': resolve('public/src/pages/admin/admin-stats.html')
      }
    }
  }
});
