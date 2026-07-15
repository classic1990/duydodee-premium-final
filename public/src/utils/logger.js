/**
 * 📝 DUYDODEE PREMIUM - LOGGING SYSTEM
 * Centralized logging with different levels and production support
 */

import { ENV } from '../config/env-config.js';

export const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  NONE: 4
};

class Logger {
  constructor() {
    this.currentLevel = this._getLogLevel();
    this.logs = [];
    this.maxLogs = 100;
  }

  _getLogLevel() {
    if (ENV.FEATURES.DEBUG) {
      return LOG_LEVELS.DEBUG;
    }
    if (ENV.SENTRY.ENVIRONMENT === 'production') {
      return LOG_LEVELS.WARN;
    }
    return LOG_LEVELS.INFO;
  }

  _shouldLog(level) {
    return level >= this.currentLevel;
  }

  _formatMessage(level, message, context = {}) {
    const timestamp = new Date().toISOString();
    return {
      timestamp,
      level,
      message,
      context,
      environment: ENV.SENTRY.ENVIRONMENT
    };
  }

  _storeLog(logEntry) {
    this.logs.push(logEntry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
  }

  debug(message, context = {}) {
    if (this._shouldLog(LOG_LEVELS.DEBUG)) {
      const logEntry = this._formatMessage('DEBUG', message, context);
      this._storeLog(logEntry);
      // eslint-disable-next-line no-console
      console.debug(`[DEBUG] ${message}`, context);
    }
  }

  info(message, context = {}) {
    if (this._shouldLog(LOG_LEVELS.INFO)) {
      const logEntry = this._formatMessage('INFO', message, context);
      this._storeLog(logEntry);
      // eslint-disable-next-line no-console
      console.info(`[INFO] ${message}`, context);
    }
  }

  warn(message, context = {}) {
    if (this._shouldLog(LOG_LEVELS.WARN)) {
      const logEntry = this._formatMessage('WARN', message, context);
      this._storeLog(logEntry);
      // eslint-disable-next-line no-console
      console.warn(`[WARN] ${message}`, context);
    }
  }

  error(message, context = {}) {
    if (this._shouldLog(LOG_LEVELS.ERROR)) {
      const logEntry = this._formatMessage('ERROR', message, context);
      this._storeLog(logEntry);
      // eslint-disable-next-line no-console
      console.error(`[ERROR] ${message}`, context);
    }
  }

  getLogs() {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
  }

  setLevel(level) {
    if (Object.values(LOG_LEVELS).includes(level)) {
      this.currentLevel = level;
    }
  }
}

// Global logger instance
export const logger = new Logger();

// Convenience exports
export const debug = (message, context) => logger.debug(message, context);
export const info = (message, context) => logger.info(message, context);
export const warn = (message, context) => logger.warn(message, context);
export const error = (message, context) => logger.error(message, context);
