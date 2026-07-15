/**
 * 🔒 DUYDODEE PREMIUM - SECURITY CONFIGURATION
 * Security settings and best practices
 */

import { ENV } from './env-config.js';

export const SECURITY_CONFIG = {
  // Content Security Policy
  CSP: {
    'default-src': "'self'",
    'script-src':
      "'self' 'unsafe-inline' 'unsafe-eval' https://www.gstatic.com https://www.googletagmanager.com",
    'style-src': "'self' 'unsafe-inline'",
    'img-src': "'self' data: https: http:",
    'font-src': "'self' data:",
    'connect-src': "'self' https://*.firebaseio.com https://*.googleapis.com https://*.gstatic.com",
    'media-src': "'self' https:",
    'object-src': "'none'",
    'frame-src': "'none'",
    'base-uri': "'self'",
    'form-action': "'self'",
    'frame-ancestors': "'none'",
    'report-uri': ENV.SENTRY.ENABLED ? `${ENV.SENTRY.DSN}/api/security/csp-report` : ''
  },

  // Rate Limiting
  RATE_LIMITING: {
    MAX_REQUESTS_PER_MINUTE: 60,
    MAX_LOGIN_ATTEMPTS: 5,
    LOCKOUT_DURATION: 15 * 60 * 1000 // 15 minutes
  },

  // Session Management
  SESSION: {
    TIMEOUT: 30 * 60 * 1000, // 30 minutes
    REFRESH_THRESHOLD: 5 * 60 * 1000 // 5 minutes before expiry
  },

  // Password Policy
  PASSWORD_POLICY: {
    MIN_LENGTH: 8,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBER: true,
    REQUIRE_SPECIAL: false,
    MAX_AGE: 90 * 24 * 60 * 60 * 1000 // 90 days
  },

  // File Upload Security
  FILE_UPLOAD: {
    MAX_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp', '.gif']
  },

  // API Security
  API: {
    TIMEOUT: 30000,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000
  },

  // XSS Protection
  XSS_PROTECTION: {
    ENABLED: true,
    SANITIZE_INPUT: true,
    ESCAPE_OUTPUT: true
  },

  // CSRF Protection
  CSRF: {
    ENABLED: true,
    TOKEN_NAME: 'csrf_token',
    HEADER_NAME: 'X-CSRF-Token'
  }
};

/**
 * Security Headers Configuration
 */
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
};

/**
 * Initialize security measures
 */
export function initializeSecurity() {
  // Apply security headers (client-side equivalent)
  applySecurityHeaders();

  // Initialize CSP
  if (typeof window !== 'undefined') {
    setupCSP();
  }

  // Initialize CSRF protection
  if (SECURITY_CONFIG.CSRF.ENABLED) {
    setupCSRF();
  }
}

/**
 * Apply security headers
 */
function applySecurityHeaders() {
  // Note: Most security headers must be set server-side
  // This is for client-side security measures
  if (typeof window !== 'undefined') {
    // Prevent clickjacking
    if (window.top !== window.self) {
      window.top.location = window.self.location;
    }
  }
}

/**
 * Setup Content Security Policy
 */
function setupCSP() {
  // CSP is typically set via server headers
  // This is a placeholder for any client-side CSP handling
  console.log('🔒 CSP initialized');
}

/**
 * Setup CSRF protection
 */
function setupCSRF() {
  // Generate CSRF token for session
  if (typeof window !== 'undefined' && !sessionStorage.getItem(SECURITY_CONFIG.CSRF.TOKEN_NAME)) {
    const token = generateCSRFToken();
    sessionStorage.setItem(SECURITY_CONFIG.CSRF.TOKEN_NAME, token);
  }
}

/**
 * Generate CSRF token
 */
function generateCSRFToken() {
  const array = new Uint32Array(4);
  crypto.getRandomValues(array);
  return Array.from(array, (dec) => dec.toString(16)).join('');
}

/**
 * Get CSRF token
 */
export function getCSRFToken() {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem(SECURITY_CONFIG.CSRF.TOKEN_NAME);
  }
  return null;
}

/**
 * Validate CSRF token
 */
export function validateCSRFToken(token) {
  const storedToken = getCSRFToken();
  return storedToken && token === storedToken;
}

/**
 * Sanitize HTML to prevent XSS
 */
export function sanitizeHTML(html) {
  if (!html || typeof html !== 'string') {
    return '';
  }

  const temp = document.createElement('div');
  temp.textContent = html;
  return temp.innerHTML;
}

/**
 * Validate file upload
 */
export function validateFileUpload(file) {
  const config = SECURITY_CONFIG.FILE_UPLOAD;

  // Check file size
  if (file.size > config.MAX_SIZE) {
    throw new Error(`File size exceeds maximum limit of ${config.MAX_SIZE / 1024 / 1024}MB`);
  }

  // Check file type
  if (!config.ALLOWED_TYPES.includes(file.type)) {
    throw new Error(`File type ${file.type} is not allowed`);
  }

  // Check file extension
  const extension = '.' + file.name.split('.').pop().toLowerCase();
  if (!config.ALLOWED_EXTENSIONS.includes(extension)) {
    throw new Error(`File extension ${extension} is not allowed`);
  }

  return true;
}

/**
 * Check password strength
 */
export function checkPasswordStrength(password) {
  const policy = SECURITY_CONFIG.PASSWORD_POLICY;
  const errors = [];

  if (password.length < policy.MIN_LENGTH) {
    errors.push(`Password must be at least ${policy.MIN_LENGTH} characters`);
  }

  if (policy.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (policy.REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (policy.REQUIRE_NUMBER && !/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (policy.REQUIRE_SPECIAL && !/[^A-Za-z0-9]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    valid: errors.length === 0,
    errors,
    strength: calculatePasswordStrength(password)
  };
}

/**
 * Calculate password strength (0-100)
 */
function calculatePasswordStrength(password) {
  let strength = 0;

  // Length contribution
  strength += Math.min(password.length * 4, 40);

  // Character variety
  if (/[A-Z]/.test(password)) {
    strength += 10;
  }
  if (/[a-z]/.test(password)) {
    strength += 10;
  }
  if (/[0-9]/.test(password)) {
    strength += 10;
  }
  if (/[^A-Za-z0-9]/.test(password)) {
    strength += 15;
  }

  // Bonus for length > 12
  if (password.length > 12) {
    strength += 15;
  }

  return Math.min(strength, 100);
}

/**
 * Check rate limit
 */
export class RateLimiter {
  constructor(maxRequests, windowMs) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = [];
  }

  /**
   * Check if request is allowed
   */
  checkRequest(identifier) {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    // Clean old requests
    this.requests = this.requests.filter(
      (req) => req.identifier === identifier && req.timestamp > windowStart
    );

    // Check limit
    if (this.requests.length >= this.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: this.requests[0].timestamp + this.windowMs
      };
    }

    // Add request
    this.requests.push({ identifier, timestamp: now });

    return {
      allowed: true,
      remaining: this.maxRequests - this.requests.length,
      resetTime: now + this.windowMs
    };
  }

  /**
   * Reset rate limit for identifier
   */
  reset(identifier) {
    this.requests = this.requests.filter((req) => req.identifier !== identifier);
  }
}

// Global rate limiter instance
export const rateLimiter = new RateLimiter(
  SECURITY_CONFIG.RATE_LIMITING.MAX_REQUESTS_PER_MINUTE,
  60 * 1000 // 1 minute
);

// Initialize security on load
if (typeof window !== 'undefined') {
  initializeSecurity();
}
