/**
 * 🧪 Jest Setup File
 * Global test configuration and mocks
 */

// Make import.meta.env accessible
Object.defineProperty(global, "import", {
    value: {
        meta: {
            env: {
                VITE_FIREBASE_API_KEY: "test-api-key",
                VITE_FIREBASE_AUTH_DOMAIN: "test.firebaseapp.com",
                VITE_FIREBASE_PROJECT_ID: "test-project",
                VITE_FIREBASE_STORAGE_BUCKET: "test.appspot.com",
                VITE_FIREBASE_MESSAGING_SENDER_ID: "123456789",
                VITE_FIREBASE_APP_ID: "1:123456789:web:abcdef",
                VITE_FIREBASE_MEASUREMENT_ID: "G-TEST123",
                VITE_ADMIN_EMAILS: "admin@test.com",
                VITE_SITE_URL: "https://test.web.app",
                VITE_SITE_NAME: "TEST SITE",
                VITE_GA_TRACKING_ID: "G-TEST123",
                VITE_ENABLE_ANALYTICS: "false",
                VITE_SENTRY_DSN: "",
                VITE_SENTRY_ENVIRONMENT: "test",
                VITE_ENABLE_DEBUG: "true",
                VITE_ENABLE_MOCK_DATA: "true",
            },
        },
    },
    writable: true,
});

// Mock localStorage
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
    length: 0,
    key: jest.fn(),
};

global.localStorage = localStorageMock;

// Mock window and document to prevent error handler initialization
global.window = {
    location: { href: 'http://localhost:3000' },
    navigator: {
        userAgent: 'test',
        language: 'en',
        platform: 'test',
        screen: { width: 1024, height: 768 },
        connection: { effectiveType: '4g' },
        deviceMemory: 8,
        hardwareConcurrency: 4,
    },
    addEventListener: jest.fn(),
    PerformanceObserver: class PerformanceObserver {
        constructor() {}
        observe() {}
        disconnect() {}
    },
};

global.document = {
    body: {
        appendChild: jest.fn(),
        removeChild: jest.fn(),
    },
    createElement: jest.fn(() => ({
        className: '',
        innerHTML: '',
        remove: jest.fn(),
        parentElement: null,
    })),
    head: {
        appendChild: jest.fn(),
    },
    querySelectorAll: jest.fn(() => []),
};

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
});

// Mock window.scrollTo
window.scrollTo = jest.fn();

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
    constructor() {}
    disconnect() {}
    observe() {}
    takeRecords() {
        return [];
    }
    unobserve() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
    constructor() {}
    disconnect() {}
    observe() {}
    unobserve() {}
};

// Suppress console errors in tests
const originalError = console.error;
beforeAll(() => {
    console.error = (...args) => {
        if (
            typeof args[0] === "string" &&
            (args[0].includes("Warning:") || args[0].includes("deprecated") || args[0].includes("Not implemented"))
        ) {
            return;
        }
        originalError.call(console, ...args);
    };
});

afterAll(() => {
    console.error = originalError;
});
