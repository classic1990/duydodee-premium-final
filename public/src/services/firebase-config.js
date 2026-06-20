// 💠 Firebase Configuration - DUYDOODEE Master Edition
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import firebaseFallback from './firebase-fallback.js';
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    onAuthStateChanged,
    signOut,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    updateProfile,
    sendPasswordResetEmail,
    sendEmailVerification
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import {
    getFirestore,
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
    arrayUnion,
    runTransaction,
    getCountFromServer,
    getAggregateFromServer,
    sum,
    onSnapshot
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import {
    getStorage,
    ref,
    getDownloadURL,
    uploadBytes,
    deleteObject
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js';
import {
    getFunctions,
    httpsCallable
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-functions.js';
import config from '../config/index.js';

// Use environment configuration with fallback to existing config
const firebaseConfig = config.get('firebase');

// Check if we should use fallback mode
const useFallback = firebaseFallback.isFallbackModeEnabled();

let app, db, auth, storage, functions, googleProvider;

if (useFallback) {
    console.warn('🔄 Using Firebase Fallback Mode - Simulation Mode Active');
    app = null;
    db = null;
    auth = null;
    storage = null;
    functions = null;
    googleProvider = null;
} else {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    storage = getStorage(app);
    functions = getFunctions(app);
    googleProvider = new GoogleAuthProvider();
}

export {
    db,
    auth,
    storage,
    functions,
    googleProvider,
    firebaseFallback,
    useFallback,
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
    deleteObject
};
