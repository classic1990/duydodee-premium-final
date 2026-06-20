/**
 * 🔄 Firebase Fallback Mode
 * Development mode simulation สำหรับการพัฒนาโดยไม่ต้องใช้ Firebase จริง
 */

class FirebaseFallback {
    constructor() {
        this.isFallbackMode = !this.hasValidFirebaseConfig();
        this.initializeFallback();
    }

    /**
     * ตรวจสอบว่ามี Firebase config จริงหรือไม่
     */
    hasValidFirebaseConfig() {
        const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
        const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;

        // เช็คว่าไม่ใช่ placeholder value
        const isNotPlaceholder = !apiKey.includes('placeholder') &&
                               !apiKey.includes('your_') &&
                               !apiKey.length < 30;

        return isNotPlaceholder && apiKey && projectId;
    }

    /**
     * Initialize fallback mode
     */
    initializeFallback() {
        if (this.isFallbackMode) {
            console.warn('🔄 Firebase Fallback Mode: Running in simulation mode');
            console.warn('🔄 Some features will be limited (auth, database, storage)');

            // Override Firebase methods with simulation
            this.setupSimulationMode();
        }
    }

    /**
     * Setup simulation mode
     */
    setupSimulationMode() {
        // Create mock users for testing
        this.mockUsers = [
            {
                uid: 'mock-user-123',
                email: 'dev@duydodee.dev',
                displayName: 'Developer User',
                emailVerified: true,
                isAdmin: true
            },
            {
                uid: 'mock-user-456',
                email: 'user@duydodee.dev',
                displayName: 'Test User',
                emailVerified: true,
                isAdmin: false
            }
        ];

        // Mock database data
        this.mockData = {
            users: this.mockUsers,
            movies: [
                { id: 'movie-1', title: 'Test Movie 1', poster: '/assets/B1.png', views: 100 },
                { id: 'movie-2', title: 'Test Movie 2', poster: '/assets/B1.png', views: 50 }
            ],
            watchHistory: [
                { userId: 'mock-user-123', movieId: 'movie-1', timestamp: Date.now() }
            ],
            watchlist: [
                { userId: 'mock-user-123', movieId: 'movie-2', addedAt: Date.now() }
            ]
        };
    }

    /**
     * Mock authentication
     */
    async signIn(email, password) {
        if (!this.isFallbackMode) {
            return null;
        }

        // Simulate sign-in delay
        await this.delay(500);

        // Find mock user
        const user = this.mockUsers.find(u => u.email === email);

        if (user && password === 'test123') {
            return {
                user,
                provider: 'mock',
                token: 'mock-token-123456789'
            };
        }

        throw new Error('Invalid credentials (fallback mode: use email: dev@duydodee.dev, password: test123)');
    }

    /**
     * Mock sign out
     */
    async signOut() {
        if (!this.isFallbackMode) {
            return null;
        }

        await this.delay(200);
        return { success: true };
    }

    /**
     * Mock sign up
     */
    async signUp(email, password, displayName) {
        if (!this.isFallbackMode) {
            return null;
        }

        await this.delay(700);

        const newUser = {
            uid: `mock-user-${Date.now()}`,
            email,
            displayName: displayName || email.split('@')[0],
            emailVerified: false,
            isAdmin: false
        };

        this.mockUsers.push(newUser);

        return {
            user: newUser,
            provider: 'mock'
        };
    }

    /**
     * Mock get current user
     */
    async getCurrentUser() {
        if (!this.isFallbackMode) {
            return null;
        }

        await this.delay(100);

        // Return mock user for testing
        return this.mockUsers[0];
    }

    /**
     * Mock database get
     */
    async get(collection) {
        if (!this.isFallbackMode) {
            return null;
        }

        await this.delay(100);

        if (this.mockData[collection]) {
            return {
                docs: this.mockData[collection].map(item => ({
                    id: item.id,
                    data: () => item
                }))
            };
        }
        return { docs: [] };
    }

    /**
     * Mock database add
     */
    async add(collection, data) {
        if (!this.isFallbackMode) {
            return null;
        }

        await this.delay(150);

        const newItem = {
            id: `${collection}-${Date.now()}`,
            ...data,
            timestamp: Date.now()
        };

        if (!this.mockData[collection]) {
            this.mockData[collection] = [];
        }

        this.mockData[collection].push(newItem);

        return { id: newItem.id };
    }

    /**
     * Mock database update
     */
    async update(collection, docId, data) {
        if (!this.isFallbackMode) {
            return null;
        }

        await this.delay(150);

        const collectionData = this.mockData[collection];
        const item = collectionData.find(i => i.id === docId);

        if (item) {
            Object.assign(item, data);
            return { success: true };
        }

        throw new Error(`Document ${docId} not found in ${collection}`);
    }

    /**
     * Mock database delete
     */
    async delete(collection, docId) {
        if (!this.isFallbackMode) {
            return null;
        }

        await this.delay(100);

        const collectionData = this.mockData[collection];
        const index = collectionData.findIndex(i => i.id === docId);

        if (index !== -1) {
            collectionData.splice(index, 1);
            return { success: true };
        }

        throw new Error(`Document ${docId} not found in ${collection}`);
    }

    /**
     * Mock storage upload
     */
    async uploadFile(path, file) {
        if (!this.isFallbackMode) {
            return null;
        }

        await this.delay(500);

        return {
            fullPath: `mock-uploads/${path}`,
            downloadURL: `/assets/B1.png` // Mock URL
        };
    }

    /**
     * Check if in fallback mode
     */
    isFallbackModeEnabled() {
        return this.isFallbackMode;
    }

    /**
     * Get mode information
     */
    getModeInfo() {
        return {
            mode: this.isFallbackMode ? 'FALLBACK' : 'PRODUCTION',
            firebaseEnabled: !this.isFallbackMode,
            availableFeatures: this.isFallbackMode ? [
                '✅ Mock Authentication',
                '✅ Mock Database',
                '✅ Mock Storage',
                '✅ Offline Testing'
            ] : [
                '✅ Firebase Authentication',
                '✅ Firebase Database',
                '✅ Firebase Storage',
                '✅ Real-time Sync'
            ]
        };
    }

    /**
     * Helper: delay for simulation
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Create singleton instance
const firebaseFallback = new FirebaseFallback();

export default firebaseFallback;
