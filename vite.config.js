import { defineConfig } from 'vite';
import { resolve } from 'path';
import { copyFileSync, existsSync, mkdirSync, readdirSync } from 'fs';

// Root-level static files that live in `public/` (the Vite root) and must be
// copied verbatim into the build output. Vite only emits assets referenced by
// the HTML entries, so these would otherwise be missing from `dist/`. A missing
// `sw.js` is especially harmful: returning visitors keep an old Service Worker
// registered, its update check 404s, and it keeps serving stale cached pages.
const STATIC_ROOT_FILES = [
  'sw.js',
  'manifest.json',
  'robots.txt',
  'sitemap.xml',
  'favicon.ico',
  'offline.html',
];

/**
 * Vite Configuration for DUYดูDEE
 * Implements code splitting, optimizations, and performance enhancements
 */
export default defineConfig({
  base: '/',
  root: 'public',
  envDir: '../',
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
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'], // Remove specific functions
        dead_code: true, // Remove dead code
        unused: true, // Remove unused variables
      },
      mangle: {
        safari10: true, // Support Safari 10+
        properties: {
          regex: /^_/, // Mangle properties starting with underscore
        },
      },
    },
    target: 'es2020', // Target modern browsers for better optimization
    modulePreload: { polyfill: false }, // Disable module preload polyfill
    rollupOptions: {
      input: {
        index: resolve('public/index.html'),
        category: resolve('public/category.html'),
        search: resolve('public/search.html'),
        login: resolve('public/login.html'),
        register: resolve('public/register.html'),
        profile: resolve('public/profile.html'),
        'edit-profile': resolve('public/edit-profile.html'),
        'watch-movie': resolve('public/watch-movie.html'),
        'watch-series': resolve('public/watch-series.html'),
        'forgot-password': resolve('public/forgot-password.html'),
        'watchlist': resolve('public/watchlist.html'),
        'history': resolve('public/history.html'),
        '404': resolve('public/404.html'),
        'admin/admin-manage': resolve('public/admin/admin-manage.html'),
        'admin/admin-add-movie': resolve('public/admin/admin-add-movie.html'),
        'admin/admin-add-series': resolve('public/admin/admin-add-series.html'),
        'admin/admin-edit-movie': resolve('public/admin/admin-edit-movie.html'),
        'admin/admin-edit-series': resolve('public/admin/admin-edit-series.html'),
        'admin/admin-hero-slider': resolve('public/admin/admin-hero-slider.html'),
        'admin/admin-manage-movies': resolve('public/admin/admin-manage-movies.html'),
        'admin/admin-manage-series': resolve('public/admin/admin-manage-series.html'),
        'admin/admin-system': resolve('public/admin/admin-system.html'),
        'admin/admin-users': resolve('public/admin/admin-users.html'),
        'admin/admin-vip-payments': resolve('public/admin/admin-vip-payments.html'),
        'admin/admin-activity-logs': resolve('public/admin/admin-activity-logs.html'),
        'admin/admin-stats': resolve('public/admin/admin-stats.html'),
        'admin/admin-tickets': resolve('public/admin/admin-tickets.html'),
        'admin/admin-user-vip': resolve('public/admin/admin-user-vip.html'),
        'admin/admin-vip-manager': resolve('public/admin/admin-vip-manager.html'),
        'admin/admin-vip-plans': resolve('public/admin/admin-vip-plans.html'),
        'admin/admin-reports': resolve('public/admin/admin-reports.html'),
        'admin/admin-reviews': resolve('public/admin/admin-reviews.html')
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
          // Security utilities chunk
          if (id.includes('/src/security/')) {
            return 'security-utils';
          }
          // Performance utilities chunk
          if (id.includes('/src/performance/')) {
            return 'performance-utils';
          }
          // Admin components chunk
          if (id.includes('/src/admin/')) {
            return 'admin-components';
          }
          // Services chunk
          if (id.includes('/src/services/')) {
            return 'services';
          }
          // Components chunk
          if (id.includes('/src/components/')) {
            return 'components';
          }
          // Utils chunk
          if (id.includes('/src/utils/')) {
            return 'utils';
          }
          // NOTE: Do NOT group page entry modules (e.g. /src/admin/ or
          // /src/pages/) into shared chunks. Each HTML page is its own entry and
          // runs side effects on DOMContentLoaded (auth guards, toasts). Merging
          // entries makes one page load every other page's module and fire its
          // side effects (e.g. admin guards showing "no permission" toasts on the
          // login page). Only shared, side-effect-free libraries are chunked here.
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
    maxParallelFileOps: 8, // Increase parallel operations for faster builds
  },
  plugins: [
    {
      name: 'copy-static-files',
      closeBundle() {
        const rootDir = resolve('public');
        const distDir = resolve('dist');
        
        // Copy static root files (sw.js, manifest.json, etc.)
        for (const file of STATIC_ROOT_FILES) {
          const srcPath = resolve(rootDir, file);
          if (existsSync(srcPath)) {
            copyFileSync(srcPath, resolve(distDir, file));
            // Removed console.log for cleaner build output
          } else {
            // Removed console.warn for cleaner build output
          }
        }
      }
    },
    {
      name: 'copy-admin-components',
      closeBundle() {
        // Copy admin components (fragments)
        const adminCompDir = resolve('public/admin/components');
        const destAdminCompDir = resolve('dist/admin/components');

        if (existsSync(adminCompDir)) {
          if (!existsSync(destAdminCompDir)) {
            mkdirSync(destAdminCompDir, { recursive: true });
          }
          const files = readdirSync(adminCompDir);
          for (const file of files) {
            copyFileSync(resolve(adminCompDir, file), resolve(destAdminCompDir, file));
          }
        }

        // Copy all assets
        const assetsDir = resolve('public/assets');
        const destAssetsDir = resolve('dist/assets');
        
        function copyRecursive(src, dest) {
          if (!existsSync(dest)) mkdirSync(dest, { recursive: true });
          const entries = readdirSync(src, { withFileTypes: true });
          for (const entry of entries) {
            const srcPath = resolve(src, entry.name);
            const destPath = resolve(dest, entry.name);
            if (entry.isDirectory()) {
              copyRecursive(srcPath, destPath);
            } else {
              copyFileSync(srcPath, destPath);
            }
          }
        }
        
        if (existsSync(assetsDir)) {
          copyRecursive(assetsDir, destAssetsDir);
        }
      }
    },
    {
      name: 'performance-hints',
      generateBundle(options, bundle) {
        // Removed performance hint logging for cleaner build output.
        // Terser options in build.terserOptions already handle runtime console removal.
      }
    }
  ]
});
