import { db, collection, query, orderBy, getDocs, doc, updateDoc, getDoc, SCHEMA, auth, logActivity } from '../services/firebase.js';
import { UI } from '../components/ui.js';
import { checkAdminAccess } from '../middleware/auth-guard.js';

/**
 * 🛰️ DUYดูDEE VIP PAYMENT MANAGEMENT ENGINE
 */

let currentPayments = [];
let currentFilter = 'all'; // 🆕 Feature: Filter by status

// 📊 Monitoring: Helper function for admin activity logging
function logAdminActivity(action, details = {}) {
    try {
        logActivity(action, details);
    } catch (error) {
        console.error('Failed to log admin activity:', error);
    }
}

async function init() {
    try {
        // Check current auth state immediately
        const user = auth.currentUser;
        if (!user) {
            window.location.href = '/login.html';
            return;
        }

        try {
            const _isAdmin = await checkAdminAccess();
            UI.setupSidebar(user);
            UI.initAdminSidebar();
            setupFilter(); // 🆕 Setup filter
            await fetchPayments();
        } catch (err) {
            console.error('VIP Management Init Failed:', err);
            UI.showToast('ไม่มีสิทธิเข้าถึงหน้าจัดการ VIP', 'error');
            // Redirect to admin manage after a short delay
            setTimeout(() => {
                window.location.href = '/admin/admin-manage.html';
            }, 2000);
        }
    } catch (err) {
        console.error('Auth state error:', err);
        UI.showToast('เกิดข้อผิดพลาดในการตรวจสอบสิทธิ', 'error');
    }
}

async function fetchPayments() {
    const paymentList = document.getElementById('payment-history-list');
    if (!paymentList) {
        return;
    }

    UI.setLoading(true);
    try {
        const q = query(collection(db, SCHEMA.COLLECTIONS.VIP_PAYMENTS), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        currentPayments = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        renderTable(currentPayments);
    } catch (e) {
        console.error('Error fetching payments:', e);
        UI.showToast('ไม่สามารถโหลดข้อมูลการชำระเงินได้: ' + e.message, 'error');
        // Show error state in the table
        const errorContainer = document.createElement('div');
        errorContainer.innerHTML = `
            <tr>
                <td colspan="6" class="p-20 text-center">
                    <div class="space-y-4">
                        <i data-lucide="alert-circle" class="w-12 h-12 text-red-500 mx-auto"></i>
                        <p class="text-red-500 text-sm font-bold Thai-font">ไม่สามารถโหลดข้อมูลได้</p>
                        <p class="text-gray-600 text-xs Thai-font">${e.message || 'Permission denied'}</p>
                        <button class="retry-btn mt-4 px-4 py-2 bg-brand-primary text-black text-[10px] font-black uppercase rounded-xl hover:scale-105 transition-all">
                            ลองใหม่
                        </button>
                    </div>
                </td>
            </tr>
        `;
        paymentList.innerHTML = '';
        paymentList.appendChild(errorContainer.querySelector('tr'));

        // Add event listener to retry button
        errorContainer.querySelector('.retry-btn').addEventListener('click', fetchPayments);

        UI.refreshIcons();
    } finally {
        UI.setLoading(false);
    }
}

function renderTable(payments) {
    const paymentList = document.getElementById('payment-history-list');
    if (!paymentList) {
        return;
    }

    // ⚡ Optimization: Use requestAnimationFrame for smooth rendering
    requestAnimationFrame(() => {
        // 🆕 Filter payments by status
        const filteredPayments = currentFilter === 'all'
            ? payments
            : payments.filter(p => p.status === currentFilter);

        if (filteredPayments.length === 0) {
            paymentList.innerHTML = '<tr><td colspan="6" class="p-20 text-center text-xs text-gray-500 Thai-font opacity-40">ไม่พบรายการชำระเงินในระบบ</td></tr>';
            return;
        }

        paymentList.innerHTML = filteredPayments.map(data => {
            const isConfirmed = data.status === 'confirmed';
            const statusClass = isConfirmed ? 'text-green-500 bg-green-500/10 border-green-500/20' : 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';

            return `
            <tr class="group hover:bg-white/[0.02] transition-all border-b border-white/5">
                <td class="p-6">
                    <div class="flex items-center gap-4">
                        <div class="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                            <i data-lucide="user" class="w-5 h-5 text-gray-400"></i>
                        </div>
                        <div class="flex flex-col">
                            <span class="text-sm font-bold text-white Thai-font">${UI.escapeHTML(data.senderName || 'ไม่ระบุชื่อ')}</span>
                            <span class="text-[9px] text-gray-600 font-medium">${data.userId || 'Guest'}</span>
                        </div>
                    </div>
                </td>
                <td class="p-6 text-center">
                    <span class="px-3 py-1 rounded-lg text-[10px] font-bold text-gray-300 bg-white/5 border border-white/10 Thai-font">Wallet</span>
                </td>
                <td class="p-6 text-center text-sm font-black text-brand-primary">
                    ฿${(data.amount || 0).toLocaleString()}
                </td>
                <td class="p-6 text-center">
                    <span class="px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${statusClass} Thai-font">
                        ${isConfirmed ? 'ยืนยันแล้ว' : 'รอการตรวจสอบ'}
                    </span>
                </td>
                <td class="p-6 text-center text-[10px] font-bold text-gray-500 Thai-font">
                    ${UI.formatDate(data.createdAt)}
                </td>
                <td class="p-6 text-right">
                    ${!isConfirmed ? `
                        <button data-action="verify-payment" data-id="${data.id}" data-user-id="${data.userId}" 
                            class="payment-action-btn px-4 py-2 bg-brand-primary text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-brand-primary/20 Thai-font"
                            aria-label="อนุมัติ VIP สำหรับ ${UI.escapeHTML(data.senderName || 'ไม่ระบุชื่อ')}">
                            อนุมัติ VIP
                        </button>
                    ` : `
                        <div class="flex items-center justify-end gap-2 text-gray-600" aria-label="สถานะ: ยืนยันแล้ว">
                            <i data-lucide="check-circle-2" class="w-4 h-4"></i>
                            <span class="text-[10px] font-bold uppercase tracking-widest Thai-font">เสร็จสมบูรณ์</span>
                        </div>
                    `}
                </td>
            </tr>
        `;
        }).join('');
        UI.refreshIcons();

        // Setup event delegation for payment action buttons
        setupPaymentActionListeners();
    }); // End requestAnimationFrame
}

/**
 * Sets up event delegation for payment action buttons
 */
function setupPaymentActionListeners() {
    const paymentList = document.getElementById('payment-history-list');
    if (!paymentList) {
        return;
    }

    paymentList.addEventListener('click', (e) => {
        const btn = e.target.closest('.payment-action-btn');
        if (!btn) {
            return;
        }

        const action = btn.dataset.action;
        const id = btn.dataset.id;
        const userId = btn.dataset.userId;

        if (action === 'verify-payment') {
            verifyPayment(id, userId);
        }
    });
}

/**
 * Verifies and approves a VIP payment
 * @param {string} id - Payment ID
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
async function verifyPayment(id, userId) {
    if (!confirm('ยืนยันการปรับสถานะสมาชิกรายนี้เป็น VIP?')) {
        return;
    }

    const startTime = performance.now();
    UI.setLoading(true);
    try {
        // 1. อัปเดตสถานะการชำระเงิน
        await updateDoc(doc(db, SCHEMA.COLLECTIONS.VIP_PAYMENTS, id), { status: 'confirmed' });

        // 2. อัปเดต Role ของผู้ใช้ (เฉพาะถ้าไม่ใช่ Admin/Master อยู่แล้ว)
        if (userId && userId !== 'guest') {
            const userRef = doc(db, SCHEMA.COLLECTIONS.USERS, userId);
            const userSnap = await getDoc(userRef);
            const currentRole = userSnap.exists() ? (userSnap.data().role || '').toLowerCase() : '';

            // ป้องกันการทับสิทธิ์แอดมิน: ถ้าเป็น admin หรือ super-admin อยู่แล้ว ไม่ต้องเปลี่ยน role เป็น vip
            if (currentRole === SCHEMA.ROLES.MASTER.toLowerCase() || currentRole === SCHEMA.ROLES.ADMIN.toLowerCase() || currentRole === 'master') {
                UI.showToast('ยืนยันรายการแล้ว (รักษาสิทธิ์แอดมินเดิม)', 'success');
                logAdminActivity('vip-verify-admin-protected', { paymentId: id, userId, currentRole });
            } else {
                await updateDoc(userRef, { role: 'vip' });
                UI.showToast('อัปเดตสถานะสมาชิกเป็น VIP เรียบร้อยแล้ว', 'success');
                logAdminActivity('vip-verify-success', { paymentId: id, userId, duration: performance.now() - startTime });
            }
        } else {
            UI.showToast('ยืนยันรายการชำระเงินเรียบร้อยแล้ว', 'success');
            logAdminActivity('vip-verify-guest', { paymentId: id });
        }

        await fetchPayments();
    } catch (e) {
        console.error('Verify Payment Error:', e);
        UI.showToast('เกิดข้อผิดพลาดในการดำเนินการ', 'error');
        logAdminActivity('vip-verify-error', { paymentId: id, userId, error: e.message, duration: performance.now() - startTime });
    } finally {
        UI.setLoading(false);
    }
}

// 🆕 Feature: Setup filter buttons
function setupFilter() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    if (!filterButtons.length) {
        return;
    }

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active state
            filterButtons.forEach(b => b.classList.remove('active', 'bg-brand-primary', 'text-black'));
            btn.classList.add('active', 'bg-brand-primary', 'text-black');

            // Update filter
            currentFilter = btn.dataset.filter;
            renderTable(currentPayments);
        });
    });
}

// ⚡ Optimization: Debounced filter
const _debouncedFilterChange = UI.debounce((filter) => {
    currentFilter = filter;
    renderTable(currentPayments);
}, 150);

document.addEventListener('DOMContentLoaded', () => {
    init();

    // 🎯 Feature: Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'r' && e.ctrlKey) {
            e.preventDefault();
            fetchPayments();
        }
    });
});

