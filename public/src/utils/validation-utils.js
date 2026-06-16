/**
 * 🔒 DUYดูDEE Validation Utilities
 * Input validation and sanitization functions
 */

export const ValidationUtils = {
    /**
     * Validate email format
     */
    isValidEmail: (email) => {
        if (!email || typeof email !== 'string') {
            return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email.trim());
    },

    /**
     * Validate password strength
     * - At least 8 characters
     * - At least one uppercase letter
     * - At least one lowercase letter
     * - At least one number
     */
    isValidPassword: (password) => {
        if (!password || typeof password !== 'string') {
            return false;
        }

        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumber = /\d/.test(password);

        return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumber;
    },

    /**
     * Get password strength details
     */
    getPasswordStrength: (password) => {
        if (!password || typeof password !== 'string') {
            return {
                strength: 'none',
                score: 0,
                errors: ['Password is required']
            };
        }

        const errors = [];
        let score = 0;

        if (password.length < 8) {
            errors.push('At least 8 characters');
        } else {
            score += 1;
        }

        if (!/[A-Z]/.test(password)) {
            errors.push('At least one uppercase letter');
        } else {
            score += 1;
        }

        if (!/[a-z]/.test(password)) {
            errors.push('At least one lowercase letter');
        } else {
            score += 1;
        }

        if (!/\d/.test(password)) {
            errors.push('At least one number');
        } else {
            score += 1;
        }

        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            errors.push('At least one special character (recommended)');
        } else {
            score += 1;
        }

        let strength = 'weak';
        if (score >= 4) {
            strength = 'strong';
        } else if (score >= 3) {
            strength = 'medium';
        }

        return {
            strength,
            score,
            errors: errors.length > 0 ? errors : []
        };
    },

    /**
     * Validate Thai phone number
     */
    isValidThaiPhone: (phone) => {
        if (!phone || typeof phone !== 'string') {
            return false;
        }
        const phoneRegex = /^0[689]\d{8}$/;
        return phoneRegex.test(phone.replace(/[-\s]/g, ''));
    },

    /**
     * Validate URL format
     */
    isValidURL: (url) => {
        if (!url || typeof url !== 'string') {
            return false;
        }
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    },

    /**
     * Validate YouTube URL
     */
    isValidYouTubeURL: (url) => {
        if (!url || typeof url !== 'string') {
            return false;
        }
        const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
        return youtubeRegex.test(url.trim());
    },

    /**
     * Validate Thai ID card number (13 digits)
     */
    isValidThaiID: (id) => {
        if (!id || typeof id !== 'string') {
            return false;
        }
        const idClean = id.replace(/[-\s]/g, '');
        if (idClean.length !== 13 || !/^\d+$/.test(idClean)) {
            return false;
        }

        // Checksum validation
        let sum = 0;
        for (let i = 0; i < 12; i++) {
            sum += parseInt(idClean[i]) * (13 - i);
        }
        const checksum = (11 - (sum % 11)) % 10;
        return checksum === parseInt(idClean[12]);
    },

    /**
     * Sanitize string input (prevent XSS)
     */
    sanitizeString: (str) => {
        if (!str || typeof str !== 'string') {
            return '';
        }
        return str.trim()
            .replace(/[<>]/g, '') // Remove potential HTML tags
            .substring(0, 1000); // Limit length
    },

    /**
     * Validate and sanitize name input
     */
    isValidName: (name) => {
        if (!name || typeof name !== 'string') {
            return false;
        }
        const sanitized = name.trim();
        return sanitized.length >= 2 && sanitized.length <= 100;
    },

    /**
     * Validate movie/series title
     */
    isValidTitle: (title) => {
        if (!title || typeof title !== 'string') {
            return false;
        }
        const sanitized = title.trim();
        return sanitized.length >= 2 && sanitized.length <= 200;
    },

    /**
     * Validate description text
     */
    isValidDescription: (description) => {
        if (!description || typeof description !== 'string') {
            return false;
        }
        const sanitized = description.trim();
        return sanitized.length >= 10 && sanitized.length <= 2000;
    },

    /**
     * Validate category selection
     */
    isValidCategory: (category) => {
        if (!category || typeof category !== 'string') {
            return false;
        }
        const validCategories = [
            'Action', 'Comedy', 'Drama', 'Horror', 'Romance',
            'Thriller', 'Sci-Fi', 'Animation', 'Documentary',
            'แนวตั้ง', 'Vertical', 'Premium'
        ];
        return validCategories.includes(category.trim());
    },

    /**
     * Validate year input
     */
    isValidYear: (year) => {
        if (!year) {
            return false;
        }
        const yearNum = parseInt(year);
        const currentYear = new Date().getFullYear();
        return !isNaN(yearNum) && yearNum >= 1900 && yearNum <= currentYear + 5;
    },

    /**
     * Validate numeric input
     */
    isValidNumber: (value, min = null, max = null) => {
        if (!value && value !== 0) {
            return false;
        }
        const num = parseFloat(value);
        if (isNaN(num)) {
            return false;
        }

        if (min !== null && num < min) {
            return false;
        }
        if (max !== null && num > max) {
            return false;
        }

        return true;
    },

    /**
     * Validate rating (1-5 or 1-10)
     */
    isValidRating: (rating, maxRating = 5) => {
        return ValidationUtils.isValidNumber(rating, 1, maxRating);
    },

    /**
     * Validate duration (in minutes)
     */
    isValidDuration: (duration) => {
        return ValidationUtils.isValidNumber(duration, 1, 600); // Max 10 hours
    },

    /**
     * Generic field validation
     */
    validateField: (value, rules) => {
        const errors = [];

        if (rules.required && (!value || (typeof value === 'string' && !value.trim()))) {
            errors.push('This field is required');
        }

        if (value && rules.minLength && value.length < rules.minLength) {
            errors.push(`Must be at least ${rules.minLength} characters`);
        }

        if (value && rules.maxLength && value.length > rules.maxLength) {
            errors.push(`Must be no more than ${rules.maxLength} characters`);
        }

        if (value && rules.pattern && !rules.pattern.test(value)) {
            errors.push(rules.patternMessage || 'Invalid format');
        }

        if (value && rules.type === 'email' && !ValidationUtils.isValidEmail(value)) {
            errors.push('Invalid email format');
        }

        if (value && rules.type === 'url' && !ValidationUtils.isValidURL(value)) {
            errors.push('Invalid URL format');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    },

    /**
     * Validate form object
     */
    validateForm: (formData, schema) => {
        const errors = {};
        let isValid = true;

        for (const field in schema) {
            const fieldSchema = schema[field];
            const value = formData[field];
            const validation = ValidationUtils.validateField(value, fieldSchema);

            if (!validation.isValid) {
                errors[field] = validation.errors;
                isValid = false;
            }
        }

        return {
            isValid,
            errors
        };
    }
};

export default ValidationUtils;
