/**
 * ✅ DUYDODEE PREMIUM - VALIDATION UTILITIES
 * Input validation and sanitization
 */

export class Validator {
  /**
   * Validate email format
   */
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate password strength
   * Requirements: At least 8 characters, 1 uppercase, 1 lowercase, 1 number
   */
  static isValidPassword(password) {
    if (!password || password.length < 8) {
      return { valid: false, message: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร' };
    }
    if (!/[A-Z]/.test(password)) {
      return { valid: false, message: 'รหัสผ่านต้องมีตัวอักษรพิมพ์ใหญ่อย่างน้อย 1 ตัว' };
    }
    if (!/[a-z]/.test(password)) {
      return { valid: false, message: 'รหัสผ่านต้องมีตัวอักษรพิมพ์เล็กอย่างน้อย 1 ตัว' };
    }
    if (!/[0-9]/.test(password)) {
      return { valid: false, message: 'รหัสผ่านต้องมีตัวเลขอย่างน้อย 1 ตัว' };
    }
    return { valid: true, message: '' };
  }

  /**
   * Validate URL format
   */
  static isValidURL(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Sanitize user input to prevent XSS
   */
  static sanitizeInput(input) {
    if (typeof input !== 'string') {
      return input;
    }

    // Basic sanitization
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Sanitize object recursively
   */
  static sanitizeObject(obj) {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitizeObject(item));
    }

    const sanitized = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        if (typeof obj[key] === 'string') {
          sanitized[key] = this.sanitizeInput(obj[key]);
        } else if (typeof obj[key] === 'object') {
          sanitized[key] = this.sanitizeObject(obj[key]);
        } else {
          sanitized[key] = obj[key];
        }
      }
    }

    return sanitized;
  }

  /**
   * Validate required fields
   */
  static validateRequired(fields, data) {
    const missing = [];
    fields.forEach((field) => {
      if (!data[field] || data[field].trim() === '') {
        missing.push(field);
      }
    });
    return {
      valid: missing.length === 0,
      missing,
      message: missing.length > 0 ? `กรุณากรอกข้อมูล: ${missing.join(', ')}` : ''
    };
  }

  /**
   * Validate numeric range
   */
  static isInRange(value, min, max) {
    const num = parseFloat(value);
    return !isNaN(num) && num >= min && num <= max;
  }

  /**
   * Validate file type
   */
  static isValidFileType(file, allowedTypes) {
    return allowedTypes.includes(file.type);
  }

  /**
   * Validate file size (in bytes)
   */
  static isValidFileSize(file, maxSize) {
    return file.size <= maxSize;
  }

  /**
   * Validate Thai phone number
   */
  static isValidThaiPhone(phone) {
    const phoneRegex = /^0[689]\d{8}$/;
    return phoneRegex.test(phone.replace(/[-\s]/g, ''));
  }

  /**
   * Validate object structure
   */
  static validateSchema(data, schema) {
    const errors = [];

    Object.keys(schema).forEach((field) => {
      const rules = schema[field];
      const value = data[field];

      // Check required
      if (rules.required && (value === null || value === '')) {
        errors.push(`${field} is required`);
        return;
      }

      // Skip other validations if field is not required and empty
      if (!rules.required && (value === null || value === '')) {
        return;
      }

      // Check type
      if (rules.type && typeof value !== rules.type) {
        errors.push(`${field} must be ${rules.type}`);
      }

      // Check min/max for numbers
      if (rules.type === 'number') {
        if (rules.min !== null && value < rules.min) {
          errors.push(`${field} must be at least ${rules.min}`);
        }
        if (rules.max !== null && value > rules.max) {
          errors.push(`${field} must be at most ${rules.max}`);
        }
      }

      // Check min/max length for strings
      if (rules.type === 'string') {
        if (rules.minLength && value.length < rules.minLength) {
          errors.push(`${field} must be at least ${rules.minLength} characters`);
        }
        if (rules.maxLength && value.length > rules.maxLength) {
          errors.push(`${field} must be at most ${rules.maxLength} characters`);
        }
      }

      // Check enum values
      if (rules.enum && !rules.enum.includes(value)) {
        errors.push(`${field} must be one of: ${rules.enum.join(', ')}`);
      }

      // Custom validation
      if (rules.validate && !rules.validate(value)) {
        errors.push(`${field} is invalid`);
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

/**
 * Common validation schemas
 */
export const SCHEMAS = {
  USER_PROFILE: {
    displayName: { type: 'string', required: true, minLength: 2, maxLength: 50 },
    email: { type: 'string', required: true, validate: Validator.isValidEmail },
    photoURL: { type: 'string', required: false }
  },

  MOVIE: {
    title: { type: 'string', required: true, minLength: 1, maxLength: 200 },
    description: { type: 'string', required: true, minLength: 10, maxLength: 2000 },
    category: { type: 'string', required: true },
    poster: { type: 'string', required: true },
    backdrop: { type: 'string', required: false },
    rating: { type: 'number', required: false, min: 0, max: 10 },
    year: { type: 'number', required: false, min: 1900, max: 2100 }
  },

  SERIES: {
    title: { type: 'string', required: true, minLength: 1, maxLength: 200 },
    description: { type: 'string', required: true, minLength: 10, maxLength: 2000 },
    category: { type: 'string', required: true },
    poster: { type: 'string', required: true },
    backdrop: { type: 'string', required: false },
    rating: { type: 'number', required: false, min: 0, max: 10 },
    year: { type: 'number', required: false, min: 1900, max: 2100 }
  }
};
