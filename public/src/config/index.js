/**
 * 🛠️ DUYดูDEE Configuration Loader
 * Centralized environment configuration with fallback values
 */

class Config {
    constructor() {
        this.config = this.loadConfig();
    }

    loadConfig() {
        // Safe access to environment variables
        // Vite will statically replace import.meta.env during build
        let env = {};

        // Use a more robust check for import.meta and import.meta.env
        if (typeof import.meta !== 'undefined' && import.meta && import.meta.env) {
            env = import.meta.env;
        }

        // Debugging (Remove in production)
        if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
            console.log('🔧 Config loading...', {
                hasImportMeta: typeof import.meta !== 'undefined',
                keys: env ? Object.keys(env) : []
            });
        }

        // Ensure env is never undefined when creating the object
        const safeEnv = env || {};

        return {
            // Firebase Configuration
            firebase: {
                apiKey: safeEnv.VITE_FIREBASE_API_KEY || 'AIzaSyBZz2QI4hb2FAVjhhNCP8rARVo_zlv7_KA',
                authDomain: safeEnv.VITE_FIREBASE_AUTH_DOMAIN || 'duydodeesport.firebaseapp.com',
                projectId: safeEnv.VITE_FIREBASE_PROJECT_ID || 'duydodeesport',
                storageBucket: safeEnv.VITE_FIREBASE_STORAGE_BUCKET || 'duydodeesport.firebasestorage.app',
                messagingSenderId: safeEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || '435929814225',
                appId: safeEnv.VITE_FIREBASE_APP_ID || '1:435929814225:web:81e149cfb597513040e1f0',
                measurementId: safeEnv.VITE_FIREBASE_MEASUREMENT_ID || 'G-7EC2RQZH22'
            },

            // Admin Configuration
            admin: {
                emails: (safeEnv.VITE_ADMIN_EMAILS || 'duyclassic191@gmail.com').split(',').map(e => e.trim())
            },

            // Site Configuration
            site: {
                url: safeEnv.VITE_SITE_URL || 'https://duydodeesport.web.app',
                name: safeEnv.VITE_SITE_NAME || 'DUYดูDEE PREMIUM'
            },

            // Analytics Configuration
            analytics: {
                trackingId: safeEnv.VITE_GA_TRACKING_ID,
                enabled: safeEnv.VITE_ENABLE_ANALYTICS === 'true'
            },

            // Error Tracking (Sentry)
            sentry: {
                dsn: safeEnv.VITE_SENTRY_DSN,
                environment: safeEnv.VITE_SENTRY_ENVIRONMENT || 'production'
            },

            // Feature Flags
            features: {
                debug: safeEnv.VITE_ENABLE_DEBUG === 'true',
                mockData: safeEnv.VITE_ENABLE_MOCK_DATA === 'true'
            }
        };
    }

    get(path) {
        const keys = path.split('.');
        let value = this.config;

        for (const key of keys) {
            if (value && typeof value === 'object' && key in value) {
                value = value[key];
            } else {
                return undefined;
            }
        }

        return value;
    }

    isAdmin(email) {
        if (!email) {
            return false;
        }
        return this.config.admin.emails.includes(email.toLowerCase());
    }

    isDevelopment() {
        return this.config.features.debug;
    }
}

// Singleton instance
const config = new Config();
export default config;
