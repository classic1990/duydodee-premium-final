import errorHandler from '../utils/error-handler.js';
import {
    auth, db, doc, getDoc, setDoc, serverTimestamp,
    collection, getDocs, googleProvider,
    updateProfile, updateDoc, increment, writeBatch,
    onAuthStateChanged, signOut, signInWithPopup, signInWithEmailAndPassword,
    createUserWithEmailAndPassword, sendEmailVerification,
    firebaseFallback, useFallback
} from './firebase-config.js';
import { SCHEMA } from '../constants.js';
import config from '../config/index.js';

/**
 * 🔐 DUYดูDEE AUTH SERVICE
 * Handles authentication, user profiles, and permissions.
 */
export const AuthService = {
    auth,
    /**
     * Listen for auth state changes
     */
    onStateChanged(callback) {
        if (useFallback) {
            // In fallback mode, immediately call callback with mock user
            firebaseFallback.getCurrentUser().then(user => {
                callback(user);
            });
            return () => {}; // Mock unsubscribe
        }
        return onAuthStateChanged(auth, callback);
    },

    /**
     * Check if user is an admin or master
     * 🔒 SECURITY: Only Google login is allowed for admin access
     */
    async checkIsAdmin(user) {
        if (!user) {
            return false;
        }

        // In fallback mode, check mock user admin status
        if (useFallback) {
            return user.isAdmin || false;
        }

        // 🔒 SECURITY CHECK: Verify user logged in with Google only
        if (!this.isGoogleUser(user)) {
            // Using error handler for security alert
            console.warn('Security Alert: Non-Google login attempt for admin access');
            return false;
        }

        // Admin access from environment configuration
        if (config.isAdmin(user.email)) {
            return true;
        }

        try {
            const snap = await getDoc(doc(db, SCHEMA.COLLECTIONS.USERS, user.uid));
            if (!snap.exists()) {
                return false;
            }
            const role = (snap.data().role || '').toLowerCase();
            return role === SCHEMA.ROLES.MASTER.toLowerCase() || role === SCHEMA.ROLES.ADMIN.toLowerCase();
        } catch (e) {
            errorHandler.logError({ type: 'error', message: 'Admin check failed', stack: e.stack });
            return false;
        }
    },

    /**
     * 🔒 Check if user logged in with Google
     * Returns true if user has Google provider data
     */
    isGoogleUser(user) {
        if (!user || !user.providerData) {
            return false;
        }
        // Check if user has Google provider
        return user.providerData.some(provider => provider.providerId === 'google.com');
    },

    /**
     * Save watch history
     */
    async saveWatchHistory(userId, item, progress = 0) {
        if (!userId || !item.id) {
            return;
        }

        if (useFallback) {
            try {
                await firebaseFallback.add('watchHistory', {
                    userId,
                    movieId: item.id,
                    title: item.title,
                    poster: item.poster,
                    category: item.category || 'Premium',
                    type: item.type || 'movie',
                    progress,
                    epIndex: item.epIndex || 0,
                    watchedAt: Date.now()
                });
                console.log('🔄 [Fallback] Watch history saved');
            } catch (e) {
                errorHandler.logError({ type: 'error', message: 'History Save Error', stack: e.stack });
            }
            return;
        }

        try {
            const historyRef = doc(db, SCHEMA.COLLECTIONS.USERS, userId, 'history', item.id);
            const data = {
                id: item.id,
                title: item.title,
                poster: item.poster,
                category: item.category || 'Premium',
                type: item.type || 'movie',
                progress: progress,
                epIndex: item.epIndex || 0,
                watchedAt: serverTimestamp()
            };
            await setDoc(historyRef, data, { merge: true });

            // 📊 💡 เก็บพฤติกรรมความชอบหมวดหมู่ (Category Preference)
            if (item.category) {
                const userRef = doc(db, SCHEMA.COLLECTIONS.USERS, userId);
                const prefKey = `preferredCategories.${item.category}`;
                await updateDoc(userRef, {
                    [prefKey]: increment(1)
                });
            }
        } catch (e) {
            errorHandler.logError({ type: 'error', message: 'History Save Error', stack: e.stack });
        }
    },

    /**
     * Clear watch history
     */
    async clearWatchHistory(userId) {
        if (!userId) {
            return false;
        }

        if (useFallback) {
            try {
                // Clear all watch history for this user in mock data
                firebaseFallback.mockData.watchHistory = firebaseFallback.mockData.watchHistory.filter(
                    w => w.userId !== userId
                );
                console.log('🔄 [Fallback] Watch history cleared');
                return true;
            } catch (e) {
                errorHandler.logError({ type: 'error', message: 'History Clear Error', stack: e.stack });
                return false;
            }
        }

        try {
            const historyRef = collection(db, SCHEMA.COLLECTIONS.USERS, userId, 'history');
            const snap = await getDocs(historyRef);
            const batch = writeBatch(db);
            snap.docs.forEach(d => batch.delete(d.ref));
            await batch.commit();
            return true;
        } catch (e) {
            errorHandler.logError({ type: 'error', message: 'History Clear Error', stack: e.stack });
            return false;
        }
    },

    /**
     * Sign out
     */
    async logout() {
        if (useFallback) {
            try {
                await firebaseFallback.signOut();
                return true;
            } catch (error) {
                errorHandler.logError({ type: 'error', message: 'Logout error', stack: error.stack });
                throw error;
            }
        }

        try {
            await signOut(auth);
            return true;
        } catch (error) {
            errorHandler.logError({ type: 'error', message: 'Logout error', stack: error.stack });
            throw error;
        }
    },

    /**
     * Google Login
     */
    async loginWithGoogle() {
        if (useFallback) {
            try {
                const result = await firebaseFallback.signIn('dev@duydodee.dev', 'test123');
                return result.user;
            } catch (error) {
                errorHandler.logError({ type: 'error', message: 'Google Login error', stack: error.stack });
                throw error;
            }
        }

        try {
            const result = await signInWithPopup(auth, googleProvider);
            await this.syncUserToFirestore(result.user);
            return result.user;
        } catch (error) {
            errorHandler.logError({ type: 'error', message: 'Google Login error', stack: error.stack });
            throw error;
        }
    },

    /**
     * Email Login
     */
    async loginWithEmail(email, password) {
        if (useFallback) {
            try {
                const result = await firebaseFallback.signIn(email, password);
                return result.user;
            } catch (error) {
                errorHandler.logError({ type: 'error', message: 'Email Login error', stack: error.stack });
                throw error;
            }
        }

        try {
            const result = await signInWithEmailAndPassword(auth, email, password);
            await this.syncUserToFirestore(result.user);
            return result.user;
        } catch (error) {
            errorHandler.logError({ type: 'error', message: 'Email Login error', stack: error.stack });
            throw error;
        }
    },

    /**
     * Email Register
     */
    async registerWithEmail(name, email, password) {
        if (useFallback) {
            try {
                const result = await firebaseFallback.signUp(email, password, name);
                return result.user;
            } catch (error) {
                errorHandler.logError({ type: 'error', message: 'Email Register error', stack: error.stack });
                throw error;
            }
        }

        try {
            const result = await createUserWithEmailAndPassword(auth, email, password);
            const user = result.user;
            await updateProfile(user, { displayName: name });
            await sendEmailVerification(user);
            await this.syncUserToFirestore(user, name);
            return user;
        } catch (error) {
            errorHandler.logError({ type: 'error', message: 'Email Register error', stack: error.stack });
            throw error;
        }
    },

    /**
     * Sync user data to Firestore
     */
    async syncUserToFirestore(user, customName = null) {
        if (!user) {
            return;
        }

        if (useFallback) {
            // In fallback mode, user data is already in mock users
            console.log('🔄 [Fallback] User sync skipped (using mock data)');
            return;
        }

        const userRef = doc(db, SCHEMA.COLLECTIONS.USERS, user.uid);
        try {
            const snap = await getDoc(userRef);
            const data = {
                uid: user.uid,
                email: user.email,
                displayName: customName || user.displayName || 'Member',
                photoURL: user.photoURL || '',
                lastLogin: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            if (!snap.exists()) {
                data.role = config.isAdmin(user.email) ? SCHEMA.ROLES.ADMIN : SCHEMA.ROLES.MEMBER;
                data.createdAt = serverTimestamp();
                data.isBanned = false;
                await setDoc(userRef, data);
            } else {
                // 💡 Upgrade to admin if listed in config but firestore says member
                const currentRole = snap.data().role;
                if (config.isAdmin(user.email) && currentRole === SCHEMA.ROLES.MEMBER) {
                    data.role = SCHEMA.ROLES.ADMIN;
                }
                await setDoc(userRef, data, { merge: true });
            }
        } catch (err) {
            errorHandler.logError({ type: 'error', message: 'Sync User Error', stack: err.stack });
        }
    },

    /**
     * Check if user is banned
     */
    async isUserBanned(uid) {
        if (useFallback) {
            // In fallback mode, no users are banned
            return false;
        }

        try {
            const snap = await getDoc(doc(db, SCHEMA.COLLECTIONS.USERS, uid));
            return snap.exists() && snap.data().isBanned === true;
        } catch (e) {
            errorHandler.logError({ type: 'error', message: 'Check Banned Error', stack: e.stack });
            return false;
        }
    }
};
