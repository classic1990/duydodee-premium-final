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
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
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
    }
  }
});
