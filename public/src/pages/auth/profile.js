import { auth, onAuthStateChanged, db, doc, getDoc, SCHEMA, collection, getDocs } from '/src/services/firebase.js';
import { AuthService } from '/src/services/auth-service.js';
import { UI } from '/src/components/ui.js';

document.addEventListener('DOMContentLoaded', () => {
    UI.injectStarfield();
    UI.initNavbar();

    // Initialize Lucide icons
    if (window.lucide) {
        window.lucide.createIcons();
    }

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

        // Check if admin by email (hardcoded for duyclassic191@gmail.com)
        const isAdmin = user.email === 'duyclassic191@gmail.com' || userData.email === 'duyclassic191@gmail.com' || userData.role === 'admin';

        if (isAdmin) {
            // Add admin panel link
            const adminLink = document.createElement('a');
            adminLink.href = '/admin/admin-manage.html';
            adminLink.className = 'absolute top-4 right-4 px-6 py-2 bg-brand-primary text-black text-xs font-black uppercase tracking-widest rounded-full hover:scale-105 transition-transform flex items-center gap-2';
            adminLink.innerHTML = '<i data-lucide="shield" class="w-4 h-4 inline-block"></i> แอดมินแผงควบคุม';
            document.getElementById('profile-card').appendChild(adminLink);

            // Re-initialize icons after adding admin link
            if (window.lucide) window.lucide.createIcons();
        }

        // Safely update elements with null checks
        const userNameEl = document.getElementById('user-name');
        if (userNameEl) userNameEl.innerText = userData.displayName || 'Premium Member';

        const userEmailEl = document.getElementById('user-email');
        if (userEmailEl) userEmailEl.innerText = userData.email || user.email;

        const userRoleEl = document.getElementById('user-role');
        if (userRoleEl) {
            userRoleEl.innerText = isAdmin ? 'ADMIN' : (userData.role || 'Member');
            // Style admin role differently
            if (isAdmin) {
                userRoleEl.className = 'px-4 py-1 bg-red-500/20 border border-red-500/30 text-red-500 text-xs font-black uppercase tracking-widest rounded-full';
            }
        }

        const profileImgEl = document.getElementById('profile-img');
        if (profileImgEl) profileImgEl.src = userData.photoURL || user.photoURL || '/assets/logo/DUYDODEE.png';

        loadStats(user.uid, userData);
    } catch (err) {
        console.error('Profile Load Error:', err);
    }
}

async function loadStats(uid, userData) {
    try {
        const watchlistSnap = await getDocs(collection(db, SCHEMA.COLLECTIONS.USERS, uid, 'bookmarks'));
        const statWatchlistEl = document.getElementById('stat-watchlist');
        if (statWatchlistEl) statWatchlistEl.innerText = watchlistSnap.size;

        const historySnap = await getDocs(collection(db, SCHEMA.COLLECTIONS.USERS, uid, 'history'));
        const statWatchingEl = document.getElementById('stat-watching');
        if (statWatchingEl) statWatchingEl.innerText = historySnap.size;
    } catch (err) {
        console.error('Stats Load Error:', err);
    }
}
