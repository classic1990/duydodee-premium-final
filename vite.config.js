import { defineConfig } from 'vite';

export default defineConfig({
  root: 'public',
  server: {
    open: '/index.html'
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: './index.html',
        category: './category.html',
        login: './login.html',
        register: './register.html',
        profile: './profile.html',
        'edit-profile': './edit-profile.html',
        'watch-movie': './watch-movie.html',
        'watch-series': './watch-series.html',
        'forgot-password': './forgot-password.html',
        'vip-upgrade': './vip-upgrade.html',
        '404': './404.html',
        'admin-manage': './admin/admin-manage.html',
        'admin-add-movie': './admin/admin-add-movie.html',
        'admin-add-series': './admin/admin-add-series.html',
        'admin-edit-movie': './admin/admin-edit-movie.html',
        'admin-edit-series': './admin/admin-edit-series.html',
        'admin-hero-slider': './admin/admin-hero-slider.html',
        'admin-manage-movies': './admin/admin-manage-movies.html',
        'admin-manage-series': './admin/admin-manage-series.html',
        'admin-system': './admin/admin-system.html',
        'admin-users': './admin/admin-users.html',
        'admin-vip-payments': './admin/admin-vip-payments.html'
      }
    }
  }
});
