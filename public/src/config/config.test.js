/**
 * 🧪 Config Module Tests
 */

import config from './index.js';

describe('Config Module', () => {
    beforeEach(() => {
        // Reset config before each test
        jest.resetModules();
    });

    describe('get method', () => {
        it('should return firebase config', () => {
            const firebaseConfig = config.get('firebase');
            expect(firebaseConfig).toBeDefined();
            expect(firebaseConfig.apiKey).toBeDefined();
        });

        it('should return admin emails', () => {
            const adminEmails = config.get('admin.emails');
            expect(Array.isArray(adminEmails)).toBe(true);
        });

        it('should return undefined for invalid path', () => {
            const invalid = config.get('invalid.path');
            expect(invalid).toBeUndefined();
        });
    });

    describe('isAdmin method', () => {
        it('should return true for admin email', () => {
            const result = config.isAdmin('duyclassic191@gmail.com');
            expect(result).toBe(true);
        });

        it('should return false for non-admin email', () => {
            const result = config.isAdmin('user@example.com');
            expect(result).toBe(false);
        });

        it('should return false for empty email', () => {
            const result = config.isAdmin('');
            expect(result).toBe(false);
        });
    });

    describe('isDevelopment method', () => {
        it('should return boolean', () => {
            const result = config.isDevelopment();
            expect(typeof result).toBe('boolean');
        });
    });

    describe('config structure', () => {
        it('should have all required sections', () => {
            expect(config.get('firebase')).toBeDefined();
            expect(config.get('admin')).toBeDefined();
            expect(config.get('site')).toBeDefined();
            expect(config.get('analytics')).toBeDefined();
            expect(config.get('sentry')).toBeDefined();
            expect(config.get('features')).toBeDefined();
        });

        it('should have required firebase fields', () => {
            const firebaseConfig = config.get('firebase');
            expect(firebaseConfig.apiKey).toBeDefined();
            expect(firebaseConfig.authDomain).toBeDefined();
            expect(firebaseConfig.projectId).toBeDefined();
        });
    });
});
