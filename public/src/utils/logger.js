/**
 * 📝 DUYดูDEE Logger Utility
 * Centralized logging system for production-ready applications
 */

class Logger {
    constructor() {
        this.isDevelopment = this.checkDevelopmentMode();
        this.logs = [];
        this.maxLogs = 100;
    }

    /**
     * Check if running in development mode
     */
    checkDevelopmentMode() {
        return import.meta.env.DEV ||
               import.meta.env.MODE === 'development' ||
               window.location.hostname === 'localhost' ||
               window.location.hostname === '127.0.0.1';
    }

    /**
     * Log debug messages (development only)
     */
    debug(...args) {
        if (this.isDevelopment) {
            // console.log('[DEBUG]', ...args);
        }
        this.addLog('debug', args);
    }

    /**
     * Log info messages (development only)
     */
    info(...args) {
        if (this.isDevelopment) {
            // console.info('[INFO]', ...args);
        }
        this.addLog('info', args);
    }

    /**
     * Log warning messages (always shown)
     */
    warn(...args) {
        console.warn('[WARN]', ...args);
        this.addLog('warn', args);
    }

    /**
     * Log error messages (always shown)
     */
    error(...args) {
        console.error('[ERROR]', ...args);
        this.addLog('error', args);
        this.sendToMonitoring('error', args);
    }

    /**
     * Log analytics events (development only)
     */
    analytics(...args) {
        if (this.isDevelopment) {
            // console.log('[ANALYTICS]', ...args);
        }
        this.addLog('analytics', args);
    }

    /**
     * Log performance metrics (development only)
     */
    performance(...args) {
        if (this.isDevelopment) {
            // console.log('[PERFORMANCE]', ...args);
        }
        this.addLog('performance', args);
    }

    /**
     * Add log to internal storage
     */
    addLog(level, args) {
        this.logs.push({
            level,
            message: args.map(arg =>
                typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
            ).join(' '),
            timestamp: new Date().toISOString(),
            url: window.location.href
        });

        // Keep only recent logs
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }
    }

    /**
     * Send critical logs to monitoring service
     */
    sendToMonitoring(level, args) {
        if (level === 'error' || level === 'warn') {
            try {
                // Send to error tracking service (Sentry, Firebase, etc.)
                if (window.Sentry) {
                    window.Sentry.captureException(args[0] instanceof Error ? args[0] : new Error(args[0]));
                }
            } catch (error) {
                // Fail silently to avoid infinite loops
            }
        }
    }

    /**
     * Get all logs
     */
    getLogs() {
        return this.logs;
    }

    /**
     * Clear logs
     */
    clearLogs() {
        this.logs = [];
    }

    /**
     * Export logs for debugging
     */
    exportLogs() {
        const dataStr = JSON.stringify(this.logs, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `duydodee-logs-${Date.now()}.json`;
        link.click();

        URL.revokeObjectURL(url);
    }
}

// Create singleton instance
const logger = new Logger();

// Export for use in other modules
export default logger;
