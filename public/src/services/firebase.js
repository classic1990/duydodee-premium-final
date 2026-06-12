// 💠 DUYดูDEE FIREBASE BRIDGE (V6.0 Compatibility)
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getFirestore, collection, doc, getDoc, setDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy, limit, startAfter, serverTimestamp, increment, getDocs, collectionGroup, documentId } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js';
import { getMessaging, getToken, onMessage } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging.js';

// Firebase Configuration (HD App - Production)
const firebaseConfig = {
    apiKey: 'AIzaSyA-wkZzTVU2Uu7onIAeqzUWBl8HBc1VwTA',
    authDomain: 'duydodeesport.firebaseapp.com',
    projectId: 'duydodeesport',
    storageBucket: 'duydodeesport.firebasestorage.app',
    messagingSenderId: '435929814225',
    appId: '1:435929814225:web:e900f024c92e079540e1f0',
    measurementId: 'G-VVEY9N62BQ'
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const messaging = getMessaging(app);
export const googleProvider = new GoogleAuthProvider();

export {
    collection, doc, getDoc, setDoc, addDoc, updateDoc, deleteDoc,
    query, where, orderBy, limit, startAfter, serverTimestamp, increment, getDocs, collectionGroup, documentId,
    onAuthStateChanged, signInWithPopup, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword,
    getToken, onMessage,
    ref, uploadBytes, getDownloadURL
};

export const SCHEMA = {
    COLLECTIONS: {
        USERS: 'users',
        MOVIES: 'movies',
        SERIES: 'series'
    }
};

export const logActivity = async (action, details) => {
    try {
        const user = auth.currentUser;
        await addDoc(collection(db, 'activity_logs'), {
            uid: user ? user.uid : 'system',
            email: user ? user.email : 'system',
            action,
            details,
            timestamp: serverTimestamp()
        });
    } catch (err) {
        console.error('Failed to log activity:', err);
    }
};
