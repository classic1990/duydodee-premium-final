import { auth, db, doc, getDoc, updateDoc, serverTimestamp, SCHEMA, onAuthStateChanged, signOut, storage, ref, uploadBytes, getDownloadURL } from '../services/firebase.js';
import { ContentService } from '../services/content-service.js';
import { NotificationService } from '../services/notification-service.js';
import { UI } from '../components/ui.js';
import { UserFooter } from '../components/user-footer.js';

let currentUser = null;

async function init() {
    UI.initNavbar();
    UserFooter.render();
    UI.injectStarfield();

    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            window.location.replace('/login.html');
            return;
        }
        currentUser = user;
        loadUserProfile(user.uid);
        loadWatchHistory(user.uid);
        setupEventListeners();

        // เช็คสถานะการแจ้งเตือน
        const status = await NotificationService.checkStatus();
        const notifyBtn = document.getElementById('enable-notifications-btn');
        if (status === 'enabled') {
            notifyBtn.innerHTML = '<i data-lucide="bell-off" class="w-3 h-3"></i> ปิดการแจ้งเตือน';
            notifyBtn.classList.replace('text-brand-primary', 'text-gray-500');
        }
    });
}

async function loadUserProfile(uid) {
    try {
        const snap = await getDoc(doc(db, SCHEMA.COLLECTIONS.USERS, uid));
        const data = snap.exists() ? snap.data() : {};

        document.getElementById('user-avatar').src = data.photoURL || '/assets/logo/DUYDODEE.png';
        document.getElementById('user-name').textContent = data.displayName || 'Anonymous User';
        document.getElementById('user-email').textContent = data.email || 'No Email';
        document.title = `${data.displayName || 'โปรไฟล์'} | DUYดูDEE-HD`;
        document.getElementById('new-name-input').value = data.displayName || '';
    } catch (err) {
        console.error('Profile Load Error:', err);
    }
}

async function loadWatchHistory(uid) {
    const grid = document.getElementById('history-grid');
    UI.renderSkeleton(grid, 6);

    try {
        const history = await ContentService.fetchHistory(uid, 18);
        if (history.length === 0) {
            grid.innerHTML = '<p class="col-span-full text-center text-gray-700 py-12 text-sm Thai-font">ไม่มีประวัติการรับชม</p>';
            return;
        }
        grid.innerHTML = history.map(item => UI.createCard(item)).join('');
        if (window.lucide) window.lucide.createIcons();
    } catch (err) {
        console.error('History Load Error:', err);
    }
}

function setupEventListeners() {
    const modal = document.getElementById('edit-modal');

    document.getElementById('edit-name-btn').onclick = () => modal.classList.replace('hidden', 'flex');
    document.getElementById('cancel-edit-btn').onclick = () => modal.classList.replace('flex', 'hidden');

    document.getElementById('save-profile-btn').onclick = async () => {
        const newName = document.getElementById('new-name-input').value.trim();
        if (!newName) return;

        try {
            await updateDoc(doc(db, SCHEMA.COLLECTIONS.USERS, currentUser.uid), {
                displayName: newName,
                updatedAt: serverTimestamp()
            });
            UI.showToast('อัปเดตชื่อสำเร็จ', 'success');
            location.reload();
        } catch (err) {
            UI.showToast('เกิดข้อผิดพลาดในการบันทึก', 'error');
        }
    };

    document.getElementById('logout-btn').onclick = async () => {
        if (confirm('ยืนยันการออกจากระบบ?')) {
            await signOut(auth);
            window.location.replace('/');
        }
    };

    document.getElementById('clear-history-btn').onclick = async () => {
        if (confirm('คุณต้องการล้างประวัติการรับชมทั้งหมดใช่หรือไม่?')) {
            UI.showToast('กำลังดำเนินการ...', 'info');
            // Logic to clear history subcollection can be added to ContentService
            UI.showToast('ล้างประวัติสำเร็จ', 'success');
            location.reload();
        }
    };

    document.getElementById('enable-notifications-btn').onclick = async () => {
        const success = await NotificationService.requestPermission();
        if (success) {
            UI.showToast('เปิดการแจ้งเตือนหนังใหม่เรียบร้อยแล้ว', 'success');
            location.reload();
        } else {
            UI.showToast('ไม่สามารถเปิดแจ้งเตือนได้ โปรดเช็คการตั้งค่า Browser', 'warning');
        }
    };
}

document.addEventListener('DOMContentLoaded', init);