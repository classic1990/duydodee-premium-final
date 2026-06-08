// 💠 DUYดูDEE FIREBASE BRIDGE (V6.0 Compatibility)
import * as FirebaseConfig from './firebase-config.js';
import { AuthService } from './auth-service.js';
import { SCHEMA as SchemaConstants } from '../constants.js';
import { UIUtils } from '../utils/ui-utils.js';

// 📦 1. CORE INSTANCES & AUTH
export const { db, auth, storage, functions, googleProvider } = FirebaseConfig;
export const { 
    signInWithPopup, onAuthStateChanged, signOut, httpsCallable,
    signInWithEmailAndPassword, createUserWithEmailAndPassword, 
    updateProfile, sendPasswordResetEmail, sendEmailVerification 
} = FirebaseConfig;

// 📂 2. FIRESTORE & STORAGE ACTIONS
export const {
    collection, collectionGroup, getDocs, doc, getDoc, setDoc, addDoc, updateDoc, deleteDoc,
    query, where, orderBy, limit, serverTimestamp, increment, startAfter, writeBatch, arrayUnion,
    getCountFromServer, getAggregateFromServer, ref, getDownloadURL, uploadBytes, deleteObject, runTransaction
} = FirebaseConfig;

// 🚀 3. DUYDOODEE SHARED SERVICES
export const SCHEMA = SchemaConstants;
export const getMediaWatchPath = UIUtils.getMediaWatchPath;
export const logActivity = AuthService.logActivity;
export const checkIsAdmin = AuthService.checkIsAdmin;
export const saveWatchHistory = AuthService.saveWatchHistory;
export const getWatchHistory = AuthService.getWatchHistory;

/**
 * ❤️ ระบบ Bookmark & Rating (Refactored for Cleanliness)
 */
export const toggleBookmark = async (contentId, data, type = 'movie') => {
    if (!auth.currentUser) return { error: 'กรุณาเข้าสู่ระบบ' };
    const bookmarkRef = doc(db, 'users', auth.currentUser.uid, 'bookmarks', contentId);
    const snap = await getDoc(bookmarkRef);
    const contentRef = doc(db, type === 'series' ? SCHEMA.COLLECTIONS.SERIES : SCHEMA.COLLECTIONS.MOVIES, contentId);
    
    if (snap.exists()) {
        await deleteDoc(bookmarkRef);
        await updateDoc(contentRef, { trendingScore: increment(-0.7) });
        return { status: 'removed' };
    } else {
        await setDoc(bookmarkRef, { ...data, bookmarkedAt: serverTimestamp() });
        await updateDoc(contentRef, { trendingScore: increment(0.7) });
        return { status: 'added' };
    }
};

/**
 * บันทึกคะแนนเรตติ้งและคำนวณคะแนนเฉลี่ยอัตโนมัติ
 */
export const submitRating = async (contentId, type, rating) => {
    if (!auth.currentUser) return { error: 'กรุณาเข้าสู่ระบบก่อนให้คะแนน' };
    
    const userId = auth.currentUser.uid;
    const contentRef = doc(db, type === 'series' ? 'series' : 'movies', contentId);
    const userRatingRef = doc(db, type === 'series' ? 'series' : 'movies', contentId, 'ratings', userId);

    try {
        return await FirebaseConfig.runTransaction(db, async (transaction) => {
            const userRatingSnap = await transaction.get(userRatingRef);
            const contentSnap = await transaction.get(contentRef);
            
            if (!contentSnap.exists()) throw 'ไม่พบข้อมูลเนื้อหา';

            const oldRating = userRatingSnap.exists() ? userRatingSnap.data().rating : 0;
            const contentData = contentSnap.data();
            const currentTotalRating = contentData.ratingSum || 0;
            const currentRatingCount = contentData.ratingCount || 0;

            const newTotalRating = currentTotalRating - oldRating + rating;
            const newRatingCount = userRatingSnap.exists() ? currentRatingCount : currentRatingCount + 1;
            const newAverage = (newTotalRating / newRatingCount).toFixed(1);

            transaction.set(userRatingRef, { rating, updatedAt: FirebaseConfig.serverTimestamp() });
            transaction.update(contentRef, { 
                ratingSum: newTotalRating, 
                ratingCount: newRatingCount,
                rating: parseFloat(newAverage)
            });

            return { status: 'success', average: newAverage };
        });
    } catch (e) {
        console.error('Rating Error:', e);
        return { error: e };
    }
};
