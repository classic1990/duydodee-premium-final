/**
 * 🛠️ DUYดูDEE Configuration Loader
 * Centralized environment configuration with fallback values
 */

class Config {
    constructor() {
        this.config = this.loadConfig();
    }

    loadConfig() {
        return {
            // Firebase Configuration
            firebase: {
                apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyBZz2QI4hb2FAVjhhNCP8rARVo_zlv7_KA',
                authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'duydodeesport.firebaseapp.com',
                projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'duydodeesport',
                storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'duydodeesport.appspot.com',
                messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '30514101130',
                appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:30514101130:web:1ec44f2b09367468132e49',
                measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-7EC2RQZH22'
            },

            // Admin Configuration
            admin: {
                emails: (import.meta.env.VITE_ADMIN_EMAILS || 'duyclassic191@gmail.com').split(',').map(e => e.trim())
            },

            // Site Configuration
            site: {
                url: import.meta.env.VITE_SITE_URL || 'https://duydodeesport.web.app',
                name: import.meta.env.VITE_SITE_NAME || 'DUYดูDEE PREMIUM'
            },

            // Analytics Configuration
            analytics: {
                trackingId: import.meta.env.VITE_GA_TRACKING_ID,
                enabled: import.meta.env.VITE_ENABLE_ANALYTICS === 'true'
            },

            // Error Tracking (Sentry)
            sentry: {
                dsn: import.meta.env.VITE_SENTRY_DSN,
                environment: import.meta.env.VITE_SENTRY_ENVIRONMENT || 'production'
            },

            // Feature Flags
            features: {
                debug: import.meta.env.VITE_ENABLE_DEBUG === 'true',
                mockData: import.meta.env.VITE_ENABLE_MOCK_DATA === 'true'
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
