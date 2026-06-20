/**
 * 📊 DUYดูDEE Enhanced Analytics System
 * ระบบ analytics ขั้นสูงพร้อมการติดตามพฤติกรรมผู้ใช้แบบครบถ้วน
 */

/**
 * Enhanced Analytics Service
 */
export class EnhancedAnalytics {
    constructor() {
        this.events = [];
        this.sessionId = this.generateSessionId();
        this.userId = null;
        this.userProperties = {};
        this.buffer = [];
        this.flushInterval = 30000; // 30 seconds
        this.maxBufferSize = 100;
    }

    /**
     * Generate unique session ID
     */
    generateSessionId() {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Initialize analytics with user data
     */
    initialize(userId, userProperties = {}) {
        this.userId = userId;
        this.userProperties = userProperties;
        this.startBufferFlush();
        this.trackSessionStart();
    }

    /**
     * Track custom event
     */
    track(eventName, properties = {}) {
        const event = {
            eventName,
            userId: this.userId,
            sessionId: this.sessionId,
            timestamp: new Date().toISOString(),
            properties: {
                ...this.userProperties,
                ...properties,
                url: window.location.href,
                userAgent: navigator.userAgent,
                screen: `${screen.width}x${screen.height}`,
                language: navigator.language
            }
        };

        this.events.push(event);
        this.buffer.push(event);

        // Flush immediately for critical events
        const criticalEvents = ['error', 'page_view', 'conversion'];
        if (criticalEvents.includes(eventName)) {
            this.flush();
        } else if (this.buffer.length >= this.maxBufferSize) {
            this.flush();
        }

        // console.log('Analytics Event:', eventName, properties);
    }

    /**
     * Track page view
     */
    trackPageView(pageName, pageProperties = {}) {
        this.track('page_view', {
            pageName,
            ...pageProperties,
            referrer: document.referrer,
            path: window.location.pathname
        });
    }

    /**
     * Track user interaction
     */
    trackInteraction(elementType, action, elementId = null) {
        this.track('interaction', {
            elementType,
            action,
            elementId,
            page: window.location.pathname
        });
    }

    /**
     * Track video playback
     */
    trackVideoPlayback(contentId, contentType, action, progress = null) {
        this.track('video_playback', {
            contentId,
            contentType, // 'movie' or 'series'
            action, // 'play', 'pause', 'seek', 'complete', 'error'
            progress, // 0-100 percentage
            timestamp: Date.now()
        });
    }

    /**
     * Track search query
     */
    trackSearch(query, resultsCount = 0) {
        this.track('search', {
            query,
            resultsCount,
            hasResults: resultsCount > 0
        });
    }

    /**
     * Track user engagement metrics
     */
    trackEngagement(duration, scrollDepth = 0) {
        this.track('engagement', {
            duration, // session duration in seconds
            scrollDepth, // percentage scrolled
            interactions: this.events.filter(e => e.eventName === 'interaction').length
        });
    }

    /**
     * Track conversion events
     */
    trackConversion(conversionType, value = 0, currency = 'THB') {
        this.track('conversion', {
            conversionType, // 'vip_subscription', 'free_trial', etc.
            value,
            currency,
            timestamp: Date.now()
        });
    }

    /**
     * Track error events
     */
    trackError(errorType, errorMessage, stackTrace = null) {
        this.track('error', {
            errorType,
            errorMessage,
            stackTrace,
            page: window.location.pathname,
            timestamp: Date.now()
        });
    }

    /**
     * Track admin actions
     */
    trackAdminAction(actionType, targetResource, details = {}) {
        this.track('admin_action', {
            actionType, // 'add', 'edit', 'delete', 'approve', 'reject'
            targetResource, // 'movie', 'series', 'user', 'payment', etc.
            ...details,
            timestamp: Date.now()
        });
    }

    /**
     * Track API performance
     */
    trackApiPerformance(endpoint, duration, status, method = 'GET') {
        this.track('api_performance', {
            endpoint,
            duration, // in milliseconds
            status,
            method,
            timestamp: Date.now()
        });
    }

    /**
     * Track content preferences
     */
    trackContentPreference(category, contentType) {
        this.track('content_preference', {
            category,
            contentType,
            timestamp: Date.now()
        });
    }

    /**
     * Track device and browser info
     */
    trackDeviceInfo() {
        this.track('device_info', {
            deviceType: this.getDeviceType(),
            browser: this.getBrowserInfo(),
            os: this.getOSInfo(),
            connection: this.getConnectionInfo(),
            screen: {
                width: screen.width,
                height: screen.height,
                pixelRatio: window.devicePixelRatio
            },
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            }
        });
    }

    /**
     * Track session start
     */
    trackSessionStart() {
        this.track('session_start', {
            sessionId: this.sessionId,
            timestamp: Date.now()
        });
        this.trackDeviceInfo();
    }

    /**
     * Track session end
     */
    trackSessionEnd() {
        this.flush();
        this.track('session_end', {
            sessionId: this.sessionId,
            duration: this.getSessionDuration(),
            eventsCount: this.events.length,
            timestamp: Date.now()
        });
    }

    /**
     * Get session duration
     */
    getSessionDuration() {
        const sessionEvents = this.events.filter(e =>
            e.eventName === 'session_start' || e.eventName === 'session_end'
        );

        if (sessionEvents.length >= 2) {
            const start = new Date(sessionEvents[0].timestamp).getTime();
            const end = new Date(sessionEvents[sessionEvents.length - 1].timestamp).getTime();
            return (end - start) / 1000; // in seconds
        }

        return null;
    }

    /**
     * Flush events to backend
     */
    async flush() {
        if (this.buffer.length === 0) {
            return;
        }

        const eventsToSend = [...this.buffer];
        this.buffer = [];

        try {
            // Send to Firebase Analytics or custom endpoint
            await this.sendToBackend(eventsToSend);
            // console.log('Analytics flushed:', eventsToSend.length, 'events');
        } catch (error) {
            console.error('Analytics flush failed:', error);
            // Re-add to buffer on failure
            this.buffer = [...eventsToSend, ...this.buffer];
        }
    }

    /**
     * Send events to backend
     */
    async sendToBackend(events) {
        try {
            const { db, collection, addDoc, serverTimestamp } = await import('../services/firebase.js');

            for (const event of events) {
                await addDoc(collection(db, 'analytics_events'), {
                    ...event,
                    createdAt: serverTimestamp()
                });
            }
        } catch (error) {
            console.error('Failed to send analytics to Firebase:', error);
            throw error;
        }
    }

    /**
     * Start automatic buffer flush
     */
    startBufferFlush() {
        setInterval(() => {
            this.flush();
        }, this.flushInterval);
    }

    /**
     * Get device type
     */
    getDeviceType() {
        const width = window.innerWidth;
        if (width < 768) {
            return 'mobile';
        }
        if (width < 1024) {
            return 'tablet';
        }
        return 'desktop';
    }

    /**
     * Get browser info
     */
    getBrowserInfo() {
        const ua = navigator.userAgent;

        if (ua.includes('Chrome')) {
            return 'Chrome';
        }
        if (ua.includes('Firefox')) {
            return 'Firefox';
        }
        if (ua.includes('Safari')) {
            return 'Safari';
        }
        if (ua.includes('Edge')) {
            return 'Edge';
        }
        if (ua.includes('Opera')) {
            return 'Opera';
        }

        return 'Unknown';
    }

    /**
     * Get OS info
     */
    getOSInfo() {
        const ua = navigator.userAgent;

        if (ua.includes('Windows')) {
            return 'Windows';
        }
        if (ua.includes('Mac')) {
            return 'macOS';
        }
        if (ua.includes('Linux')) {
            return 'Linux';
        }
        if (ua.includes('Android')) {
            return 'Android';
        }
        if (ua.includes('iOS')) {
            return 'iOS';
        }

        return 'Unknown';
    }

    /**
     * Get connection info
     */
    getConnectionInfo() {
        if (navigator.connection) {
            return {
                type: navigator.connection.effectiveType,
                downlink: navigator.connection.downlink,
                rtt: navigator.connection.rtt,
                saveData: navigator.connection.saveData
            };
        }
        return null;
    }

    /**
     * Get analytics summary
     */
    getAnalyticsSummary() {
        const summary = {
            totalEvents: this.events.length,
            sessionDuration: this.getSessionDuration(),
            eventsByType: {},
            topPages: {},
            userActions: {},
            errors: []
        };

        // Group events by type
        this.events.forEach(event => {
            summary.eventsByType[event.eventName] = (summary.eventsByType[event.eventName] || 0) + 1;

            if (event.properties.path) {
                summary.topPages[event.properties.path] = (summary.topPages[event.properties.path] || 0) + 1;
            }

            if (event.eventName === 'interaction') {
                const action = `${event.properties.elementType}_${event.properties.action}`;
                summary.userActions[action] = (summary.userActions[action] || 0) + 1;
            }

            if (event.eventName === 'error') {
                summary.errors.push({
                    type: event.properties.errorType,
                    message: event.properties.errorMessage,
                    count: (summary.errors.find(e => e.type === event.properties.errorType)?.count || 0) + 1
                });
            }
        });

        return summary;
    }

    /**
     * Export analytics data
     */
    exportAnalytics(format = 'json') {
        const data = {
            sessionId: this.sessionId,
            userId: this.userId,
            events: this.events,
            summary: this.getAnalyticsSummary(),
            exportedAt: new Date().toISOString()
        };

        if (format === 'json') {
            return JSON.stringify(data, null, 2);
        } else if (format === 'csv') {
            return this.convertToCSV(data.events);
        }

        return data;
    }

    /**
     * Convert events to CSV
     */
    convertToCSV(events) {
        if (events.length === 0) {
            return '';
        }

        const headers = Object.keys(events[0]);
        const csvRows = [headers.join(',')];

        events.forEach(event => {
            const row = headers.map(header => {
                const value = event[header];
                if (typeof value === 'object') {
                    return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
                }
                return `"${String(value).replace(/"/g, '""')}"`;
            });
            csvRows.push(row.join(','));
        });

        return csvRows.join('\n');
    }
}

/**
 * Create singleton instance
 */
const analytics = new EnhancedAnalytics();

/**
 * Auto-initialize page tracking
 */
export function initializeAnalytics() {
    // Track page view when DOM is ready
    if (document.readyState === 'complete') {
        analytics.trackPageView(window.location.pathname);
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            analytics.trackPageView(window.location.pathname);
        });
    }

    // Track session end on page unload
    window.addEventListener('beforeunload', () => {
        analytics.trackSessionEnd();
    });

    // Track scroll depth
    let maxScrollDepth = 0;
    window.addEventListener('scroll', () => {
        const scrollDepth = Math.round(
            (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
        );
        if (scrollDepth > maxScrollDepth) {
            maxScrollDepth = scrollDepth;
            // Track at 25%, 50%, 75%, 100%
            if ([25, 50, 75, 100].includes(scrollDepth)) {
                analytics.track('scroll_milestone', {
                    depth: scrollDepth,
                    page: window.location.pathname
                });
            }
        }
    });

    // Track engagement periodically
    const sessionStartTime = Date.now();
    setInterval(() => {
        const duration = Math.floor((Date.now() - sessionStartTime) / 1000);
        analytics.trackEngagement(duration, maxScrollDepth);
    }, 60000); // Every minute

    // Track errors
    window.addEventListener('error', (event) => {
        analytics.trackError(
            'javascript_error',
            event.message,
            event.error?.stack
        );
    });

    // Track unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
        analytics.trackError(
            'promise_rejection',
            event.reason?.message || 'Unknown promise rejection',
            event.reason?.stack
        );
    });
}

export default analytics;
