import errorHandler from '../utils/error-handler.js';
import {
    auth, db, doc, getDoc, setDoc, serverTimestamp,
    collection, getDocs, googleProvider,
    updateProfile, updateDoc, increment, writeBatch
} from './firebase-config.js';
import {
    onAuthStateChanged, signOut, signInWithPopup, signInWithEmailAndPassword,
    createUserWithEmailAndPassword, sendEmailVerification
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
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
            return;
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
            throw e;
        }
    },

    /**
     * Sign out
     */
    async logout() {
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
        try {
            const snap = await getDoc(doc(db, SCHEMA.COLLECTIONS.USERS, uid));
            return snap.exists() && snap.data().isBanned === true;
        } catch (e) {
            errorHandler.logError({ type: 'error', message: 'Check Banned Error', stack: e.stack });
            return false;
        }
    }
};
