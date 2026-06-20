/**
 * 🚀 DUYดูDEE ADMIN INITIALIZATION
 * Centralized admin page initialization logic
 * Eliminates code duplication across admin pages
 */

import { checkAdminAccess } from '../../middleware/auth-guard.js';
import { UI } from '../../components/ui.js';
import { injectAdminSidebar } from '../sidebar-loader.js';

/**
 * Admin Initialization Module
 * Provides common initialization patterns for admin pages
 */
export const AdminInit = {
    /**
     * Standard admin page initialization
     * @param {Function} pageCallback - Page-specific callback after initialization
     * @param {Object} options - Configuration options
     */
    async initPage(pageCallback, options = {}) {
        const {
            requireGoogleAuth = true,
            skipSidebar = false,
            customAuthCheck = null
        } = options;

        try {
            UI.setLoading(true);

            // Perform admin access check
            let authResult;
            if (customAuthCheck) {
                authResult = await customAuthCheck();
            } else {
                authResult = await checkAdminAccess();
            }

            const { user } = authResult;

            // Additional Google auth check if required
            if (requireGoogleAuth && user) {
                const { AuthService } = await import('../../services/auth-service.js');
                if (!AuthService.isGoogleUser(user)) {
                    console.error('🚨 Security Alert: Non-Google login attempt detected');
                    // eslint-disable-next-line no-alert
                    alert('🔒 ระบบความปลอดภัย: การเข้าถึงหน้าแอดมินต้องล็อกอินด้วย Google Account เท่านั้น');
                    window.location.href = '/';
                    return;
                }
            }

            // Setup sidebar if not skipped
            if (!skipSidebar && user) {
                UI.setupSidebar(user);
                await injectAdminSidebar();
                UI.initAdminSidebar();
            }

            // Execute page-specific callback
            if (pageCallback && typeof pageCallback === 'function') {
                await pageCallback(user);
            }

            UI.setLoading(false);
        } catch (err) {
            console.error('Admin Page Init Failed:', err);
            UI.setLoading(false);
            UI.showToast('การเชื่อมต่อล้มเหลว โปรดตรวจสอบสิทธิ์', 'error');

            // Redirect to home on access denied
            if (err.message?.includes('Access Denied') || err.message?.includes('permission-denied')) {
                setTimeout(() => {
                    window.location.href = '/';
                }, 2000);
            }
        }
    },

    /**
     * Initialize page with ID parameter validation
     * @param {string} idParamName - Name of the ID parameter (default: 'id')
     * @param {Function} pageCallback - Page-specific callback with validated ID
     * @param {Object} options - Configuration options
     */
    async initWithIdParam(idParamName = 'id', pageCallback, options = {}) {
        const params = new URLSearchParams(window.location.search);
        const itemId = params.get(idParamName);

        if (!itemId) {
            UI.showToast(`ไม่พบรหัส${idParamName}`, 'error');
            setTimeout(() => {
                window.location.href = options.fallbackUrl || './admin-manage.html';
            }, 1500);
            return;
        }

        return this.initPage(async (user) => {
            await pageCallback(user, itemId);
        }, options);
    },

    /**
     * Setup common form handling
     * @param {string} formId - Form element ID
     * @param {Function} submitCallback - Form submission callback
     * @param {Object} options - Form options
     */
    setupForm(formId, submitCallback, options = {}) {
        const {
            validateBeforeSubmit = true,
            validationFn = null,
            _loadingMessage = 'กำลังบันทึก...'
        } = options;

        const form = document.getElementById(formId);
        if (!form) {
            console.error(`Form with id "${formId}" not found`);
            return;
        }

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            try {
                // Validation if required
                if (validateBeforeSubmit && validationFn) {
                    const formData = this.getFormData(form);
                    const validation = validationFn(formData);

                    if (!validation.isValid) {
                        UI.showToast(validation.errors.join(', '), 'error');
                        return;
                    }
                }

                UI.setLoading(true);

                // Execute submit callback
                const formData = this.getFormData(form);
                await submitCallback(formData, form);

                UI.setLoading(false);
            } catch (err) {
                console.error('Form submission error:', err);
                UI.setLoading(false);
                UI.showToast('เกิดข้อผิดพลาด กรุณาลองใหม่', 'error');
            }
        });
    },

    /**
     * Extract form data as object
     * @param {HTMLFormElement} form - Form element
     * @returns {Object} Form data as key-value pairs
     */
    getFormData(form) {
        const formData = new FormData(form);
        const data = {};

        formData.forEach((value, key) => {
            // Handle multiple values for same key
            if (data[key]) {
                if (Array.isArray(data[key])) {
                    data[key].push(value);
                } else {
                    data[key] = [data[key], value];
                }
            } else {
                data[key] = value;
            }
        });

        return data;
    },

    /**
     * Setup common input handlers
     * @param {Object} handlers - Map of input IDs to handler functions
     */
    setupInputHandlers(handlers) {
        Object.entries(handlers).forEach(([inputId, handler]) => {
            const input = document.getElementById(inputId);
            if (input && typeof handler === 'function') {
                input.addEventListener('input', handler);
                input.addEventListener('change', handler);
            }
        });
    }
};
