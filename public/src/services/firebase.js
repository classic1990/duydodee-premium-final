// 💠 DUYดูDEE FIREBASE BRIDGE (V6.0 Compatibility)
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getFirestore, collection, doc, getDoc, setDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy, limit, startAfter, serverTimestamp, increment, getDocs } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js';

// Configuration placeholder (to be replaced with actual config from env/secrets)
const firebaseConfig = {
    apiKey: 'YOUR_API_KEY',
    authDomain: 'duydodeesport.firebaseapp.com',
    projectId: 'duydodeesport',
    storageBucket: 'duydodeesport.appspot.com',
    messagingSenderId: 'YOUR_ID',
    appId: 'YOUR_APP_ID'
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

export { 
    collection, doc, getDoc, setDoc, addDoc, updateDoc, deleteDoc, 
    query, where, orderBy, limit, startAfter, serverTimestamp, increment, getDocs,
    onAuthStateChanged, signInWithPopup, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword
};

export const SCHEMA = {
    COLLECTIONS: {
        USERS: 'users',
        MOVIES: 'movies',
        SERIES: 'series'
    }
};
