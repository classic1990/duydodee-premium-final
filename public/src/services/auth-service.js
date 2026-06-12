import { auth, googleProvider, signInWithPopup, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, db, doc, setDoc, serverTimestamp, onAuthStateChanged } from './firebase.js';

export const AuthService = {
    loginWithEmail: (email, password) => signInWithEmailAndPassword(auth, email, password),
    registerWithEmail: async (name, email, password) => {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, 'users', userCred.user.uid), {
            displayName: name,
            email: email,
            role: 'Member',
            createdAt: serverTimestamp()
        });
        return userCred.user;
    },
    loginWithGoogle: async () => {
        const result = await signInWithPopup(auth, googleProvider);
        return result.user;
    },
    logout: () => signOut(auth),
    onStateChanged: (callback) => onAuthStateChanged(auth, callback)
};
