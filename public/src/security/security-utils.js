/**
 * 🔒 DUYดูDEE Security Utilities
 * ฟังก์ชันความปลอดภัยขั้นสูงสำหรับการป้องกันและตรวจสอบ
 */

import DOMPurify from 'dompurify';

/**
 * ฟังก์ชัน sanitize HTML เพื่อป้องกัน XSS
 * @param {string} dirty - HTML ที่ยังไม่ได้ sanitize
 * @param {Object} options - DOMPurify options
 * @returns {string} HTML ที่ปลอดภัย
 */
export function sanitizeHTML(dirty, options = {}) {
    const defaultOptions = {
        ALLOWED_TAGS: ['b', 'i', 'u', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
        ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
        FORCE_BODY: true,
        ...options
    };
    return DOMPurify.sanitize(dirty, defaultOptions);
}

/**
 * ตรวจสอบว่า URL ปลอดภัยหรือไม่
 * @param {string} url - URL ที่ต้องการตรวจสอบ
 * @returns {boolean} true ถ้า URL ปลอดภัย
 */
export function isSafeURL(url) {
    if (!url || typeof url !== 'string') return false;
    
    try {
        const parsedUrl = new URL(url);
        
        // อนุญาตเฉพาะ http, https
        if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
            return false;
        }
        
        // ป้องกัน javascript: protocol
        if (url.toLowerCase().startsWith('javascript:')) {
            return false;
        }
        
        // ป้องกัน data: protocol (ยกเว้น images บางกรณี)
        if (url.toLowerCase().startsWith('data:')) {
            return false;
        }
        
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * ตรวจสอบว่า email ปลอดภัยหรือไม่
 * @param {string} email - Email ที่ต้องการตรวจสอบ
 * @returns {boolean} true ถ้า email ปลอดภัย
 */
export function isSafeEmail(email) {
    if (!email || typeof email !== 'string') return false;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return false;
    
    // ป้องกัน email ยาวเกินไป
    if (email.length > 254) return false;
    
    // ป้องกัน characters พิเศษบางตัว
    const dangerousChars = ['<', '>', '"', "'", '&'];
    for (const char of dangerousChars) {
        if (email.includes(char)) return false;
    }
    
    return true;
}

/**
 * ตรวจสอบความแข็งแรงของรหัสผ่าน
 * @param {string} password - รหัสผ่านที่ต้องการตรวจสอบ
 * @returns {Object} ผลการตรวจสอบ
 */
export function checkPasswordStrength(password) {
    if (!password || typeof password !== 'string') {
        return { score: 0, strength: 'weak', errors: ['Password is required'] };
    }
    
    const errors = [];
    const warnings = [];
    
    // ความยาว
    if (password.length < 8) {
        errors.push('Password must be at least 8 characters');
    } else if (password.length < 12) {
        warnings.push('Consider using 12+ characters for better security');
    }
    
    // Uppercase
    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain uppercase letters');
    }
    
    // Lowercase
    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain lowercase letters');
    }
    
    // Numbers
    if (!/\d/.test(password)) {
        errors.push('Password must contain numbers');
    }
    
    // Special characters
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        warnings.push('Consider adding special characters for better security');
    }
    
    // Common patterns
    const commonPatterns = [
        /password/i, /123456/, /qwerty/i, /admin/i,
        /abcdef/i, /111111/, /000000/, /123123/
    ];
    
    for (const pattern of commonPatterns) {
        if (pattern.test(password)) {
            errors.push('Password contains common patterns that are easy to guess');
            break;
        }
    }
    
    // Calculate score
    let score = 0;
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
    
    let strength = 'weak';
    if (score >= 5) strength = 'strong';
    else if (score >= 3) strength = 'medium';
    
    return { score, strength, errors, warnings };
}

/**
 * สร้าง CSRF token
 * @returns {string} CSRF token
 */
export function generateCSRFToken() {
    const array = new Uint32Array(4);
    crypto.getRandomValues(array);
    return Array.from(array, dec => dec.toString(16)).join('');
}

/**
 * ตรวจสอบ CSRF token
 * @param {string} token - Token ที่ต้องการตรวจสอบ
 * @param {string} storedToken - Token ที่เก็บไว้
 * @returns {boolean} true ถ้า token ถูกต้อง
 */
export function verifyCSRFToken(token, storedToken) {
    return token === storedToken && typeof token === 'string' && token.length > 0;
}

/**
 * ตรวจสอบ rate limiting
 * @param {string} identifier - User identifier (IP, userId, etc.)
 * @param {number} maxRequests - Maximum requests allowed
 * @param {number} windowMs - Time window in milliseconds
 * @returns {boolean} true ถ้า request ได้รับอนุญาต
 */
export function checkRateLimit(identifier, maxRequests = 100, windowMs = 60000) {
    const now = Date.now();
    const key = `rate_limit_${identifier}`;
    
    try {
        const storedData = localStorage.getItem(key);
        let requests = storedData ? JSON.parse(storedData) : [];
        
        // ลบ requests เก่ากว่า windowMs
        requests = requests.filter(timestamp => now - timestamp < windowMs);
        
        if (requests.length >= maxRequests) {
            return false;
        }
        
        // เพิ่ม request ปัจจุบัน
        requests.push(now);
        localStorage.setItem(key, JSON.stringify(requests));
        
        return true;
    } catch (error) {
        console.error('Rate limit check error:', error);
        return true; // Allow on error
    }
}

/**
 * ตรวจสอบว่า user agent เป็น bot หรือไม่
 * @param {string} userAgent - User agent string
 * @returns {boolean} true ถ้าเป็น bot
 */
export function isBot(userAgent) {
    if (!userAgent || typeof userAgent !== 'string') return false;
    
    const botPatterns = [
        /bot/i, /crawler/i, /spider/i, /scraper/i,
        /curl/i, /wget/i, /python/i, /java/i,
        /headless/i, /phantom/i, /selenium/i
    ];
    
    return botPatterns.some(pattern => pattern.test(userAgent));
}

/**
 * Mask sensitive data สำหรับ logging
 * @param {string} data - Data ที่ต้องการ mask
 * @param {number} visibleChars - จำนวน characters ที่ต้องการแสดง
 * @returns {string} Data ที่ถูก mask
 */
export function maskSensitiveData(data, visibleChars = 4) {
    if (!data || typeof data !== 'string') return '***';
    
    if (data.length <= visibleChars) {
        return '*'.repeat(data.length);
    }
    
    const visible = data.substring(0, visibleChars);
    const masked = '*'.repeat(data.length - visibleChars);
    
    return visible + masked;
}

/**
 * ตรวจสอบว่า request มาจาก source ที่ถูกต้องหรือไม่
 * @param {string} origin - Origin header
 * @param {string} allowedOrigins - Allowed origins (comma-separated)
 * @returns {boolean} true ถ้า origin ถูกต้อง
 */
export function isAllowedOrigin(origin, allowedOrigins) {
    if (!origin || typeof origin !== 'string') return false;
    
    const allowed = allowedOrigins.split(',').map(o => o.trim());
    return allowed.includes(origin);
}

export default {
    sanitizeHTML,
    isSafeURL,
    isSafeEmail,
    checkPasswordStrength,
    generateCSRFToken,
    verifyCSRFToken,
    checkRateLimit,
    isBot,
    maskSensitiveData,
    isAllowedOrigin
};