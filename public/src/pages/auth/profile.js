import { auth, onAuthStateChanged, db, doc, getDoc, SCHEMA, collection, getDocs } from '../../services/firebase.js';
import { AuthService } from '../../services/auth-service.js';
import { UI } from '../../components/ui.js';

document.addEventListener('DOMContentLoaded', () => {
    UI.injectStarfield();
    UI.initNavbar();

    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            window.location.href = '/login.html';
            return;
        }
        loadUserProfile(user);
    });

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.onclick = async () => {
            await AuthService.logout();
            window.location.href = '/';
        };
    }
});

async function loadUserProfile(user) {
    try {
        const userRef = doc(db, SCHEMA.COLLECTIONS.USERS, user.uid);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.exists() ? userSnap.data() : {};

        document.getElementById('user-name').innerText = userData.displayName || 'Premium Member';
        document.getElementById('user-email').innerText = userData.email || user.email;
        document.getElementById('user-role').innerText = userData.role || 'Member';
        document.getElementById('profile-img').src = userData.photoURL || user.photoURL || '/assets/logo/DUYDODEE.png';

        loadStats(user.uid, userData);
    } catch (err) {
        console.error('Profile Load Error:', err);
    }
}

async function loadStats(uid, userData) {
    try {
        const watchlistSnap = await getDocs(collection(db, SCHEMA.COLLECTIONS.USERS, uid, 'bookmarks'));
        document.getElementById('stat-watchlist').innerText = watchlistSnap.size;

        const historySnap = await getDocs(collection(db, SCHEMA.COLLECTIONS.USERS, uid, 'history'));
        document.getElementById('stat-watching').innerText = historySnap.size;
    } catch (err) {
        console.error('Stats Load Error:', err);
    }
}
