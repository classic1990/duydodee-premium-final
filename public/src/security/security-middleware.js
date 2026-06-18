/**
 * 🛡️ DUYดูDEE Security Middleware
 * ระบบ middleware สำหรับความปลอดภัยขั้นสูง
 */

import {
    sanitizeHTML,
    isSafeURL,
    isSafeEmail,
    checkRateLimit,
    isBot,
    maskSensitiveData,
    isAllowedOrigin
} from './security-utils.js';

/**
 * Security middleware class
 */
export class SecurityMiddleware {
    constructor() {
        this.rateLimits = new Map();
        this.csrfTokens = new Map();
    }

    /**
     * ตรวจสอบและ sanitize user input
     */
    static sanitizeInput(input, type = 'text') {
        if (!input) return '';

        const sanitized = String(input).trim();

        switch (type) {
            case 'html':
                return sanitizeHTML(sanitized);
            case 'url':
                return isSafeURL(sanitized) ? sanitized : '';
            case 'email':
                return isSafeEmail(sanitized) ? sanitized : '';
            case 'number':
                return sanitized.replace(/[^0-9.-]/g, '');
            default:
                return sanitized.replace(/[<>]/g, '');
        }
    }

    /**
     * ตรวจสอบ rate limit
     */
    static checkRateLimit(identifier, maxRequests = 100, windowMs = 60000) {
        return checkRateLimit(identifier, maxRequests, windowMs);
    }

    /**
     * ตรวจสอบ bot traffic
     */
    static checkBot(userAgent) {
        if (isBot(userAgent)) {
            console.warn('Bot traffic detected:', userAgent);
            return true;
        }
        return false;
    }

    /**
     * สร้างและเก็บ CSRF token
     */
    generateCSRFToken(identifier) {
        const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
        this.csrfTokens.set(identifier, {
            token,
            createdAt: Date.now(),
            expiresAt: Date.now() + 3600000 // 1 hour
        });
        return token;
    }

    /**
     * ตรวจสอบ CSRF token
     */
    verifyCSRFToken(identifier, token) {
        const stored = this.csrfTokens.get(identifier);
        
        if (!stored || stored.token !== token) {
            return false;
        }

        if (Date.now() > stored.expiresAt) {
            this.csrfTokens.delete(identifier);
            return false;
        }

        return true;
    }

    /**
     * ตรวจสอบ content security
     */
    static checkContentSecurity(data) {
        const securityChecks = {
            hasXSS: false,
            hasSQLInjection: false,
            hasMaliciousScript: false
        };

        // XSS patterns
        const xssPatterns = [
            /<script[^>]*>.*?<\/script>/gi,
            /javascript:/gi,
            /on\w+\s*=/gi,
            /<iframe[^>]*>/gi
        ];

        // SQL injection patterns
        const sqlPatterns = [
            /('|(O|o)r(|1=1))/gi,
            /union.*select/gi,
            /drop.*table/gi,
            /insert.*into/gi
        ];

        // Malicious script patterns
        const maliciousPatterns = [
            /eval\s*\(/gi,
            /document\.cookie/gi,
            /window\.location/gi,
            /atob\s*\(/gi
        ];

        const dataStr = String(data);

        securityChecks.hasXSS = xssPatterns.some(pattern => pattern.test(dataStr));
        securityChecks.hasSQLInjection = sqlPatterns.some(pattern => pattern.test(dataStr));
        securityChecks.hasMaliciousScript = maliciousPatterns.some(pattern => pattern.test(dataStr));

        return securityChecks;
    }

    /**
     * Log security events
     */
    static logSecurityEvent(eventType, details) {
        const event = {
            timestamp: new Date().toISOString(),
            type: eventType,
            details: {
                ...details,
                // Mask sensitive data
                email: details.email ? maskSensitiveData(details.email) : undefined,
                ip: details.ip ? maskSensitiveData(details.ip) : undefined
            }
        };

        console.warn('Security Event:', event);

        // ส่งไปยัง Firebase/Logging service ใน production
        if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
            this.sendSecurityLogToFirebase(event);
        }
    }

    /**
     * ส่ง security log ไปยัง Firebase
     */
    static async sendSecurityLogToFirebase(event) {
        try {
            // Import firebase dynamically to avoid circular dependencies
            const { db, collection, addDoc, serverTimestamp } = await import('../services/firebase.js');
            await addDoc(collection(db, 'security_logs'), {
                ...event,
                createdAt: serverTimestamp()
            });
        } catch (error) {
            console.error('Failed to send security log to Firebase:', error);
        }
    }

    /**
     * ตรวจสอบ session timeout
     */
    static checkSessionTimeout(lastActivity, timeoutMs = 1800000) { // 30 minutes
        if (!lastActivity) return true;
        return Date.now() - lastActivity > timeoutMs;
    }

    /**
     * ตรวจสอบและแจ้งเตือน suspicious activity
     */
    static checkSuspiciousActivity(userActivity) {
        const suspiciousPatterns = [
            {
                name: 'Multiple Failed Logins',
                check: (activity) => activity.failedLogins > 5,
                severity: 'high'
            },
            {
                name: 'Rapid Account Creation',
                check: (activity) => activity.accountsCreated > 3 && activity.timeWindow < 60000,
                severity: 'medium'
            },
            {
                name: 'Unusual Access Pattern',
                check: (activity) => activity.accessLocations.length > 5,
                severity: 'medium'
            },
            {
                name: 'Privilege Escalation Attempt',
                check: (activity) => activity.adminAccessAttempts > 3,
                severity: 'critical'
            }
        ];

        const detected = [];

        for (const pattern of suspiciousPatterns) {
            if (pattern.check(userActivity)) {
                detected.push({
                    pattern: pattern.name,
                    severity: pattern.severity,
                    timestamp: new Date().toISOString()
                });
            }
        }

        if (detected.length > 0) {
            this.logSecurityEvent('suspicious_activity', {
                patterns: detected,
                userActivity: maskSensitiveData(JSON.stringify(userActivity))
            });
        }

        return detected;
    }

    /**
     * Security headers สำหรับ API requests
     */
    static getSecurityHeaders() {
        return {
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
            'X-XSS-Protection': '1; mode=block',
            'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
            'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"
        };
    }

    /**
     * ตรวจสอบ IP reputation
     */
    static async checkIPReputation(ip) {
        // In production, integrate with IP reputation services
        // For now, return false (not blocked)
        return false;
    }

    /**
     * Sanitize object data recursively
     */
    static sanitizeObject(obj, options = {}) {
        if (!obj || typeof obj !== 'object') return obj;

        const sanitized = {};

        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                const value = obj[key];
                
                if (typeof value === 'string') {
                    if (options.htmlFields && options.htmlFields.includes(key)) {
                        sanitized[key] = sanitizeHTML(value);
                    } else if (options.urlFields && options.urlFields.includes(key)) {
                        sanitized[key] = isSafeURL(value) ? value : '';
                    } else if (options.emailFields && options.emailFields.includes(key)) {
                        sanitized[key] = isSafeEmail(value) ? value : '';
                    } else {
                        sanitized[key] = value.replace(/[<>]/g, '');
                    }
                } else if (typeof value === 'object') {
                    sanitized[key] = this.sanitizeObject(value, options);
                } else {
                    sanitized[key] = value;
                }
            }
        }

        return sanitized;
    }
}

export default SecurityMiddleware;