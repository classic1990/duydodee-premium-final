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
                apiKey: safeEnv.VITE_FIREBASE_API_KEY,
                authDomain: safeEnv.VITE_FIREBASE_AUTH_DOMAIN,
                projectId: safeEnv.VITE_FIREBASE_PROJECT_ID,
                storageBucket: safeEnv.VITE_FIREBASE_STORAGE_BUCKET,
                messagingSenderId: safeEnv.VITE_FIREBASE_MESSAGING_SENDER_ID,
                appId: safeEnv.VITE_FIREBASE_APP_ID,
                measurementId: safeEnv.VITE_FIREBASE_MEASUREMENT_ID
            },

            // Admin Configuration
            admin: {
                emails: (safeEnv.VITE_ADMIN_EMAILS || 'admin@example.com').split(',').map(e => e.trim())
            },

            // Site Configuration
            site: {
                url: safeEnv.VITE_SITE_URL || 'http://localhost:5173',
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
