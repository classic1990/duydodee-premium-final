import {
  auth,
  db,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  addDoc,
  serverTimestamp,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  googleProvider,
  updateProfile
} from './firebase-config.js';
import {
  onAuthStateChanged,
  signOut,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { SCHEMA } from '../constants.js';
import { logger } from '../utils/logger.js';
import { Validator } from '../utils/validator.js';

/**
 * 🔐 DUYดูDEE AUTH SERVICE
 * Handles authentication, user profiles, and permissions.
 */
export const AuthService = {
  /**
   * Listen for auth state changes
   */
  onStateChanged(callback) {
    return onAuthStateChanged(auth, callback);
  },

  /**
   * Check if user is an admin or master
   */
  async checkIsAdmin(user) {
    if (!user) {
      return false;
    }
    try {
      const snap = await getDoc(doc(db, SCHEMA.COLLECTIONS.USERS, user.uid));
      if (!snap.exists()) {
        return false;
      }
      const role = (snap.data().role || '').toLowerCase();
      return (
        role === SCHEMA.ROLES.MASTER.toLowerCase() || role === SCHEMA.ROLES.ADMIN.toLowerCase()
      );
    } catch (e) {
      logger.error('Admin check failed', { error: e.message });
      return false;
    }
  },

  /**
   * Save watch history
   */
  async saveWatchHistory(userId, item) {
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
        watchedAt: serverTimestamp()
      };
      await setDoc(historyRef, data, { merge: true });
    } catch (e) {
      logger.error('History Save Error', { error: e.message, userId, itemId: item.id });
    }
  },

  /**
   * Get watch history
   */
  async getWatchHistory(userId, count = 6) {
    if (!userId) {
      return [];
    }
    try {
      const q = query(
        collection(db, SCHEMA.COLLECTIONS.USERS, userId, 'history'),
        orderBy('watchedAt', 'desc'),
        limit(count)
      );
      const snap = await getDocs(q);
      return snap.docs.map((d) => d.data());
    } catch (e) {
      logger.error('History Fetch Error', { error: e.message, userId });
      return [];
    }
  },

  /**
   * Log admin activity
   */
  async logActivity(action, details) {
    try {
      const user = auth.currentUser;
      await addDoc(collection(db, SCHEMA.COLLECTIONS.ACTIVITY_LOGS), {
        adminEmail: user?.email || 'System',
        adminName: user?.displayName || 'Unknown',
        action: action,
        details: details,
        timestamp: serverTimestamp()
      });
    } catch (e) {
      logger.error('Log Error', { error: e.message, action, details });
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
      logger.error('Logout error', { error: error.message });
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
      logger.error('Google Login error', { error: error.message });
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
      logger.error('Email Login error', { error: error.message });
      throw error;
    }
  },

  /**
   * Email Register
   */
  async registerWithEmail(name, email, password) {
    try {
      // Sanitize inputs
      const sanitizedName = Validator.sanitizeInput(name);
      const sanitizedEmail = Validator.sanitizeInput(email);

      const result = await createUserWithEmailAndPassword(auth, sanitizedEmail, password);
      const user = result.user;
      await updateProfile(user, { displayName: sanitizedName });
      await this.syncUserToFirestore(user, sanitizedName);
      return user;
    } catch (error) {
      logger.error('Email Register error', { error: error.message });
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

      if (snap.exists()) {
        // User already exists, just update login time
        await updateDoc(userRef, {
          lastLogin: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      } else {
        data.role = SCHEMA.ROLES.MEMBER;
        data.createdAt = serverTimestamp();
        data.isBanned = false;
        await setDoc(userRef, data);
      }
    } catch (err) {
      logger.error('Sync User Error', { error: err.message, userId: user?.uid });
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
      return false;
    }
  }
};
