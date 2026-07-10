// 💠 Firebase Configuration - DUYDOODEE Master Edition
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import {
    getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut,
    signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, sendPasswordResetEmail
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import {
    getFirestore, collection, collectionGroup, getDocs, doc, getDoc, setDoc, addDoc, updateDoc, deleteDoc,
    query, where, orderBy, limit, serverTimestamp, increment, startAfter, writeBatch,
    getCountFromServer, getAggregateFromServer, sum, onSnapshot
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { getStorage, ref, getDownloadURL, uploadBytes, deleteObject } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'duydodeesport.firebaseapp.com',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'duydodeesport',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'duydodeesport.appspot.com',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '30514101130',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:30514101130:web:1ec44f2b09367468132e49',
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-7EC2RQZH22'
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

export {
    db, auth, storage, googleProvider,
    signInWithPopup, onAuthStateChanged, signOut,
    signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, sendPasswordResetEmail,
    collection, collectionGroup, getDocs, doc, getDoc, setDoc, addDoc, updateDoc, deleteDoc,
    query, where, orderBy, limit, serverTimestamp, increment, startAfter, writeBatch,
    getCountFromServer, getAggregateFromServer, sum, onSnapshot,
    ref, getDownloadURL, uploadBytes, deleteObject
};



