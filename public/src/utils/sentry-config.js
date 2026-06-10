/**
 * 🔍 Sentry Configuration (Optional)
 * Error tracking and performance monitoring
 * Only loads when SENTRY_DSN is configured
 */

import config from '../config/index.js';

class SentryConfig {
    constructor() {
        this.dsn = config.get('sentry.dsn');
        this.enabled = !!this.dsn;
    }

    async init() {
        if (!this.enabled) {
            console.log('ℹ️ Sentry disabled - No DSN configured');
            return;
        }

        try {
            // Dynamically load Sentry SDK
            await this.loadSentry();

            // Initialize Sentry
            window.Sentry.init({
                dsn: this.dsn,
                environment: config.get('sentry.environment') || 'production',
                integrations: [
                    new window.Sentry.BrowserTracing(),
                    new window.Sentry.Replay({
                        maskAllText: false,
                        blockAllMedia: false
                    })
                ],
                tracesSampleRate: 0.1, // 10% of transactions for performance monitoring
                replaysSessionSampleRate: 0.1, // 10% of sessions
                replaysOnErrorSampleRate: 1.0, // 100% of error sessions
                beforeSend(event, _hint) {
                    // Filter out unwanted errors
                    if (this.shouldIgnoreError(event)) {
                        return null;
                    }

                    // Add custom context
                    event.contexts = {
                        ...event.contexts,
                        app: {
                            name: config.get('site.name'),
                            url: config.get('site.url')
                        }
                    };

                    return event;
                }
            });

            console.log('✅ Sentry initialized');
        } catch (error) {
            console.error('❌ Sentry initialization failed:', error);
        }
    }

    async loadSentry() {
        if (window.Sentry) {
            return; // Already loaded
        }

        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://browser.sentry-cdn.com/7.84.0/bundle.tracing.replay.min.js';
            script.crossOrigin = 'anonymous';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    shouldIgnoreError(event) {
    // Ignore common browser errors
        const ignorePatterns = [
            /ResizeObserver loop limit exceeded/,
            /Script error/,
            /Non-Error promise rejection captured/,
            /Network request failed/,
            /Failed to fetch/
        ];

        const errorMessage = event.message || '';

        return ignorePatterns.some(pattern => pattern.test(errorMessage));
    }

    captureException(error, context = {}) {
        if (window.Sentry && this.enabled) {
            window.Sentry.captureException(error, {
                extra: context
            });
        }
    }

    captureMessage(message, level = 'info', context = {}) {
        if (window.Sentry && this.enabled) {
            window.Sentry.captureMessage(message, level, {
                extra: context
            });
        }
    }

    setUser(user) {
        if (window.Sentry && this.enabled && user) {
            window.Sentry.setUser({
                id: user.uid,
                email: user.email,
                username: user.displayName
            });
        }
    }

    clearUser() {
        if (window.Sentry && this.enabled) {
            window.Sentry.setUser(null);
        }
    }
}

// Export singleton instance
const sentryConfig = new SentryConfig();

// Auto-initialize if DSN is configured
if (sentryConfig.enabled) {
    sentryConfig.init();
}

export default sentryConfig;
