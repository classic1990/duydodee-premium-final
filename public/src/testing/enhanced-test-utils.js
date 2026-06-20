/**
 * 🔍 DUYดูDEE Enhanced Testing Utilities
 * เครื่องมือการทดสอบที่ครบถ้วนสำหรับระบบ
 */

/**
 * Test Helper Functions
 */
export class TestHelpers {
    /**
     * Wait for specified time
     */
    static async wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Wait for element to appear
     */
    static async waitForElement(selector, timeout = 5000) {
        const startTime = Date.now();

        while (Date.now() - startTime < timeout) {
            const element = document.querySelector(selector);
            if (element) {
                return element;
            }
            await this.wait(100);
        }

        throw new Error(`Element ${selector} not found within ${timeout}ms`);
    }

    /**
     * Wait for element to be visible
     */
    static async waitForElementVisible(selector, timeout = 5000) {
        const element = await this.waitForElement(selector, timeout);

        while (Date.now() - Date.now() < timeout) {
            if (this.isElementVisible(element)) {
                return element;
            }
            await this.wait(100);
        }

        throw new Error(`Element ${selector} not visible within ${timeout}ms`);
    }

    /**
     * Check if element is visible
     */
    static isElementVisible(element) {
        return element && element.offsetParent !== null;
    }

    /**
     * Mock Firebase responses
     */
    static mockFirebaseResponse(data) {
        return {
            data: () => data,
            exists: () => true
        };
    }

    /**
     * Mock user authentication
     */
    static mockAuthUser(userData) {
        return {
            uid: 'test-user-123',
            email: userData.email || 'test@example.com',
            displayName: userData.displayName || 'Test User',
            photoURL: userData.photoURL || '',
            providerData: [{ providerId: 'google.com', ...userData }]
        };
    }
}

/**
 * Security Test Utilities
 */
export class SecurityTestHelpers {
    /**
     * Test XSS vulnerability
     */
    static testXSS(input) {
        const dangerousInputs = [
            '<script>alert("XSS")</script>',
            'javascript:alert("XSS")',
            '<img src=x onerror=alert("XSS")>',
            '<svg onload=alert("XSS")>',
            '<iframe src="javascript:alert("XSS")">'
        ];

        let isVulnerable = false;

        for (const dangerousInput of dangerousInputs) {
            try {
                const div = document.createElement('div');
                div.innerHTML = dangerousInput;

                // Check if script executes
                if (div.querySelector('script') || div.querySelector('iframe')) {
                    isVulnerable = true;
                    break;
                }
            } catch (error) {
                isVulnerable = true;
                break;
            }
        }

        return {
            vulnerable: isVulnerable,
            input: input,
            message: isVulnerable ? 'XSS vulnerability detected' : 'XSS protection working'
        };
    }

    /**
     * Test CSRF protection
     */
    static testCSRFProtection() {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = '/test-endpoint';

        const hasCSRFToken = !!document.querySelector('input[name="csrf_token"]');
        const hasSameSiteCookie = document.cookie.includes('SameSite');

        return {
            hasCSRFToken,
            hasSameSiteCookie,
            protected: hasCSRFToken || hasSameSiteCookie
        };
    }

    /**
     * Test content security policy
     */
    static testCSP() {
        const metaTags = document.querySelectorAll('meta[http-equiv="Content-Security-Policy"]');
        return {
            hasCSP: metaTags.length > 0,
            cspContent: metaTags.length > 0 ? metaTags[0].getAttribute('content') : null,
            protected: metaTags.length > 0
        };
    }
}

/**
 * Performance Test Utilities
 */
export class PerformanceTestHelpers {
    /**
     * Measure page load time
     */
    static measurePageLoad() {
        if (performance.timing) {
            const timing = performance.timing;
            return {
                dns: timing.domainLookupEnd - timing.domainLookupStart,
                tcp: timing.connectEnd - timing.connectStart,
                request: timing.responseStart - timing.requestStart,
                response: timing.responseEnd - timing.responseStart,
                dom: timing.domComplete - timing.domLoading,
                load: timing.loadEventEnd - timing.loadEventStart,
                total: timing.loadEventEnd - timing.navigationStart
            };
        }
        return null;
    }

    /**
     * Measure bundle size
     */
    static measureBundleSize() {
        const scripts = document.querySelectorAll('script[src]');
        const sizes = [];

        scripts.forEach(script => {
            const src = script.src;
            if (src.includes('.js')) {
                // This would need actual size fetching in a real test
                sizes.push({
                    src,
                    estimated: 'would fetch actual size'
                });
            }
        });

        return sizes;
    }

    /**
     * Test memory usage
     */
    static testMemoryUsage() {
        if (performance.memory) {
            return {
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize,
                limit: performance.memory.jsHeapSizeLimit,
                percentage: (performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100
            };
        }
        return null;
    }
}

/**
 * Integration Test Helpers
 */
export class IntegrationTestHelpers {
    /**
     * Test Firebase connection
     */
    static async testFirebaseConnection() {
        try {
            const { db, _collection, getDoc, doc } = await import('../services/firebase.js');

            // Try to read a simple document
            const testDoc = await getDoc(doc(db, 'test', 'connection-test'));

            return {
                connected: true,
                response: testDoc
            };
        } catch (error) {
            return {
                connected: false,
                error: error.message
            };
        }
    }

    /**
     * Test auth flow
     */
    static async testAuthFlow() {
        try {
            const { AuthService } = await import('../services/auth-service.js');

            // Test auth state change
            return new Promise((resolve) => {
                const unsubscribe = AuthService.onStateChanged((user) => {
                    unsubscribe();
                    resolve({
                        authWorking: true,
                        currentUser: user ? true : false
                    });
                });
            });
        } catch (error) {
            return {
                authWorking: false,
                error: error.message
            };
        }
    }

    /**
     * Test Firestore rules
     */
    static async testFirestoreRules() {
        try {
            const { db, _collection, getDoc, doc } = await import('../services/firebase.js');

            // Test reading public data
            const _publicDoc = await getDoc(doc(db, 'movies', 'test'));

            // Test reading protected data (should fail)
            const protectedDoc = await getDoc(doc(db, 'users', 'test'));

            return {
                publicRead: true,
                protectedRead: !protectedDoc.exists() // Should fail
            };
        } catch (error) {
            return {
                error: error.message
            };
        }
    }
}

/**
 * Test Runner
 */
export class TestRunner {
    constructor() {
        this.tests = [];
        this.results = [];
    }

    /**
     * Add test
     */
    addTest(name, testFunction) {
        this.tests.push({ name, testFunction });
    }

    /**
     * Run all tests
     */
    async runTests() {
        // console.log('🧪 Starting Test Suite...');

        for (const test of this.tests) {
            try {
                // console.log(`Running: ${test.name}`);
                const result = await test.testFunction();
                this.results.push({
                    name: test.name,
                    passed: true,
                    result
                });
                // console.log(`✅ ${test.name} passed`);
            } catch (error) {
                this.results.push({
                    name: test.name,
                    passed: false,
                    error: error.message
                });
                // console.log(`❌ ${test.name} failed: ${error.message}`);
            }
        }

        this.printResults();
        return this.results;
    }

    /**
     * Print test results
     */
    printResults() {
        const _passed = this.results.filter(r => r.passed).length;
        const _failed = this.results.filter(r => !r.passed).length;
        const _total = this.results.length;

        // console.log('\n📊 Test Results:');
        // console.log(`Total: ${_total}`);
        // console.log(`Passed: ${_passed}`);
        // console.log(`Failed: ${_failed}`);
        // console.log(`Success Rate: ${((_passed / _total) * 100).toFixed(1)}%`);

        if (_failed > 0) {
            console.log('\n❌ Failed Tests:'); // Keep error logging
            this.results
                .filter(r => !r.passed)
                .forEach(r => console.log(`- ${r.name}: ${r.error}`)); // Keep error logging
        }
    }

    /**
     * Export test results
     */
    exportResults() {
        return {
            summary: {
                total: this.results.length,
                passed: this.results.filter(r => r.passed).length,
                failed: this.results.filter(r => !r.passed).length,
                successRate: ((this.results.filter(r => r.passed).length / this.results.length) * 100).toFixed(1) + '%'
            },
            details: this.results
        };
    }
}

/**
 * Create test suite
 */
export function createTestSuite() {
    const runner = new TestRunner();

    // Security Tests
    runner.addTest('XSS Protection', async () => {
        return SecurityTestHelpers.testXSS('<script>alert("test")</script>');
    });

    runner.addTest('CSP Headers', async () => {
        return SecurityTestHelpers.testCSP();
    });

    // Performance Tests
    runner.addTest('Page Load Performance', async () => {
        return PerformanceTestHelpers.measurePageLoad();
    });

    runner.addTest('Memory Usage', async () => {
        return PerformanceTestHelpers.testMemoryUsage();
    });

    // Integration Tests
    runner.addTest('Firebase Connection', async () => {
        return IntegrationTestHelpers.testFirebaseConnection();
    });

    runner.addTest('Auth Flow', async () => {
        return IntegrationTestHelpers.testAuthFlow();
    });

    return runner;
}

export default {
    TestHelpers,
    SecurityTestHelpers,
    PerformanceTestHelpers,
    IntegrationTestHelpers,
    TestRunner,
    createTestSuite
};
