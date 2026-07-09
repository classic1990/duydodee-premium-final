// 💠 DUYดูDEE FIREBASE BRIDGE (V6.0 Compatibility)
// This file provides backward compatibility for scripts using the old firebase.js import pattern.
// New code should import directly from firebase-config.js, AuthService, or ContentService.

import * as FirebaseConfig from './firebase-config.js';
import { AuthService } from './auth-service.js';
import { SCHEMA as SchemaConstants } from '../constants.js';
import { UIUtils } from '../utils/ui-utils.js';

// Re-export all Firebase base instances and functions
export const db = FirebaseConfig.db;
export const auth = FirebaseConfig.auth;
export const storage = FirebaseConfig.storage;
export const googleProvider = FirebaseConfig.googleProvider;

export const signInWithPopup = FirebaseConfig.signInWithPopup;
export const onAuthStateChanged = FirebaseConfig.onAuthStateChanged;
export const signOut = FirebaseConfig.signOut;
export const signInWithEmailAndPassword = FirebaseConfig.signInWithEmailAndPassword;
export const createUserWithEmailAndPassword = FirebaseConfig.createUserWithEmailAndPassword;
export const updateProfile = FirebaseConfig.updateProfile;
export const sendPasswordResetEmail = FirebaseConfig.sendPasswordResetEmail;

export const collection = FirebaseConfig.collection;
export const collectionGroup = FirebaseConfig.collectionGroup;
export const getDocs = FirebaseConfig.getDocs;
export const doc = FirebaseConfig.doc;
export const getDoc = FirebaseConfig.getDoc;
export const setDoc = FirebaseConfig.setDoc;
export const addDoc = FirebaseConfig.addDoc;
export const updateDoc = FirebaseConfig.updateDoc;
export const deleteDoc = FirebaseConfig.deleteDoc;
export const query = FirebaseConfig.query;
export const where = FirebaseConfig.where;
export const orderBy = FirebaseConfig.orderBy;
export const limit = FirebaseConfig.limit;
export const serverTimestamp = FirebaseConfig.serverTimestamp;
export const increment = FirebaseConfig.increment;
export const startAfter = FirebaseConfig.startAfter;
export const writeBatch = FirebaseConfig.writeBatch;
export const getCountFromServer = FirebaseConfig.getCountFromServer;
export const getAggregateFromServer = FirebaseConfig.getAggregateFromServer;
export const sum = FirebaseConfig.sum;
export const onSnapshot = FirebaseConfig.onSnapshot;

export const ref = FirebaseConfig.ref;
export const getDownloadURL = FirebaseConfig.getDownloadURL;
export const uploadBytes = FirebaseConfig.uploadBytes;
export const deleteObject = FirebaseConfig.deleteObject;

// Re-export Schema and Logic
export const SCHEMA = SchemaConstants;
export const getMediaWatchPath = UIUtils.getMediaWatchPath;
export const logActivity = AuthService.logActivity;
export const checkIsAdmin = AuthService.checkIsAdmin;
export const saveWatchHistory = AuthService.saveWatchHistory;
export const getWatchHistory = AuthService.getWatchHistory;
export const updateDailyStats = async (dateId, statData) => {
    const { ContentService } = await import('./content-service.js');
    return ContentService.updateDailyStats(dateId, statData);
};



