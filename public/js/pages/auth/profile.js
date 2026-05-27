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
    const card = document.getElementById('profile-card');
    if (!card) return;

    try {
        const userDoc = await getDoc(doc(db, SCHEMA.COLLECTIONS.USERS, user.uid));
        const userData = userDoc.exists() ? userDoc.data() : {};
        const role = (userData.role || 'member').toUpperCase();
        
        let roleStyle = 'bg-brand-primary text-black';
        if (['SUPER-ADMIN', 'MASTER', 'ADMIN'].includes(role)) roleStyle = 'bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)]';
        else if (role === 'VIP') roleStyle = 'bg-yellow-500 text-black';

        card.innerHTML = `
            <div class="absolute top-0 right-0 w-80 h-80 bg-brand-primary/10 blur-[120px] rounded-full -mr-20 -mt-20"></div>
            <div class="relative z-10 flex flex-col md:flex-row items-center gap-10 md:gap-16">
                <!-- Avatar Section -->
                <div class="relative group">
                    <div class="absolute -inset-1.5 bg-gradient-to-tr from-brand-primary to-transparent rounded-[2.5rem] blur opacity-20 group-hover:opacity-60 transition-opacity duration-700"></div>
                    <div class="relative w-40 h-40 md:w-48 md:h-48 rounded-[2.2rem] overflow-hidden border-4 border-white/5 shadow-2xl">
                        <img id="user-photo" src="${(userData.photoURL || '/assets/logo/DUYDODEE.png').replace('s96-c', 's400-c')}" class="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110">
                    </div>
                    <div class="absolute -bottom-4 left-1/2 -translate-x-1/2 px-6 py-2 ${roleStyle} rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl whitespace-nowrap border-2 border-black/20 animate-fade-in">
                        ${role}
                    </div>
                </div>

                <!-- Info Section -->
                <div class="flex-1 text-center md:text-left space-y-8">
                    <div class="space-y-3">
                        <p class="text-[10px] font-black text-brand-primary uppercase tracking-[0.4em] opacity-80">Premium Member Profile</p>
                        <h1 id="user-name" class="text-4xl md:text-6xl font-black text-white Thai-font uppercase tracking-tighter drop-shadow-2xl">${userData.displayName || 'MEMBER'}</h1>
                        <p id="user-email" class="text-gray-500 font-bold tracking-widest text-xs md:text-sm">${user.email.toLowerCase()}</p>
                    </div>

                    <div class="flex flex-wrap items-center justify-center md:justify-start gap-4">
                        ${['SUPER-ADMIN', 'MASTER', 'ADMIN'].includes(role) ? `
                            <a href="/admin/admin-manage.html" class="flex items-center gap-3 px-8 py-4 bg-red-600/10 border border-red-600/20 rounded-2xl text-xs font-black uppercase tracking-widest text-red-500 hover:bg-red-600 hover:text-white transition-all group shadow-xl">
                                <i data-lucide="layout-dashboard" class="w-4 h-4 group-hover:rotate-12 transition-transform"></i> 
                                Admin Dashboard
                            </a>
                        ` : ''}
                        <a href="/edit-profile.html" class="flex items-center gap-3 px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-brand-primary hover:text-black hover:border-brand-primary transition-all group shadow-xl">
                            <i data-lucide="settings-2" class="w-4 h-4 text-brand-primary group-hover:text-black transition-colors"></i> 
                            Edit Profile
                        </a>
                        <button id="logout-btn-trigger" class="flex items-center gap-3 px-8 py-4 bg-red-500/5 border border-red-500/10 rounded-2xl text-xs font-black uppercase tracking-widest text-red-500/70 hover:bg-red-500 hover:text-white transition-all group shadow-xl">
                            <i data-lucide="log-out" class="w-4 h-4"></i>
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Re-attach logout listener
        document.getElementById('logout-btn-trigger').onclick = () => {
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
        card.innerHTML = '<div class="text-center py-20 text-red-500 font-black uppercase tracking-widest Thai-font">ไม่สามารถโหลดข้อมูลโปรไฟล์ได้</div>';
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
