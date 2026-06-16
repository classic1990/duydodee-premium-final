/**
 * 🧪 Auth Service Tests
 * Tests for authentication service functions
 */

// Mock Firebase functions
const mockDoc = jest.fn();
const mockGetDoc = jest.fn();
const mockSetDoc = jest.fn();
const mockAddDoc = jest.fn();
const mockCollection = jest.fn();
const mockQuery = jest.fn();
const mockOrderBy = jest.fn();
const mockLimit = jest.fn();
const mockGetDocs = jest.fn();
const mockUpdateDoc = jest.fn();
const mockIncrement = jest.fn();
const mockWriteBatch = jest.fn();
const mockDeleteDoc = jest.fn();

// Mock all dependencies first
jest.mock('./firebase-config.js', () => ({
    auth: {
        currentUser: null
    },
    db: {},
    doc: (...args) => mockDoc(...args),
    getDoc: (...args) => mockGetDoc(...args),
    setDoc: (...args) => mockSetDoc(...args),
    addDoc: (...args) => mockAddDoc(...args),
    serverTimestamp: jest.fn(() => new Date()),
    collection: (...args) => mockCollection(...args),
    query: (...args) => mockQuery(...args),
    orderBy: (...args) => mockOrderBy(...args),
    limit: (...args) => mockLimit(...args),
    getDocs: (...args) => mockGetDocs(...args),
    googleProvider: {},
    updateDoc: (...args) => mockUpdateDoc(...args),
    increment: (...args) => mockIncrement(...args),
    writeBatch: (...args) => mockWriteBatch(...args),
    deleteDoc: (...args) => mockDeleteDoc(...args)
}));

// Mock Firebase Auth functions
jest.mock('https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js', () => ({
    onAuthStateChanged: jest.fn(),
    signOut: jest.fn(),
    signInWithPopup: jest.fn(),
    signInWithEmailAndPassword: jest.fn(),
    createUserWithEmailAndPassword: jest.fn(),
    sendEmailVerification: jest.fn(),
    updateProfile: jest.fn()
}));

// Mock constants
jest.mock('../constants.js', () => ({
    SCHEMA: {
        COLLECTIONS: {
            USERS: 'users',
            ACTIVITY_LOGS: 'activity_logs'
        },
        ROLES: {
            ADMIN: 'admin',
            MASTER: 'master',
            MEMBER: 'member'
        }
    }
}));

// Mock config
jest.mock('../config/index.js', () => ({
    isAdmin: jest.fn((email) => email === 'admin@test.com')
}));

import { AuthService } from './auth-service.js';

describe('AuthService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('isGoogleUser', () => {
        it('should return true for Google user', () => {
            const googleUser = {
                providerData: [
                    { providerId: 'google.com', email: 'user@gmail.com' }
                ]
            };
            expect(AuthService.isGoogleUser(googleUser)).toBe(true);
        });

        it('should return false for non-Google user', () => {
            const emailUser = {
                providerData: [
                    { providerId: 'password', email: 'user@example.com' }
                ]
            };
            expect(AuthService.isGoogleUser(emailUser)).toBe(false);
        });

        it('should return false for user without providerData', () => {
            const noProviderUser = {
                email: 'user@example.com'
            };
            expect(AuthService.isGoogleUser(noProviderUser)).toBe(false);
        });

        it('should return false for null user', () => {
            expect(AuthService.isGoogleUser(null)).toBe(false);
        });

        it('should return false for undefined user', () => {
            expect(AuthService.isGoogleUser(undefined)).toBe(false);
        });

        it('should return true for user with multiple providers including Google', () => {
            const multiProviderUser = {
                providerData: [
                    { providerId: 'password', email: 'user@example.com' },
                    { providerId: 'google.com', email: 'user@gmail.com' }
                ]
            };
            expect(AuthService.isGoogleUser(multiProviderUser)).toBe(true);
        });
    });

    describe('checkIsAdmin', () => {
        it('should return false for null user', async () => {
            const result = await AuthService.checkIsAdmin(null);
            expect(result).toBe(false);
        });

        it('should return false for non-Google user', async () => {
            const nonGoogleUser = {
                uid: 'user123',
                email: 'user@example.com',
                providerData: [
                    { providerId: 'password', email: 'user@example.com' }
                ]
            };

            const result = await AuthService.checkIsAdmin(nonGoogleUser);
            expect(result).toBe(false);
        });

        it('should return true for Google admin user from config', async () => {
            const googleAdminUser = {
                uid: 'admin123',
                email: 'admin@test.com',
                providerData: [
                    { providerId: 'google.com', email: 'admin@test.com' }
                ]
            };

            const result = await AuthService.checkIsAdmin(googleAdminUser);
            expect(result).toBe(true);
        });

        // Skip Firestore-dependent tests for now due to mock complexity
        // These can be added later with proper Firestore mocking
    });
});
