/**
 * 🔥 DUYดูDEE FIREBASE CENTRAL SERVICE
 * Re-exports services from firebase-config and provides shared utilities.
 */

import {
    db,
    auth,
    storage,
    functions,
    rtdb,
    googleProvider,
    signInWithPopup,
    onAuthStateChanged,
    signOut,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    updateProfile,
    sendPasswordResetEmail,
    sendEmailVerification,
    httpsCallable,
    arrayUnion,
    collection,
    collectionGroup,
    getDocs,
    doc,
    getDoc,
    setDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp,
    increment,
    startAfter,
    writeBatch,
    runTransaction,
    getCountFromServer,
    getAggregateFromServer,
    sum,
    onSnapshot,
    ref,
    getDownloadURL,
    uploadBytes,
    deleteObject,
    rtdbRef,
    onValue,
    set,
    onDisconnect,
    rtdbTimestamp
} from './firebase-config.js';

import { SCHEMA } from '../constants.js';
import { UIUtils } from '../utils/ui-utils.js';

// Re-export Constants
export { SCHEMA };

// 🛠️ SHARED UTILITIES

/**
 * Check if current user is an admin
 * 🔒 SECURITY: Only Google login is allowed for admin access
 */
export async function checkIsAdmin(user) {
    if (!user) {
        return false;
    }

    // 🔒 SECURITY CHECK: Verify user logged in with Google only
    if (!isGoogleUser(user)) {
        console.error('Security Alert: Non-Google login attempt for admin access');
        return false;
    }

    try {
        const userDoc = await getDoc(doc(db, SCHEMA.COLLECTIONS.USERS, user.uid));
        if (userDoc.exists()) {
            const role = userDoc.data().role;
            return role === SCHEMA.ROLES.ADMIN || role === SCHEMA.ROLES.MASTER;
        }
        return false;
    } catch (error) {
        console.error('Error checking admin status:', error);
        return false;
    }
}

/**
 * 🔒 Check if user logged in with Google
 */
function isGoogleUser(user) {
    if (!user || !user.providerData) {
        return false;
    }
    return user.providerData.some(provider => provider.providerId === 'google.com');
}

/**
 * Log activity to Firestore
 */
export async function logActivity(action, details) {
    const user = auth.currentUser;
    if (!user) {
        return;
    }
    try {
        await addDoc(collection(db, SCHEMA.COLLECTIONS.ACTIVITY_LOGS), {
            userId: user.uid,
            userName: user.displayName || 'System User',
            userEmail: user.email,
            action,
            details,
            timestamp: serverTimestamp()
        });
    } catch (error) {
        console.error('Error logging activity:', error);
    }
}

/**
 * Toggle watchlist for a content item
 */
export async function toggleWatchlist(contentId, data, type = 'movie') {
    const user = auth.currentUser;
    if (!user) {
        throw new Error('Authentication required');
    }

    const watchlistRef = doc(db, SCHEMA.COLLECTIONS.USERS, user.uid, 'watchlist', contentId);
    try {
        const snap = await getDoc(watchlistRef);
        if (snap.exists()) {
            await deleteDoc(watchlistRef);
            return { added: false };
        } else {
            await setDoc(watchlistRef, {
                ...data,
                id: contentId,
                type,
                addedAt: serverTimestamp()
            });
            return { added: true };
        }
    } catch (error) {
        console.error('Error toggling watchlist:', error);
        throw error;
    }
}

/**
 * Get user watch history
 */
export async function getWatchHistory(userId) {
    if (!userId) {
        return [];
    }
    try {
        const q = query(
            collection(db, SCHEMA.COLLECTIONS.USERS, userId, 'history'),
            orderBy('updatedAt', 'desc'),
            limit(10)
        );
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (error) {
        console.error('Error getting watch history:', error);
        return [];
    }
}

// Re-export UI helper used in many places
export const getMediaWatchPath = UIUtils.getMediaWatchPath;

// Export all Firebase services and Firestore methods
export {
    db,
    auth,
    storage,
    functions,
    googleProvider,
    signInWithPopup,
    onAuthStateChanged,
    signOut,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    updateProfile,
    sendPasswordResetEmail,
    sendEmailVerification,
    httpsCallable,
    arrayUnion,
    collection,
    collectionGroup,
    getDocs,
    doc,
    getDoc,
    setDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp,
    increment,
    startAfter,
    writeBatch,
    runTransaction,
    getCountFromServer,
    getAggregateFromServer,
    sum,
    onSnapshot,
    ref,
    getDownloadURL,
    uploadBytes,
    deleteObject,
    rtdb,
    rtdbRef,
    onValue,
    set,
    onDisconnect,
    rtdbTimestamp
};
