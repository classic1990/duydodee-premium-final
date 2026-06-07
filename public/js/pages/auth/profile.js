import { auth, db, collection, getDocs, query, orderBy, limit, SCHEMA } from '/js/services/firebase.js';
import { UI } from '/js/components/ui.js';
import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

/**
 * 👤 PROFILE ENGINE - Professional Member View
 */
document.addEventListener('DOMContentLoaded', () => {
    UI.initNavbar();

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            await loadUserProfile(user);
            await loadWatchHistory(user);
        } else {
            window.location.href = '/login.html';
        }
    });
});

async function loadUserProfile(user) {
    const nameEl = document.getElementById('user-display-name');
    const emailEl = document.getElementById('user-email');
    const photoEl = document.getElementById('profile-pic');
    const logoutBtn = document.getElementById('logout-btn');
    
    if (!nameEl || !emailEl) return;

    try {
        const userDoc = await getDoc(doc(db, SCHEMA.COLLECTIONS.USERS, user.uid));
        const userData = userDoc.exists() ? userDoc.data() : {};
        
        nameEl.innerText = userData.displayName || user.displayName || 'MEMBER';
        emailEl.innerText = user.email.toLowerCase();
        if (photoEl && userData.photoURL) photoEl.src = userData.photoURL.replace('s96-c', 's400-c');

        // Check for admin/master role or specific email
        const role = (userData.role || '').toLowerCase();
        const isAdmin = ['super-admin', 'admin', 'master'].includes(role) || user.email === 'duyclassic191@gmail.com';

        // Inject Admin link if user is admin
        const actionButtons = logoutBtn.parentElement;
        if (isAdmin && !document.getElementById('admin-btn')) {
            const adminLink = document.createElement('a');
            adminLink.id = 'admin-btn';
            adminLink.href = '/admin/admin-manage.html';
            adminLink.className = 'px-5 py-2 rounded-xl bg-red-600/10 border border-red-600/20 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-600/20 transition-all Thai-font';
            adminLink.innerText = 'Admin Dashboard';
            actionButtons.insertBefore(adminLink, logoutBtn);
        }

        // Attach logout listener
        logoutBtn.onclick = () => {
            if (confirm('คุณต้องการออกจากระบบใช่หรือไม่?')) {
                signOut(auth).then(() => {
                    UI.showToast('คุณได้ออกจากระบบเรียบร้อยแล้ว', 'success');
                    window.location.href = '/login.html';
                }).catch(e => UI.showToast('Error: ' + e.message, 'error'));
            }
        };
        
        UI.refreshIcons();
    } catch (error) { 
        console.error('Profile Error:', error); 
    }
}

async function loadWatchHistory(user) {
    const grid = document.getElementById('history-grid');
    if (!grid) return;
    try {
        // Increase limit to 20 for horizontal scrolling
        const q = query(collection(db, SCHEMA.COLLECTIONS.USERS, user.uid, 'history'), orderBy('watchedAt', 'desc'), limit(20));
        const snap = await getDocs(q);
        
        if (snap.empty) { 
            UI.renderEmptyState(grid, 'คุณยังไม่มีประวัติการรับชม'); 
            return; 
        }

        // Render using createHistoryCard (Landscape format)
        grid.innerHTML = snap.docs.map(docSnap => {
            const item = docSnap.data();
            return UI.createHistoryCard(item);
        }).join('');
        
        UI.refreshIcons();
    } catch (err) { 
        console.error('History Error:', err); 
        UI.renderEmptyState(grid, 'ไม่สามารถโหลดประวัติได้');
    }
}
