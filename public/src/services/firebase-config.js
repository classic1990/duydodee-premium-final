// 💠 Firebase Configuration - DUYDOODEE Master Edition
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
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
  sendEmailVerification,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
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
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  getStorage,
  ref,
  getDownloadURL,
  uploadBytes,
  deleteObject,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";
import {
  getFunctions,
  httpsCallable,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-functions.js";

const firebaseConfig = {
  apiKey: "AIzaSyBZz2QI4hb2FAVjhhNCP8rARVo_zlv7_KA",
  authDomain: "duydodeesport.firebaseapp.com",
  projectId: "duydodeesport",
  storageBucket: "duydodeesport.appspot.com",
  messagingSenderId: "30514101130",
  appId: "1:30514101130:web:1ec44f2b09367468132e49",
  measurementId: "G-7EC2RQZH22",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);
const functions = getFunctions(app);
const googleProvider = new GoogleAuthProvider();

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
};
