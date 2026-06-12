// 💠 Admin Users - admin-users.js
import { db, collection, getDocs, doc, updateDoc, orderBy, query, logActivity, serverTimestamp } from '/src/services/firebase.js';
import { checkAdminAccess } from '/src/middleware/auth-guard.js';
import { UI } from '/src/components/ui.js'; // Import UI for toast messages
import { AdminSidebar } from '/src/components/admin-sidebar.js';

const PAGE_SIZE = 20;
const MAIN_ADMIN_UID = 'fpjTWGXIFCYZNWIubqhUGuSFvZk1';

// ─── Fetch ────────────────────────────────────────────────────────────────────
async function fetchUsers() {
    const snap = await getDocs(query(collection(db, 'users'), orderBy('createdAt', 'desc')));
    allUsers = snap.docs.map(d => ({ id: d.id, uid: d.id, ...d.data() }));
    filtered = [...allUsers];
    const countEl = document.getElementById('user-count');
    if (countEl) countEl.textContent = allUsers.length;
}

// ─── Role Badge ───────────────────────────────────────────────────────────────
function roleBadge(role) {
    const map = {
        'super-admin': 'bg-red-500/20 text-red-400 border-red-500/20',
        'admin': 'bg-brand-primary/20 text-brand-primary border-brand-primary/20',
        'vip': 'bg-purple-500/20 text-purple-400 border-purple-500/20',
        'member': 'bg-white/5 text-gray-400 border-white/10',
    };
    const labels = { 'super-admin': 'Super Admin', 'admin': 'Admin', 'vip': 'VIP', 'member': 'Member' };
    const cls = map[role] || map['member'];
    const label = labels[role] || role || 'member';
    return `<span class="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border ${cls}">${label}</span>`;
}

// ─── Render ───────────────────────────────────────────────────────────────────
function renderTable() {
    const tbody = document.getElementById('user-list');
    if (!tbody) return;

    const start = (currentPage - 1) * PAGE_SIZE;
    const page = filtered.slice(start, start + PAGE_SIZE);

    if (!filtered.length) {
        tbody.innerHTML = '<tr><td colspan="5" class="p-12 text-center text-gray-600 Thai-font text-sm">ไม่พบสมาชิกในระบบ</td></tr>';
        return;
    }

    tbody.innerHTML = page.map(user => {
        const avatar = user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email || 'U')}&background=222&color=FBBF24&size=80`;
        const joinDate = user.createdAt?.toDate
            ? user.createdAt.toDate().toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })
            : '-';
        const isMainAdmin = user.uid === MAIN_ADMIN_UID;
        return `
        <tr class="group hover:bg-white/[0.02] transition-colors">
            <td class="p-5">
                <div class="flex items-center gap-4">
                    <img src="${avatar}" class="w-12 h-12 rounded-xl object-cover border border-white/5" onerror="this.src='https://ui-avatars.com/api/?background=222&color=FFF&size=80'">
                    <div>
                        <p class="text-sm font-black text-white Thai-font">${user.displayName || '(ไม่มีชื่อ)'} ${isMainAdmin ? '<span class="text-[8px] text-brand-primary ml-2 uppercase tracking-widest">★ MAIN</span>' : ''}</p>
                        <p class="text-[10px] text-gray-500 mt-0.5">${user.email || '-'}</p>
                        <p class="text-[9px] text-gray-700 font-mono mt-0.5">${user.uid}</p>
                    </div>
                </div>
            </td>
            <td class="p-5 text-center">${roleBadge(user.role)}</td>
            <td class="p-5 text-center">
                <span class="text-[9px] font-bold px-3 py-1.5 rounded-lg border ${user.disabled ? 'bg-red-500/10 text-red-400 border-red-500/10' : 'bg-green-500/10 text-green-400 border-green-500/10'}">
                    ${user.disabled ? 'ถูกระงับ' : 'ปกติ'}
                </span>
            </td>
            <td class="p-5 text-center">
                <span class="text-[10px] text-gray-500 Thai-font">${joinDate}</span>
            </td>
            <td class="p-5 text-right">
                ${isMainAdmin ? '<span class="text-[9px] text-gray-600 Thai-font">ไม่สามารถแก้ไขได้</span>' : `
                <button onclick="openEditModal('${user.uid}')" class="px-4 py-2 text-[10px] font-black text-white bg-white/5 border border-white/10 rounded-xl hover:bg-brand-primary hover:text-black hover:border-brand-primary transition-all uppercase tracking-widest Thai-font flex items-center gap-1.5 ml-auto">
                    <i data-lucide="user-cog" class="w-3 h-3"></i> แก้ไข
                </button>`}
            </td>
        </tr>`;
    }).join('');
    if (window.lucide) window.lucide.createIcons();
    renderPagination();
}

function renderPagination() {
    const container = document.getElementById('pagination-container');
    if (!container) return;
    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    if (totalPages <= 1) { container.innerHTML = ''; return; }
    let html = '';
    for (let i = 1; i <= totalPages; i++) {
        html += `<button onclick="goToPage(${i})" class="w-10 h-10 rounded-xl text-xs font-black transition-all ${i === currentPage ? 'bg-brand-primary text-black' : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'}">${i}</button>`;
    }
    container.innerHTML = html;
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────
window.openEditModal = function (uid) {
    const user = allUsers.find(u => u.uid === uid);
    if (!user) return;
    editingUid = uid;
    const modal = document.getElementById('edit-user-modal');
    document.getElementById('edit-uid').value = uid;
    document.getElementById('edit-displayName').value = user.displayName || '';
    document.getElementById('edit-role').value = user.role || 'member';
    if (modal) { modal.classList.remove('hidden'); modal.classList.add('flex'); }
    if (window.lucide) window.lucide.createIcons();
};

window.closeEditModal = function () {
    const modal = document.getElementById('edit-user-modal');
    if (modal) { modal.classList.add('hidden'); modal.classList.remove('flex'); }
    editingUid = null;
};

function initEditForm() {
    const form = document.getElementById('edit-user-form');
    if (!form) return;
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const uid = editingUid;
        if (!uid) return;
        const displayName = document.getElementById('edit-displayName')?.value.trim();
        const role = document.getElementById('edit-role')?.value;
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'กำลังบันทึก...'; }
        try {
            await updateDoc(doc(db, 'users', uid), { displayName, role, updatedAt: serverTimestamp() });
            await logActivity('UPDATE_USER_ROLE', { uid, displayName, role });
            // Update local state
            const idx = allUsers.findIndex(u => u.uid === uid);
            if (idx !== -1) { allUsers[idx].displayName = displayName; allUsers[idx].role = role; }
            filtered = [...allUsers];
            UI.showToast('อัปเดตข้อมูลสมาชิกสำเร็จ', 'success');
            window.closeEditModal();
        } catch (err) {
            UI.showToast('เกิดข้อผิดพลาด: ' + err.message, 'error');
        } finally {
            if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'บันทึกข้อมูล'; }
        }
    });
}

window.goToPage = function (page) {
    currentPage = page;
    renderTable();
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// ─── Main ─────────────────────────────────────────────────────────────────────
async function init() {
    try {
        const { user } = await checkAdminAccess();
        AdminSidebar.render(user);
        await fetchUsers();
        renderTable();
        initEditForm();
    } catch (err) {
        console.error('[admin-users] Access Denied:', err);
        window.location.replace('/login.html');
    }
}

document.addEventListener('DOMContentLoaded', init);
