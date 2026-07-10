/**
 * Error Monitoring Service
 * Centralized error tracking and reporting
 */

class ErrorMonitoringService {
  constructor() {
    this.isEnabled = import.meta.env.VITE_ENABLE_ERROR_MONITORING !== 'false';
    this.sentryDSN = import.meta.env.VITE_SENTRY_DSN;
    this.environment = import.meta.env.VITE_SENTRY_ENVIRONMENT || 'production';
    this.init();
  }

  init() {
    if (!this.isEnabled || !this.sentryDSN) {
      console.log('Error monitoring is disabled');
      return;
    }

    // Initialize Sentry (if CDN is available)
    this.initSentry();
    
    // Setup global error handlers
    this.setupGlobalHandlers();
  }

  async initSentry() {
    try {
      // Load Sentry SDK dynamically
      const script = document.createElement('script');
      script.src = 'https://browser.sentry-cdn.com/7.77.0/bundle.min.js';
      script.crossOrigin = 'anonymous';
      script.onload = () => {
        if (window.Sentry) {
          window.Sentry.init({
            dsn: this.sentryDSN,
            environment: this.environment,
            tracesSampleRate: 0.1, // 10% of transactions for performance monitoring
            replaysSessionSampleRate: 0.1, // 10% of sessions for replay
            replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors for replay
            
            beforeSend(event, hint) {
              // Filter out sensitive data
              if (event.request) {
                delete event.request.cookies;
                delete event.request.headers;
              }
              
              // Add custom context
              event.contexts = {
                ...event.contexts,
                app: {
                  name: 'DUYDODEE Premium',
                  version: import.meta.env.VITE_APP_VERSION || '1.0.0'
                }
              };
              
              return event;
            }
          });
          
          console.log('Sentry initialized successfully');
        }
      };
      script.onerror = () => {
        console.warn('Failed to load Sentry SDK');
      };
      document.head.appendChild(script);
    } catch (error) {
      console.error('Failed to initialize Sentry:', error);
    }
  }

  setupGlobalHandlers() {
    // Handle uncaught errors
    window.addEventListener('error', (event) => {
      this.captureError(event.error, {
        type: 'uncaught_error',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError(event.reason, {
        type: 'unhandled_promise_rejection',
        promise: event.promise
      });
    });

    // Handle resource loading errors
    window.addEventListener('error', (event) => {
      if (event.target !== window) {
        this.captureError(new Error(`Resource load failed: ${event.target.src || event.target.href}`), {
          type: 'resource_load_error',
          tagName: event.target.tagName,
          source: event.target.src || event.target.href
        });
      }
    }, true);
  }

  captureError(error, context = {}) {
    if (!this.isEnabled) {
      console.error('Error:', error, context);
      return;
    }

    try {
      if (window.Sentry) {
        window.Sentry.captureException(error, {
          extra: context,
          tags: {
            errorType: context.type || 'custom_error'
          }
        });
      } else {
        // Fallback to console if Sentry is not available
        console.error('Error captured:', error, context);
      }
    } catch (e) {
      console.error('Failed to capture error:', e);
    }
  }

  captureMessage(message, level = 'info', context = {}) {
    if (!this.isEnabled) {
      console.log(`[${level.toUpperCase()}] ${message}`, context);
      return;
    }

    try {
      if (window.Sentry) {
        window.Sentry.captureMessage(message, {
          level: level,
          extra: context
        });
      } else {
        console.log(`[${level.toUpperCase()}] ${message}`, context);
      }
    } catch (e) {
      console.error('Failed to capture message:', e);
    }
  }

  setUserContext(user) {
    if (!this.isEnabled || !window.Sentry) return;

    try {
      window.Sentry.setUser({
        id: user.uid,
        email: user.email,
        username: user.displayName,
        role: user.role
      });
    } catch (e) {
      console.error('Failed to set user context:', e);
    }
  }

  clearUserContext() {
    if (!this.isEnabled || !window.Sentry) return;

    try {
      window.Sentry.setUser(null);
    } catch (e) {
      console.error('Failed to clear user context:', e);
    }
  }

  addBreadcrumb(breadcrumb) {
    if (!this.isEnabled || !window.Sentry) return;

    try {
      window.Sentry.addBreadcrumb({
        ...breadcrumb,
        timestamp: Date.now() / 1000
      });
    } catch (e) {
      console.error('Failed to add breadcrumb:', e);
    }
  }

  startTransaction(name, op) {
    if (!this.isEnabled || !window.Sentry) return null;

    try {
      return window.Sentry.startTransaction({
        name,
        op
      });
    } catch (e) {
      console.error('Failed to start transaction:', e);
      return null;
    }
  }

  // Performance monitoring
  trackPerformance(metricName, value, tags = {}) {
    if (!this.isEnabled) {
      console.log(`Performance: ${metricName} = ${value}ms`, tags);
      return;
    }

    try {
      if (window.Sentry) {
        window.Sentry.metrics.timing(metricName, value, tags);
      }
    } catch (e) {
      console.error('Failed to track performance:', e);
    }
  }

  // Custom error types
  handleAuthError(error) {
    const authErrors = {
      'auth/user-not-found': 'ไม่พบบัญชีผู้ใช้',
      'auth/wrong-password': 'รหัสผ่านไม่ถูกต้อง',
      'auth/email-already-in-use': 'อีเมลนี้ถูกใช้งานแล้ว',
      'auth/weak-password': 'รหัสผ่านไม่ปลอดภัย',
      'auth/invalid-email': 'รูปแบบอีเมลไม่ถูกต้อง',
      'auth/too-many-requests': 'ขอรหัสผ่านมากเกินไป กรุณาลองใหม่ภายหลัง',
      'auth/user-disabled': 'บัญชีผู้ใช้ถูกระงับ'
    };

    const errorMessage = authErrors[error.code] || error.message || 'เกิดข้อผิดพลาดในการยืนยันตัวตน';
    
    this.captureError(error, {
      type: 'auth_error',
      code: error.code,
      customMessage: errorMessage
    });

    return errorMessage;
  }

  handleNetworkError(error) {
    const networkErrors = {
      'NETWORK_ERROR': 'ไม่สามารถเชื่อมต่ออินเทอร์เน็ตได้',
      'TIMEOUT_ERROR': 'การเชื่อมต่อหมดเวลา',
      'SERVER_ERROR': 'เซิร์ฟเวอร์ขัดข้อง'
    };

    const errorMessage = networkErrors[error.code] || error.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ';
    
    this.captureError(error, {
      type: 'network_error',
      code: error.code,
      customMessage: errorMessage
    });

    return errorMessage;
  }

  handleContentError(error) {
    const contentErrors = {
      'permission-denied': 'ไม่มีสิทธิ์เข้าถึงเนื้อหา',
      'not-found': 'ไม่พบเนื้อหา',
      'unavailable': 'เนื้อหาไม่พร้อมใช้งาน'
    };

    const errorMessage = contentErrors[error.code] || error.message || 'เกิดข้อผิดพลาดในการโหลดเนื้อหา';
    
    this.captureError(error, {
      type: 'content_error',
      code: error.code,
      customMessage: errorMessage
    });

    return errorMessage;
  }
}

// Create singleton instance
const errorMonitoring = new ErrorMonitoringService();

export default errorMonitoring;
