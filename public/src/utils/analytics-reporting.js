/**
 * 📊 DUYดูDEE Analytics & Reporting System
 * User behavior analytics and reporting
 */

export const Analytics = {
    /**
     * Initialize analytics tracking
     */
    init: () => {
        Analytics.trackPageView();
        Analytics.trackDeviceInfo();
        Analytics.trackPerformance();
        Analytics.setupEventListeners();

        console.log('📊 Analytics initialized');
    },

    /**
     * Track page view
     */
    trackPageView: () => {
        const data = {
            path: window.location.pathname,
            title: document.title,
            timestamp: Date.now(),
            referrer: document.referrer
        };

        Analytics.logEvent('page_view', data);
        Analytics.saveToStorage('pageViews', data);
    },

    /**
     * Track user action
     */
    trackAction: (action, data = {}) => {
        const event = {
            action,
            ...data,
            timestamp: Date.now(),
            page: window.location.pathname
        };

        Analytics.logEvent('user_action', event);
        Analytics.saveToStorage('userActions', event);
    },

    /**
     * Track content view
     */
    trackContentView: (contentId, contentType, duration = 0) => {
        const data = {
            contentId,
            contentType,
            duration,
            timestamp: Date.now()
        };

        Analytics.logEvent('content_view', data);
        Analytics.saveToStorage('contentViews', data);
    },

    /**
     * Track search query
     */
    trackSearch: (query, resultsCount) => {
        const data = {
            query,
            resultsCount,
            timestamp: Date.now()
        };

        Analytics.logEvent('search', data);
        Analytics.saveToStorage('searches', data);
    },

    /**
     * Track error
     */
    trackError: (error, context = {}) => {
        const data = {
            message: error.message,
            stack: error.stack,
            context,
            timestamp: Date.now(),
            page: window.location.pathname
        };

        Analytics.logEvent('error', data);
        Analytics.saveToStorage('errors', data);
    },

    /**
     * Track device info
     */
    trackDeviceInfo: () => {
        const data = {
            userAgent: navigator.userAgent,
            language: navigator.language,
            platform: navigator.platform,
            screenResolution: `${window.screen.width}x${window.screen.height}`,
            viewport: `${window.innerWidth}x${window.innerHeight}`,
            connection: navigator.connection ? {
                type: navigator.connection.effectiveType,
                downlink: navigator.connection.downlink
            } : null,
            timestamp: Date.now()
        };

        Analytics.logEvent('device_info', data);
        localStorage.setItem('deviceInfo', JSON.stringify(data));
    },

    /**
     * Track performance metrics
     */
    trackPerformance: () => {
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.entryType === 'navigation') {
                        const data = {
                            loadTime: entry.loadEventEnd - entry.fetchStart,
                            domReady: entry.domContentLoadedEventEnd - entry.fetchStart,
                            firstPaint: entry.responseStart - entry.fetchStart,
                            timestamp: Date.now()
                        };
                        Analytics.logEvent('performance', data);
                        Analytics.saveToStorage('performance', data);
                    }
                }
            });

            observer.observe({ entryTypes: ['navigation'] });
        }
    },

    /**
     * Setup event listeners
     */
    setupEventListeners: () => {
        // Track clicks on interactive elements
        document.addEventListener('click', (e) => {
            const target = e.target.closest('button, a, .movie-card, .trending-card');
            if (target) {
                Analytics.trackAction('click', {
                    element: target.tagName,
                    classes: target.className,
                    id: target.id
                });
            }
        });

        // Track scroll depth
        let maxScroll = 0;
        window.addEventListener('scroll', () => {
            const scrollPercentage = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
            maxScroll = Math.max(maxScroll, scrollPercentage);

            if (scrollPercentage > 25 && scrollPercentage < 26) {
                Analytics.trackAction('scroll_depth', { depth: '25%' });
            } else if (scrollPercentage > 50 && scrollPercentage < 51) {
                Analytics.trackAction('scroll_depth', { depth: '50%' });
            } else if (scrollPercentage > 75 && scrollPercentage < 76) {
                Analytics.trackAction('scroll_depth', { depth: '75%' });
            } else if (scrollPercentage > 90 && scrollPercentage < 91) {
                Analytics.trackAction('scroll_depth', { depth: '90%' });
            }
        });

        // Track page visibility
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                Analytics.trackAction('page_hidden', {
                    duration: Date.now() - Analytics.pageStartTime
                });
            } else {
                Analytics.pageStartTime = Date.now();
                Analytics.trackAction('page_visible', {});
            }
        });

        Analytics.pageStartTime = Date.now();

        // Track errors
        window.addEventListener('error', (e) => {
            Analytics.trackError(new Error(e.message), {
                source: e.filename,
                line: e.lineno,
                column: e.colno
            });
        });

        // Track unhandled promise rejections
        window.addEventListener('unhandledrejection', (e) => {
            Analytics.trackError(new Error(e.reason), {
                type: 'unhandled_promise_rejection'
            });
        });
    },

    /**
     * Log event to console (can be sent to analytics service)
     */
    logEvent: (eventName, data) => {
        console.log(`📊 [Analytics] ${eventName}:`, data);

        // In production, send to analytics service (Firebase Analytics, GA, etc.)
        // Example: firebase.analytics().logEvent(eventName, data);
    },

    /**
     * Save to localStorage
     */
    saveToStorage: (key, data) => {
        try {
            const existing = Analytics.getFromStorage(key) || [];
            existing.push(data);

            // Keep only last 100 items to prevent storage overflow
            const limited = existing.slice(-100);

            localStorage.setItem(`analytics_${key}`, JSON.stringify(limited));
        } catch (error) {
            console.error('Failed to save analytics data:', error);
        }
    },

    /**
     * Get from localStorage
     */
    getFromStorage: (key) => {
        try {
            const data = localStorage.getItem(`analytics_${key}`);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Failed to load analytics data:', error);
            return null;
        }
    },

    /**
     * Clear analytics data
     */
    clearData: () => {
        const keys = ['pageViews', 'userActions', 'contentViews', 'searches', 'errors', 'performance'];
        keys.forEach(key => {
            localStorage.removeItem(`analytics_${key}`);
        });
        console.log('📊 Analytics data cleared');
    }
};

export const Reports = {
    /**
     * Get daily active users
     */
    getDailyActiveUsers: () => {
        const pageViews = Analytics.getFromStorage('pageViews') || [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayViews = pageViews.filter(view => {
            const viewDate = new Date(view.timestamp);
            return viewDate >= today;
        });

        const uniqueUsers = new Set(todayViews.map(view => view.path)); // Simplified
        return uniqueUsers.size;
    },

    /**
     * Get most viewed content
     */
    getMostViewedContent: (limit = 10) => {
        const contentViews = Analytics.getFromStorage('contentViews') || [];
        const viewCounts = {};

        contentViews.forEach(view => {
            const key = `${view.contentType}_${view.contentId}`;
            viewCounts[key] = (viewCounts[key] || 0) + 1;
        });

        return Object.entries(viewCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([key, count]) => ({ content: key, views: count }));
    },

    /**
     * Get search analytics
     */
    getSearchAnalytics: () => {
        const searches = Analytics.getFromStorage('searches') || [];
        const queryCounts = {};

        searches.forEach(search => {
            const query = search.query.toLowerCase();
            queryCounts[query] = (queryCounts[query] || 0) + 1;
        });

        return Object.entries(queryCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([query, count]) => ({ query, count }));
    },

    /**
     * Get error report
     */
    getErrorReport: () => {
        const errors = Analytics.getFromStorage('errors') || [];
        const errorCounts = {};

        errors.forEach(error => {
            const message = error.message;
            errorCounts[message] = (errorCounts[message] || 0) + 1;
        });

        return {
            total: errors.length,
            byMessage: Object.entries(errorCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10)
                .map(([message, count]) => ({ message, count })),
            recent: errors.slice(-5)
        };
    },

    /**
     * Get performance report
     */
    getPerformanceReport: () => {
        const performanceData = Analytics.getFromStorage('performance') || [];

        if (performanceData.length === 0) {
            return { avgLoadTime: 0, avgDomReady: 0, avgFirstPaint: 0 };
        }

        const avgLoadTime = performanceData.reduce((acc, p) => acc + p.loadTime, 0) / performanceData.length;
        const avgDomReady = performanceData.reduce((acc, p) => acc + p.domReady, 0) / performanceData.length;
        const avgFirstPaint = performanceData.reduce((acc, p) => acc + p.firstPaint, 0) / performanceData.length;

        return {
            avgLoadTime: Math.round(avgLoadTime),
            avgDomReady: Math.round(avgDomReady),
            avgFirstPaint: Math.round(avgFirstPaint),
            samples: performanceData.length
        };
    },

    /**
     * Get user action report
     */
    getUserActionReport: () => {
        const actions = Analytics.getFromStorage('userActions') || [];
        const actionCounts = {};

        actions.forEach(action => {
            const type = action.action;
            actionCounts[type] = (actionCounts[type] || 0) + 1;
        });

        return Object.entries(actionCounts)
            .sort((a, b) => b[1] - a[1])
            .map(([action, count]) => ({ action, count }));
    },

    /**
     * Generate comprehensive report
     */
    generateReport: () => {
        return {
            date: new Date().toISOString(),
            dailyActiveUsers: Reports.getDailyActiveUsers(),
            mostViewedContent: Reports.getMostViewedContent(),
            searchAnalytics: Reports.getSearchAnalytics(),
            errorReport: Reports.getErrorReport(),
            performanceReport: Reports.getPerformanceReport(),
            userActionReport: Reports.getUserActionReport()
        };
    },

    /**
     * Export report to JSON
     */
    exportReport: () => {
        const report = Reports.generateReport();
        const json = JSON.stringify(report, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-report-${Date.now()}.json`;
        a.click();

        URL.revokeObjectURL(url);
    }
};

export default { Analytics, Reports };
