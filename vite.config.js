import { defineConfig } from 'vite';
import { resolve } from 'path';

/**
 * Vite Configuration for DUYดูDEE
 * Implements code splitting, optimizations, and performance enhancements
 */
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
    sourcemap: false, // Disable sourcemap in production for security
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
      },
    },
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
        'admin-vip-payments': resolve('public/admin/admin-vip-payments.html'),
        'admin-activity-logs': resolve('public/admin/admin-activity-logs.html'),
        'admin-stats': resolve('public/admin/admin-stats.html'),
        'admin-tickets': resolve('public/admin/admin-tickets.html'),
        'admin-user-vip': resolve('public/admin/admin-user-vip.html')
      },
      output: {
        manualChunks(id) {
          // Firebase SDK chunk (separate for better caching)
          if (id.includes('firebase')) {
            return 'firebase-vendor';
          }
          // UI components chunk
          if (id.includes('/src/components/ui.js')) {
            return 'ui-components';
          }
          // Services chunk
          if (id.includes('/src/services/')) {
            return 'services';
          }
          // Admin pages chunk
          if (id.includes('/src/admin/')) {
            return 'admin';
          }
          // Auth pages chunk
          if (id.includes('/src/pages/auth/')) {
            return 'auth';
          }
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const ext = assetInfo.name.split('.').pop();
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`;
          }
          if (/css/i.test(ext)) {
            return `assets/css/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    reportCompressedSize: false, // Faster builds
  },
  plugins: [
    {
      name: 'performance-hints',
      generateBundle(options, bundle) {
        const KB = 1024;
        const MB = KB * KB;
        let totalSize = 0;

        for (const [fileName, file] of Object.entries(bundle)) {
          if (file.type === 'chunk' || file.type === 'asset') {
            const size = file.size;
            totalSize += size;
            const sizeKB = (size / KB).toFixed(2);
            const sizeMB = (size / MB).toFixed(2);

            if (size > MB) {
              console.warn(`⚠️ Large bundle: ${fileName} (${sizeMB} MB)`);
            } else if (size > 500 * KB) {
              console.warn(`⚠️ Large file: ${fileName} (${sizeKB} KB)`);
            }
          }
        }

        console.log(`📦 Total bundle size: ${(totalSize / MB).toFixed(2)} MB`);
      }
    }
  ]
});
