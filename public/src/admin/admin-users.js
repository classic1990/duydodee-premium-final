import { db, collection, getDocs, doc, updateDoc, query, orderBy, limit, startAfter, getCountFromServer, SCHEMA, onSnapshot, where, logActivity } from '../services/firebase.js';
import { UI } from '../components/ui.js';
import { checkAdminAccess } from '../middleware/auth-guard.js';

/**
 * 👤 DUYดูDEE USER MANAGEMENT ENGINE
 * Unified Logic for High-Impact User Access Control
 */

const PAGE_SIZE = 15;
let currentPage = 1;
const cursors = [null];
let totalUsers = 0;
const userCache = new Map();
let isSearchMode = false;

// 🆕 Feature: Real-time user count updates
let _userCountListener = null;

// 📊 Monitoring: Helper function for admin activity logging
function logAdminActivity(action, details = {}) {
    try {
        logActivity(action, details);
    } catch (error) {
        console.error('Failed to log admin activity:', error);
    }
}

// 📊 Monitoring: Track page load performance
function trackPageLoad() {
    const perfData = performance.timing;
    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
    logAdminActivity('performance-page-load', {
        pageLoadTime,
        domReady: perfData.domContentLoadedEventEnd - perfData.navigationStart
    });
}

// 📊 Monitoring: Track user actions
function trackAdminAction(action, details = {}) {
    logAdminActivity(`admin-action-${action}`, details);
}

document.addEventListener('DOMContentLoaded', async () => {
    // 📊 Monitoring: Track page load
    setTimeout(trackPageLoad, 0);

    try {
        const { user } = await checkAdminAccess();
        UI.setupSidebar(user);
        UI.initAdminSidebar();
        trackAdminAction('access', { page: 'admin-users', uid: user.uid });
        initManageUsers();
    } catch (err) {
        console.error('Access Denied:', err);
        UI.showToast('ไม่มีสิทธิเข้าถึงหน้าจัดการผู้ใช้', 'error');
        trackAdminAction('access-denied', { page: 'admin-users', error: err.message });
        setTimeout(() => {
            window.location.href = '/admin/admin-manage.html';
        }, 2000);
    }

    // 🎯 Feature: Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'r' && e.ctrlKey) {
            e.preventDefault();
            loadUsers();
        }
        if (e.key === 's' && e.ctrlKey && !e.shiftKey) {
            e.preventDefault();
            const searchInput = document.getElementById('user-search');
            if (searchInput) {
                searchInput.focus();
            }
        }
    });
});

async function initManageUsers() {
    UI.setLoading(true);

    await updateUserCount();
    setupRealTimeUserCount(); // 🆕 Real-time updates
    setupRoleFilter(); // 🆕 Role filter
    loadUsers();
    setupSearch();
    setupEditModal();
}

async function updateUserCount() {
    try {
        const countSnap = await getCountFromServer(collection(db, SCHEMA.COLLECTIONS.USERS));
        totalUsers = countSnap.data().count;
        const countEl = document.getElementById('user-count');
        if (countEl) {
            countEl.innerText = totalUsers.toLocaleString();
        }
    } catch (e) {
        console.error('Count failed:', e);
    }
}

// 🆕 Feature: Setup real-time user count updates
function setupRealTimeUserCount() {
    const q = query(collection(db, SCHEMA.COLLECTIONS.USERS), orderBy('createdAt', 'desc'), limit(1));
    _userCountListener = onSnapshot(q, async () => {
        // Update count whenever users change
        await updateUserCount();
    }, (error) => {
        console.error('Real-time count error:', error);
        // 📊 Monitoring: Log real-time errors
        logAdminActivity('error-user-count-fail', { error: error.message });
    });
}

// ⚡ Optimization: Debounced role filter
const debouncedRoleFilter = UI.debounce(async (role) => {
    UI.setLoading(true);

    try {
        let q = query(collection(db, SCHEMA.COLLECTIONS.USERS));
        if (role !== 'all') {
            q = query(q, where('role', '==', role));
        }
        q = query(q, orderBy('createdAt', 'desc'), limit(PAGE_SIZE));

        const snap = await getDocs(q);
        renderUsers(snap.docs.map(doc => ({ uid: doc.id, ...doc.data() })));
        isSearchMode = true;
        trackAdminAction('role-filter', { role });
    } catch (error) {
        console.error('Role filter error:', error);
        UI.showToast('ไม่สามารถกรองข้อมูลได้', 'error');
        trackAdminAction('role-filter-error', { role, error: error.message });
    } finally {
        UI.setLoading(false);
    }
}, 300);

// 🆕 Feature: Quick role filter
function setupRoleFilter() {
    const roleFilter = document.getElementById('role-filter');
    if (!roleFilter) {
        return;
    }

    roleFilter.addEventListener('change', () => {
        debouncedRoleFilter(roleFilter.value);
    });
}

async function loadUsers() {
    if (isSearchMode) {
        return;
    }

    const tableBody = document.getElementById('user-list');
    if (!tableBody) {
        return;
    }

    tableBody.innerHTML = '<tr><td colspan="5" class="py-16 text-center Thai-font"><div class="inline-block w-8 h-8 border-2 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin"></div></td></tr>';

    try {
        const cursor = cursors[currentPage - 1];
        let q = query(collection(db, SCHEMA.COLLECTIONS.USERS), orderBy('createdAt', 'desc'), limit(PAGE_SIZE));
        if (cursor) {
            q = query(q, startAfter(cursor));
        }

        const snap = await getDocs(q);
        const users = snap.docs.map(doc => ({ uid: doc.id, ...doc.data() }));

        userCache.clear();
        users.forEach(u => userCache.set(u.uid, u));

        if (!snap.empty) {
            cursors[currentPage] = snap.docs[snap.docs.length - 1];
            renderUsers(users);
            updatePaginationUI();
        } else {
            renderUsers([]);
        }
    } catch (error) {
        console.error('Load Error:', error);
        UI.showToast('ไม่สามารถโหลดข้อมูลสมาชิกได้', 'error');
    } finally {
        UI.setLoading(false);
    }
}

function renderUsers(users) {
    const tableBody = document.getElementById('user-list');
    if (!tableBody) {
        return;
    }

    if (users.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" class="py-16 text-center text-gray-500 Thai-font opacity-40">ไม่พบรายชื่อสมาชิก</td></tr>';
        return;
    }

    tableBody.innerHTML = users.map(user => {
        const roleLabels = { 'super-admin': 'ผู้บริหาร', 'admin': 'แอดมิน', 'vip': 'พรีเมียม (VIP)', 'member': 'สมาชิกทั่วไป' };
        const roleColors = { 'super-admin': 'text-purple-400 bg-purple-500/10 border-purple-500/20', 'admin': 'text-blue-400 bg-blue-500/10 border-blue-500/20', 'vip': 'text-brand-primary bg-brand-primary/10 border-brand-primary/20', 'member': 'text-gray-400 bg-white/5 border-white/10' };

        const statusLabel = user.isBanned ? 'ถูกระงับสิทธิ์' : 'ปกติ';
        const statusColor = user.isBanned ? 'text-red-500 bg-red-500/10 border-red-500/20' : 'text-green-500 bg-green-500/10 border-green-500/20';

        return `
            <tr class="group hover:bg-white/[0.02] transition-all border-b border-white/5">
                <td class="p-6">
                    <div class="flex items-center gap-4">
                        <img src="${UI.getSafePoster(user.photoURL || '/assets/logo/DUYDODEE.png')}" class="w-10 h-10 rounded-xl object-cover border border-white/10 shadow-lg">
                        <div class="flex flex-col">
                            <span class="text-sm font-bold text-white Thai-font">${UI.escapeHTML(user.displayName || 'Unknown')}</span>
                            <span class="text-[10px] text-gray-600 font-medium">${user.email}</span>
                        </div>
                    </div>
                </td>
                <td class="p-6 text-center">
                    <span class="px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${roleColors[user.role] || roleColors.member} Thai-font">
                        ${roleLabels[user.role] || 'สมาชิกทั่วไป'}
                    </span>
                </td>
                <td class="p-6 text-center">
                    <span class="px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${statusColor} Thai-font">
                        ${statusLabel}
                    </span>
                </td>
                <td class="p-6 text-center text-[10px] font-bold text-gray-500 Thai-font">
                    ${UI.formatDate(user.createdAt)}
                </td>
                <td class="p-6 text-right">
                    <div class="flex items-center justify-end gap-3">
                        <button data-action="edit" data-uid="${user.uid}" class="user-action-btn w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all haptic-btn" title="แก้ไขสิทธิ์">
                            <i data-lucide="edit-3" class="w-4 h-4"></i>
                        </button>
                        <button data-action="toggle-ban" data-uid="${user.uid}" data-banned="${!!user.isBanned}" class="user-action-btn w-9 h-9 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all haptic-btn" title="${user.isBanned ? 'ปลดระงับ' : 'ระงับสิทธิ์'}">
                            <i data-lucide="${user.isBanned ? 'unlock' : 'shield-off'}" class="w-4 h-4"></i>
                        </button>
                    </div>
                </td>
            </tr>`;
    }).join('');

    UI.refreshIcons();

    // Setup event delegation for user action buttons
    setupUserActionListeners();
}

/**
 * Sets up event delegation for user action buttons
 */
function setupUserActionListeners() {
    const tableBody = document.getElementById('user-list');
    if (!tableBody) {
        return;
    }

    tableBody.addEventListener('click', (e) => {
        const btn = e.target.closest('.user-action-btn');
        if (!btn) {
            return;
        }

        const action = btn.dataset.action;
        const uid = btn.dataset.uid;

        if (action === 'edit') {
            openEditModal(uid);
        } else if (action === 'toggle-ban') {
            const isBanned = btn.dataset.banned === 'true';
            toggleBan(uid, isBanned);
        }
    });
}

function updatePaginationUI() {
    const container = document.getElementById('pagination-container');
    if (!container || isSearchMode) {
        if (container) {
            container.innerHTML = '';
        }
        return;
    }

    const totalPages = Math.ceil(totalUsers / PAGE_SIZE) || 1;
    container.innerHTML = `
        <div class="flex items-center gap-6 bg-black/20 p-2 px-6 rounded-2xl border border-white/5 backdrop-blur-md animate-fade-in">
            <button id="prev-btn" class="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-brand-primary transition-all disabled:opacity-20" ${currentPage === 1 ? 'disabled' : ''}>
                <i data-lucide="chevron-left" class="w-5 h-5"></i>
            </button>
            <div class="flex flex-col items-center">
                <span class="text-[10px] font-black text-white tracking-widest uppercase Thai-font">หน้า ${currentPage} / ${totalPages}</span>
            </div>
            <button id="next-btn" class="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-brand-primary transition-all disabled:opacity-20" ${currentPage >= totalPages ? 'disabled' : ''}>
                <i data-lucide="chevron-right" class="w-5 h-5"></i>
            </button>
        </div>`;

    document.getElementById('prev-btn')?.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--; loadUsers();
        }
    });
    document.getElementById('next-btn')?.addEventListener('click', () => {
        currentPage++; loadUsers();
    });
    UI.refreshIcons();
}

function setupSearch() {
    const input = document.getElementById('user-search');
    if (!input) {
        return;
    }
    input.addEventListener('input', UI.debounce(async (e) => {
        const term = e.target.value.trim().toLowerCase();
        if (!term) {
            isSearchMode = false; loadUsers(); return;
        }

        isSearchMode = true;
        const tableBody = document.getElementById('user-list');
        tableBody.innerHTML = '<tr><td colspan="5" class="py-10 text-center Thai-font animate-pulse text-blue-400 text-xs">กำลังค้นหาในระบบ...</td></tr>';

        try {
            const q = query(collection(db, SCHEMA.COLLECTIONS.USERS), limit(500));
            const snap = await getDocs(q);
            const allUsers = snap.docs.map(d => ({ uid: d.id, ...d.data() }));
            const filtered = allUsers.filter(u => u.email?.toLowerCase().includes(term) || u.displayName?.toLowerCase().includes(term));

            filtered.forEach(u => userCache.set(u.uid, u));
            renderUsers(filtered);
            document.getElementById('pagination-container').innerHTML = '';
        } catch (e) {
            console.error(e);
        }
    }, 400));
}

function setupEditModal() {
    const form = document.getElementById('edit-user-form');
    if (!form) {
        return;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const uid = document.getElementById('edit-uid').value;
        const role = document.getElementById('edit-role').value;
        const displayName = document.getElementById('edit-displayName').value;

        UI.setLoading(true);
        try {
            await updateDoc(doc(db, SCHEMA.COLLECTIONS.USERS, uid), { role, displayName });
            UI.showToast('อัปเดตข้อมูลสำเร็จ', 'success');
            closeEditModal();
            loadUsers();
        } catch (err) {
            UI.showToast('เกิดข้อผิดพลาดในการอัปเดต', 'error');
        } finally {
            UI.setLoading(false);
        }
    });
}

/**
 * Opens the edit user modal
 * @param {string} uid - User ID to edit
 */
function openEditModal(uid) {
    const user = userCache.get(uid);
    if (!user) {
        return;
    }

    document.getElementById('edit-uid').value = uid;
    document.getElementById('edit-displayName').value = user.displayName || '';
    document.getElementById('edit-role').value = user.role || 'member';

    const modal = document.getElementById('edit-user-modal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

/**
 * Closes the edit user modal
 */
function closeEditModal() {
    const modal = document.getElementById('edit-user-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

/**
 * Toggles user ban status
 * @param {string} uid - User ID
 * @param {boolean} currentStatus - Current ban status
 * @returns {Promise<void>}
 */
async function toggleBan(uid, currentStatus) {
    const action = currentStatus ? 'ปลดระงับ' : 'ระงับสิทธิ์';
    if (!confirm(`ยืนยันการ${action}สมาชิกรายนี้?`)) {
        return;
    }

    UI.setLoading(true);
    try {
        await updateDoc(doc(db, SCHEMA.COLLECTIONS.USERS, uid), { isBanned: !currentStatus });
        UI.showToast(`${action}เรียบร้อยแล้ว`, 'success');
        loadUsers();
    } catch (e) {
        UI.showToast('เกิดข้อผิดพลาด', 'error');
    } finally {
        UI.setLoading(false);
    }
}

