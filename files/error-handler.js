/**
 * 🛡️ DUYดูDEE Error Handler
 * Global error tracking and handling
 */

class ErrorHandler {
    constructor() {
        this.errors = [];
        this.init();
    }

    init() {
    // Global error handler
        window.addEventListener('error', this.handleError.bind(this));
        window.addEventListener('unhandledrejection', this.handlePromiseRejection.bind(this));

        // Track performance
        this.trackPerformance();

        // Log environment info
        this.logEnvironmentInfo();

        // Auto-init Sentry from CDN if DSN configured
        this.initSentry();
    }

    async initSentry() {
        // Use centralized config instead of window.__SENTRY_DSN__ (global leak)
        let dsn = null;
        try {
            const configModule = await import('../config/index.js');
            dsn = configModule.default.get('sentry.dsn');
        } catch {
            // Fallback: check legacy window property if config unavailable
            dsn = window.__SENTRY_DSN__ || null;
        }
        if (!dsn) {
            return;
        }
        const script = document.createElement('script');
        script.src = 'https://browser.sentry-cdn.com/8.0.0/bundle.min.js';
        script.onload = () => {
            if (typeof Sentry !== 'undefined') {
                Sentry.init({
                    dsn,
                    environment: this.getEnvironment(),
                    tracesSampleRate: 0.1
                });
            }
        };
        document.head.appendChild(script);
    }

    getEnvironment() {
        try {
            return typeof process !== 'undefined' && process.env && process.env.NODE_ENV
                ? process.env.NODE_ENV
                : 'production';
        } catch {
            return 'production';
        }
    }

    handleError(event) {
        const error = {
            type: 'error',
            message: event.message || 'Unknown error',
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            stack: event.error?.stack,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };

        this.errors.push(error);
        this.logError(error);

        // Prevent default browser error handling
        event.preventDefault();

        // Show user-friendly error message
        this.showUserError(error);
    }

    handlePromiseRejection(event) {
        const error = {
            type: 'promise',
            message: event.reason?.message || 'Unhandled promise rejection',
            stack: event.reason?.stack,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };

        this.errors.push(error);
        this.logError(error);

        // Prevent default browser error handling
        event.preventDefault();

        this.showUserError(error);
    }

    logError(error) {
    // Log to console with proper formatting
        // eslint-disable-next-line no-console
        console.group(`🚨 ${error.type.toUpperCase()}: ${error.message}`);
        // eslint-disable-next-line no-console
        console.error('Error Details:', error);
        // eslint-disable-next-line no-console
        console.groupEnd();

        // Send to error tracking service (Sentry, etc.)
        this.sendToTrackingService(error);

        // Store in localStorage for debugging
        this.storeError(error);
    }

    async sendToTrackingService(error) {
        // Sentry (configured via VITE_SENTRY_DSN in index.html)
        if (window.Sentry) {
            try {
                Sentry.captureException(error instanceof Error ? error : new Error(error.message));
            } catch (e) {
                console.error('Failed to send error to Sentry:', e);
            }
        }

        // Log to Firebase Firestore
        try {
            const { db, addDoc, collection } = await import('../services/firebase.js');
            await addDoc(collection(db, 'system_logs'), {
                ...error,
                timestamp: new Date().toISOString(),
                source: 'client_error_handler'
            });
        } catch (e) {
            // Silently fail to avoid infinite error loops
        }
    }

    storeError(error) {
        try {
            const storedErrors = JSON.parse(localStorage.getItem('duydodee_errors') || '[]');
            storedErrors.push(error);

            // Keep only last 50 errors
            if (storedErrors.length > 50) {
                storedErrors.shift();
            }

            localStorage.setItem('duydodee_errors', JSON.stringify(storedErrors));
        } catch (e) {
            console.error('Failed to store error:', e);
        }
    }

    showUserError(error) {
    // Don't show error UI for minor errors
        if (this.isMinorError(error)) {
            return;
        }

        // Create error notification
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-red-500/10 border border-red-500/20 text-red-400 px-6 py-4 rounded-xl backdrop-blur-xl z-[9999] shadow-2xl';
        notification.innerHTML = `
      <div class="flex items-start gap-3">
        <svg class="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <div>
          <div class="font-bold text-sm mb-1">เกิดข้อผิดพลาด</div>
          <div class="text-xs opacity-80">${this.getUserFriendlyMessage(error)}</div>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" class="text-red-400 hover:text-red-300">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    `;

        document.body.appendChild(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    getUserFriendlyMessage(error) {
    // Convert technical errors to user-friendly messages
        const messages = {
            'Network request failed': 'การเชื่อมต่อขัดข้อง กรุณาตรวจสอบอินเทอร์เน็ต',
            'Failed to fetch': 'ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่',
            'permission-denied': 'คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้',
            'unauthenticated': 'กรุณาเข้าสู่ระบบก่อนใช้งาน',
            'not-found': 'ไม่พบข้อมูลที่ค้นหา'
        };

        for (const [key, message] of Object.entries(messages)) {
            if (error.message?.toLowerCase().includes(key)) {
                return message;
            }
        }

        return error.message || 'เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่';
    }

    isMinorError(error) {
        const minorErrors = [
            'ResizeObserver loop limit exceeded',
            'Script error',
            'Non-Error promise rejection captured'
        ];

        return minorErrors.some(pattern =>
            error.message?.includes(pattern)
        );
    }

    trackPerformance() {
        if ('PerformanceObserver' in window) {
            try {
                const observer = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        // Adjust threshold: navigation events can be slower, custom measures should be faster
                        const threshold = entry.entryType === 'navigation' ? 5000 : 2000;
                        if (entry.duration > threshold) {
                            console.warn('⚡ Slow operation:', entry);
                            this.logSlowOperation(entry);
                        }
                    }
                });

                observer.observe({ entryTypes: ['measure', 'navigation'] });
            } catch (e) {
                console.error('Performance observer failed:', e);
            }
        }
    }

    logSlowOperation(entry) {
        const slowOp = {
            type: 'performance',
            name: entry.name,
            duration: entry.duration,
            startTime: entry.startTime,
            timestamp: new Date().toISOString()
        };

        this.storeError(slowOp);
    }

    logEnvironmentInfo() {
        const envInfo = {
            userAgent: navigator.userAgent,
            language: navigator.language,
            platform: navigator.platform,
            screenResolution: `${window.screen.width}x${window.screen.height}`,
            viewport: `${window.innerWidth}x${window.innerHeight}`,
            connection: navigator.connection?.effectiveType,
            memory: navigator.deviceMemory,
            cores: navigator.hardwareConcurrency
        };

        // eslint-disable-next-line no-console
        console.log('🌍 Environment Info:', envInfo);
        localStorage.setItem('duydodee_env', JSON.stringify(envInfo));
    }

    getErrors() {
        return this.errors;
    }

    clearErrors() {
        this.errors = [];
        localStorage.removeItem('duydodee_errors');
    }

    getStoredErrors() {
        try {
            return JSON.parse(localStorage.getItem('duydodee_errors') || '[]');
        } catch (e) {
            return [];
        }
    }
}

// Initialize error handler
const errorHandler = new ErrorHandler();

// Export for use in other modules
window.errorHandler = errorHandler;
export default errorHandler;
