import { auth, googleProvider, signInWithPopup, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, db, doc, getDoc, setDoc, serverTimestamp, onAuthStateChanged } from '/src/services/firebase.js';

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
    onStateChanged: (callback) => onAuthStateChanged(auth, callback),
    checkIsAdmin: async (user) => {
        if (!user) return false;
        if (user.uid === 'fpjTWGXIFCYZNWIubqhUGuSFvZk1' || user.email === 'duyclassic191@gmail.com') return true;
        const userSnap = await getDoc(doc(db, 'users', user.uid));
        if (userSnap.exists()) {
            const data = userSnap.data();
            return data.role === 'admin' || data.role === 'super-admin' || data.email === 'duyclassic191@gmail.com';
        }
        return false;
    }
};
