/**
 * 🔐 DUYดูDEE ADMIN VALIDATORS
 * Centralized validation functions for admin forms
 * Eliminates code duplication across admin modules
 */

import { ValidationUtils } from '../../utils/validation-utils.js';

/**
 * Admin Validators Module
 * Provides common validation functions for admin forms
 */
export const AdminValidators = {
    /**
     * Validates YouTube URL format
     * @param {string} url - URL to validate
     * @returns {boolean} True if valid YouTube URL
     */
    isValidYouTubeUrl(url) {
        return ValidationUtils.isValidYouTubeURL(url);
    },

    /**
     * Sanitizes user input to prevent XSS
     * @param {string} input - Raw input string
     * @returns {string} Sanitized string
     */
    sanitizeInput(input) {
        return ValidationUtils.sanitizeString(input);
    },

    /**
     * Validates movie form data
     * @param {Object} formData - Form data object
     * @returns {Object} Validation result with isValid and errors
     */
    validateMovieForm(formData) {
        const errors = [];

        if (!formData.videoUrl || !this.isValidYouTubeUrl(formData.videoUrl)) {
            errors.push('กรุณาระบุลิงก์ YouTube ที่ถูกต้อง');
        }

        if (!ValidationUtils.isValidTitle(formData.title)) {
            errors.push('กรุณาระบุชื่อเรื่องอย่างน้อย 2 ตัวอักษร');
        }

        if (formData.title && formData.title.length > 200) {
            errors.push('ชื่อเรื่องต้องไม่เกิน 200 ตัวอักษร');
        }

        if (!formData.category) {
            errors.push('กรุณาระบุหมวดหมู่');
        }

        if (formData.description && formData.description.length > 1000) {
            errors.push('รายละเอียดต้องไม่เกิน 1000 ตัวอักษร');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    },

    /**
     * Validates series form data
     * @param {Object} formData - Form data object
     * @returns {Object} Validation result with isValid and errors
     */
    validateSeriesForm(formData) {
        const errors = [];

        if (!formData.title || formData.title.length < 2) {
            errors.push('กรุณาระบุชื่อเรื่องอย่างน้อย 2 ตัวอักษร');
        }

        if (formData.title.length > 200) {
            errors.push('ชื่อเรื่องต้องไม่เกิน 200 ตัวอักษร');
        }

        if (!formData.category) {
            errors.push('กรุณาระบุหมวดหมู่');
        }

        if (!formData.episodes || formData.episodes.length === 0) {
            errors.push('กรุณาเพิ่มอย่างน้อย 1 ตอน');
        }

        if (formData.description && formData.description.length > 1000) {
            errors.push('รายละเอียดต้องไม่เกิน 1000 ตัวอักษร');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    },

    /**
     * Validates episode data
     * @param {Object} episode - Episode data object
     * @returns {Object} Validation result with isValid and errors
     */
    validateEpisode(episode) {
        const errors = [];

        if (!episode.title || episode.title.length < 1) {
            errors.push('กรุณาระบุชื่อตอน');
        }

        if (!episode.videoUrl || !this.isValidYouTubeUrl(episode.videoUrl)) {
            errors.push('กรุณาระบุลิงก์ YouTube ที่ถูกต้อง');
        }

        if (episode.title && episode.title.length > 100) {
            errors.push('ชื่อตอนต้องไม่เกิน 100 ตัวอักษร');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    },

    /**
     * Validates poster URL
     * @param {string} url - Poster URL to validate
     * @returns {boolean} True if valid URL
     */
    isValidPosterUrl(url) {
        if (!url) {
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
     * Validates VIP plan data
     * @param {Object} planData - VIP plan data object
     * @returns {Object} Validation result with isValid and errors
     */
    validateVIPPlan(planData) {
        const errors = [];

        if (!planData.name || planData.name.length < 2) {
            errors.push('กรุณาระบุชื่อแผน');
        }

        if (!planData.price || planData.price <= 0) {
            errors.push('กรุณาระบุราคาที่ถูกต้อง');
        }

        if (!planData.duration || planData.duration <= 0) {
            errors.push('กรุณาระบุระยะเวลาที่ถูกต้อง');
        }

        if (!planData.features || planData.features.length === 0) {
            errors.push('กรุณาระบุคุณสมบัติ');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
};
