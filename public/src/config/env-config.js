/**
 * 🔧 DUYDODEE PREMIUM - ENVIRONMENT CONFIGURATION
 * Centralized environment variable management with validation
 */

export const ENV = {
  // Firebase Configuration
  FIREBASE: {
    API_KEY: import.meta.env?.VITE_FIREBASE_API_KEY || 'MISSING',
    AUTH_DOMAIN: import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN || 'duydodeesport.firebaseapp.com',
    PROJECT_ID: import.meta.env?.VITE_FIREBASE_PROJECT_ID || 'duydodeesport',
    STORAGE_BUCKET: import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET || 'duydodeesport.appspot.com',
    MESSAGING_SENDER_ID: import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID || '30514101130',
    APP_ID: import.meta.env?.VITE_FIREBASE_APP_ID || '1:30514101130:web:1ec44f2b09367468132e49',
    MEASUREMENT_ID: import.meta.env?.VITE_FIREBASE_MEASUREMENT_ID || 'G-7EC2RQZH22'
  },

  // Site Configuration
  SITE: {
    URL: import.meta.env?.VITE_SITE_URL || 'https://duydodee.web.app',
    NAME: import.meta.env?.VITE_SITE_NAME || 'DUYDODEE PREMIUM',
    DESCRIPTION:
      import.meta.env?.VITE_SITE_DESCRIPTION || 'แพลตฟอร์มสตรีมมิ่ง 4K HDR ระดับพรีเมียม',
    KEYWORDS: import.meta.env?.VITE_SITE_KEYWORDS || 'streaming,4K,HDR,movies,series,premium'
  },

  // Analytics Configuration
  ANALYTICS: {
    TRACKING_ID: import.meta.env?.VITE_GA_TRACKING_ID || '',
    ENABLED: import.meta.env?.VITE_ENABLE_ANALYTICS === 'true'
  },

  // Error Monitoring
  SENTRY: {
    DSN: import.meta.env?.VITE_SENTRY_DSN || '',
    ENVIRONMENT: import.meta.env?.VITE_SENTRY_ENVIRONMENT || 'production',
    ENABLED: import.meta.env?.VITE_ENABLE_ERROR_MONITORING === 'true'
  },

  // Feature Flags
  FEATURES: {
    DEBUG: import.meta.env?.VITE_ENABLE_DEBUG === 'true',
    MOCK_DATA: import.meta.env?.VITE_ENABLE_MOCK_DATA === 'true',
    PERFORMANCE_MONITORING: import.meta.env?.VITE_ENABLE_PERFORMANCE_MONITORING !== 'false',
    AI_FEATURES: import.meta.env?.VITE_ENABLE_AI_FEATURES === 'true'
  },

  // Content Configuration
  CONTENT: {
    PAGE_SIZE: parseInt(import.meta.env?.VITE_DEFAULT_PAGE_SIZE, 10) || 12,
    MAX_RETRY_ATTEMPTS: parseInt(import.meta.env?.VITE_MAX_RETRY_ATTEMPTS, 10) || 3,
    API_TIMEOUT: parseInt(import.meta.env?.VITE_API_TIMEOUT, 10) || 30000
  },

  // Search Configuration
  SEARCH: {
    ALGOLIA_APP_ID: import.meta.env?.VITE_ALGOLIA_APP_ID || '',
    ALGOLIA_SEARCH_KEY: import.meta.env?.VITE_ALGOLIA_SEARCH_KEY || '',
    ALGOLIA_INDEX_NAME: import.meta.env?.VITE_ALGOLIA_INDEX_NAME || 'duydodee_content'
  },

  // AI Configuration
  AI: {
    PROVIDER: import.meta.env?.VITE_AI_PROVIDER || 'anthropic',
    API_KEY: import.meta.env?.VITE_AI_API_KEY || '',
    MODEL: import.meta.env?.VITE_AI_MODEL || 'claude-3-opus-20240229',
    ENDPOINT: import.meta.env?.VITE_AI_ENDPOINT || ''
  }
};

/**
 * Validate required environment variables
 */
export function validateEnvironment() {
  const errors = [];

  // Check required Firebase configuration
  if (ENV.FIREBASE.API_KEY === 'MISSING' || !ENV.FIREBASE.API_KEY) {
    errors.push('VITE_FIREBASE_API_KEY is required');
  }

  // Warn in development but not block
  if (ENV.FEATURES.DEBUG) {
    console.warn('⚠️ Debug mode is enabled - disable in production');
  }

  if (errors.length > 0) {
    console.warn('⚠️ Environment Configuration Warnings:', errors);
    if (typeof window !== 'undefined') {
      console.warn('Please check your .env.local file if the app behaves unexpectedly.');
    }
    return true; // Return true to continue app execution
  }

  return true;
}

/**
 * Get current environment
 */
export function getEnvironment() {
  if (ENV.FEATURES.DEBUG) {
    return 'development';
  }
  if (ENV.SENTRY.ENVIRONMENT) {
    return ENV.SENTRY.ENVIRONMENT;
  }
  return 'production';
}

// Initialize validation
if (typeof window !== 'undefined') {
  setTimeout(validateEnvironment, 0);
}
