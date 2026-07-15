/**
 * 🛡️ DUYDODEE PREMIUM - ERROR HANDLING SYSTEM
 * Centralized error handling with logging, monitoring, and user feedback
 */

import { ENV } from '../config/env-config.js';

export class AppError extends Error {
  constructor(message, code = 'APP_ERROR', details = null) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

export class NetworkError extends AppError {
  constructor(message, details = null) {
    super(message, 'NETWORK_ERROR', details);
    this.name = 'NetworkError';
  }
}

export class AuthError extends AppError {
  constructor(message, details = null) {
    super(message, 'AUTH_ERROR', details);
    this.name = 'AuthError';
  }
}

export class ValidationError extends AppError {
  constructor(message, details = null) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class FirestoreError extends AppError {
  constructor(message, details = null) {
    super(message, 'FIRESTORE_ERROR', details);
    this.name = 'FirestoreError';
  }
}

/**
 * Error Handler Class
 */
export class ErrorHandler {
  constructor() {
    this.errorQueue = [];
    this.maxQueueSize = 50;
  }

  /**
   * Handle error with logging and monitoring
   */
  handle(error, context = {}) {
    // Add timestamp and context
    const enrichedError = {
      error: error instanceof Error ? error : new Error(String(error)),
      context,
      timestamp: new Date().toISOString(),
      environment: ENV.SENTRY.ENVIRONMENT
    };

    // Log to console in development
    if (ENV.FEATURES.DEBUG) {
      console.error('🚨 Error Handler:', enrichedError);
    }

    // Add to queue for monitoring
    this.addToQueue(enrichedError);

    // Send to monitoring service if enabled
    if (ENV.SENTRY.ENABLED && typeof window !== 'undefined') {
      this.sendToMonitoring(enrichedError);
    }

    // Return user-friendly message
    return this.getUserMessage(enrichedError.error);
  }

  /**
   * Add error to queue
   */
  addToQueue(errorObj) {
    this.errorQueue.push(errorObj);
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift();
    }
  }

  /**
   * Get user-friendly error message
   */
  getUserMessage(error) {
    if (error instanceof NetworkError) {
      return 'การเชื่อมต่อขัดข้อง กรุณาตรวจสอบอินเทอร์เน็ตและลองใหม่';
    }
    if (error instanceof AuthError) {
      return 'การยืนยันตัวตนผิดพลาด กรุณาล็อกอินใหม่';
    }
    if (error instanceof ValidationError) {
      return 'ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่';
    }
    if (error instanceof FirestoreError) {
      return 'การเข้าถึงข้อมูลผิดพลาด กรุณาลองใหม่';
    }
    return 'เกิดข้อผิดพลาด กรุณาลองใหม่ภายหลัง';
  }

  /**
   * Send to monitoring service (Sentry)
   */
  sendToMonitoring(errorObj) {
    // This would integrate with Sentry
    // For now, we'll store in localStorage for debugging
    try {
      const errorLogs = JSON.parse(localStorage.getItem('error_logs') || '[]');
      errorLogs.push(errorObj);
      // Keep only last 100 errors
      if (errorLogs.length > 100) {
        errorLogs.shift();
      }
      localStorage.setItem('error_logs', JSON.stringify(errorLogs));
    } catch (e) {
      console.error('Failed to store error logs:', e);
    }
  }

  /**
   * Get error statistics
   */
  getErrorStats() {
    const stats = {
      total: this.errorQueue.length,
      byType: {},
      recent: this.errorQueue.slice(-10)
    };

    this.errorQueue.forEach((err) => {
      const type = err.error.name || 'Unknown';
      stats.byType[type] = (stats.byType[type] || 0) + 1;
    });

    return stats;
  }

  /**
   * Clear error queue
   */
  clearQueue() {
    this.errorQueue = [];
  }
}

// Global error handler instance
export const errorHandler = new ErrorHandler();

/**
 * Global error handler for unhandled errors
 */
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    errorHandler.handle(event.error, {
      type: 'unhandled',
      message: event.message,
      filename: event.filename,
      lineno: event.lineno
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    errorHandler.handle(event.reason, {
      type: 'unhandled_promise',
      promise: event.promise
    });
  });
}

/**
 * Async error wrapper
 */
export async function withErrorHandling(asyncFn, context = {}) {
  try {
    return await asyncFn();
  } catch (error) {
    errorHandler.handle(error, context);
    throw error;
  }
}

/**
 * Retry logic for failed operations
 */
export async function withRetry(asyncFn, maxRetries = 3, delay = 1000) {
  let lastError;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await asyncFn();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }
  throw lastError;
}
