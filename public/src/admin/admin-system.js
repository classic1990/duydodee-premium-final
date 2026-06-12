// 💠 Admin System - admin-system.js
import { db, collection, getDocs, doc, deleteDoc, logActivity } from '/src/services/firebase.js';
import { checkAdminAccess } from '/src/middleware/auth-guard.js';
import { UI } from '/src/components/ui.js'; // Import UI for toast messages

const MAIN_ADMIN_UID = 'fpjTWGXIFCYZNWIubqhUGuSFvZk1';

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function initSidebar() {
    const toggleBtn = document.getElementById('sidebar-toggle-btn');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('admin-overlay');
    if (!toggleBtn || !sidebar) return;
    const open = () => { sidebar.classList.remove('-translate-x-full'); overlay?.classList.remove('hidden'); };
    const close = () => { sidebar.classList.add('-translate-x-full'); overlay?.classList.add('hidden'); };
    toggleBtn.addEventListener('click', () => sidebar.classList.contains('-translate-x-full') ? open() : close());
    overlay?.addEventListener('click', close);
}

// ─── Admin Profile Sidebar ────────────────────────────────────────────────────
function renderSidebarProfile(user) {
    const el = document.getElementById('admin-sidebar-profile');
    if (!el) return;
    el.innerHTML = `
        <div class="flex items-center gap-3">
            <img src="${user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'A')}&background=FBBF24&color=000`}" 
                 class="w-10 h-10 rounded-xl object-cover border border-brand-primary/20">
            <div class="overflow-hidden">
                <p class="text-xs font-black text-white truncate Thai-font">${user.displayName || 'แอดมิน'}</p>
                <p class="text-[9px] font-bold text-brand-primary uppercase tracking-widest">ADMIN</p>
            </div>
        </div>`;
}

// ─── Purge All Content ────────────────────────────────────────────────────────
async function purgeCollection(collectionName) {
    const snap = await getDocs(collection(db, collectionName));
    const deletions = snap.docs.map(d => deleteDoc(doc(db, collectionName, d.id)));
    await Promise.all(deletions);
    return snap.size;
}

function initPurgeBtn(user) {
    const btn = document.getElementById('purge-btn');
    if (!btn) return;

    // Only main admin can purge
    if (user.uid !== MAIN_ADMIN_UID) {
        btn.disabled = true;
        btn.textContent = 'เฉพาะ Super Admin เท่านั้น';
        btn.classList.remove('bg-red-600', 'hover:bg-red-500');
        btn.classList.add('bg-gray-800', 'cursor-not-allowed', 'text-gray-600');
        return;
    }

    btn.addEventListener('click', async () => {
        const confirmed1 = confirm('⚠️ คำเตือน!\n\nฟังก์ชันนี้จะลบภาพยนตร์และซีรีส์ทั้งหมดออกจากฐานข้อมูล\n\nยืนยันหรือไม่?');
        if (!confirmed1) return;

        const confirmed2 = prompt('พิมพ์ "PURGE ALL" เพื่อยืนยันการลบข้อมูลทั้งหมด:');
        if (confirmed2 !== 'PURGE ALL') {
            UI.showToast('ยกเลิกการลบ - รหัสยืนยันไม่ถูกต้อง', 'warning');
            return;
        }

        btn.disabled = true;
        btn.textContent = 'กำลังดำเนินการ...';

        try {
            const [movieCount, seriesCount] = await Promise.all([
                purgeCollection('movies'),
                purgeCollection('series')
            ]);
            await logActivity('PURGE_ALL_CONTENT', { moviesDeleted: movieCount, seriesDeleted: seriesCount });
            UI.showToast('ลบข้อมูลสำเร็จ!', 'success', `- ภาพยนตร์: ${movieCount} รายการ\n- ซีรีส์: ${seriesCount} รายการ`);
        } catch (err) {
            console.error('Purge error:', err);
            UI.showToast('เกิดข้อผิดพลาด: ' + err.message, 'error');
        } finally {
            btn.disabled = false;
            btn.textContent = 'ยืนยันการล้างข้อมูลระบบ';
        }
    });
}

// ─── Load Activity Logs ───────────────────────────────────────────────────────
async function loadActivityLogs() {
    const logsContainer = document.querySelector('.cyber-card:last-child .space-y-4');
    if (!logsContainer) return;

    try {
        const snap = await getDocs(collection(db, 'activity_logs'));
        if (snap.empty) {
            logsContainer.innerHTML += '<p class="text-xs text-gray-700 Thai-font">ยังไม่มีกิจกรรมในระบบ</p>';
            return;
        }

        const logs = snap.docs.map(d => d.data()).sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0)).slice(0, 10);

        const logHtml = logs.map(log => {
            const time = log.timestamp?.toDate ? log.timestamp.toDate().toLocaleString('th-TH') : '-';
            return `<div class="flex items-start gap-3 py-3 border-b border-white/5 last:border-0">
                <div class="w-1.5 h-1.5 rounded-full bg-brand-primary mt-2 flex-shrink-0"></div>
                <div>
                    <p class="text-[10px] font-black text-white">${log.action}</p>
                    <p class="text-[9px] text-gray-500 Thai-font">${log.email || log.uid} · ${time}</p>
                </div>
            </div>`;
        }).join('');

        logsContainer.innerHTML = logHtml;
    } catch (err) {
        console.error('Error loading logs:', err);
    }
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function init() {
    initSidebar();
    try {
        const { user } = await checkAdminAccess();
        renderSidebarProfile(user);
        initPurgeBtn(user);
        await loadActivityLogs();
        if (window.lucide) window.lucide.createIcons();
    } catch (err) {
        console.error('[admin-system] Access Denied:', err);
        window.location.replace('/login.html');
    }
}

document.addEventListener('DOMContentLoaded', init);
