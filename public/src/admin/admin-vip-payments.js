import { db, collection, query, orderBy, getDocs, doc, updateDoc, getDoc, SCHEMA } from '../services/firebase.js';
import { UI } from '../components/ui.js';
import { checkAdminAccess } from '../middleware/auth-guard.js';

/**
 * 🛰️ DUYดูDEE VIP PAYMENT MANAGEMENT ENGINE
 */

let currentPayments = [];

async function init() {
    try {
        const { user } = await checkAdminAccess();
        UI.setupSidebar(user);
        UI.initAdminSidebar();

        await fetchPayments();
    } catch (err) {
        console.error('VIP Management Init Failed:', err);
    }
}

async function fetchPayments() {
    const paymentList = document.getElementById('payment-history-list');
    if (!paymentList) {
        return;
    }

    UI.setLoading(true);
    try {
        const q = query(collection(db, 'vip_payments'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        currentPayments = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        renderTable(currentPayments);
    } catch (e) {
        console.error('Error fetching payments:', e);
        UI.showToast('ไม่สามารถโหลดข้อมูลการชำระเงินได้', 'error');
    } finally {
        UI.setLoading(false);
    }
}

function renderTable(payments) {
    const paymentList = document.getElementById('payment-history-list');
    if (!paymentList) {
        return;
    }

    if (payments.length === 0) {
        paymentList.innerHTML = '<tr><td colspan="6" class="p-20 text-center text-xs text-gray-500 Thai-font opacity-40">ไม่พบรายการชำระเงินในระบบ</td></tr>';
        return;
    }

    paymentList.innerHTML = payments.map(data => {
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
                        <button data-action="verify-payment" data-id="${data.id}" data-user-id="${data.userId}" class="payment-action-btn px-4 py-2 bg-brand-primary text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-brand-primary/20 Thai-font">
                            อนุมัติ VIP
                        </button>
                    ` : `
                        <div class="flex items-center justify-end gap-2 text-gray-600">
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

    UI.setLoading(true);
    try {
        // 1. อัปเดตสถานะการชำระเงิน
        await updateDoc(doc(db, 'vip_payments', id), { status: 'confirmed' });

        // 2. อัปเดต Role ของผู้ใช้ (เฉพาะถ้าไม่ใช่ Admin/Master อยู่แล้ว)
        if (userId && userId !== 'guest') {
            const userRef = doc(db, SCHEMA.COLLECTIONS.USERS, userId);
            const userSnap = await getDoc(userRef);
            const currentRole = userSnap.exists() ? (userSnap.data().role || '').toLowerCase() : '';

            // ป้องกันการทับสิทธิ์แอดมิน: ถ้าเป็น admin หรือ super-admin อยู่แล้ว ไม่ต้องเปลี่ยน role เป็น vip
            if (currentRole === SCHEMA.ROLES.MASTER.toLowerCase() || currentRole === SCHEMA.ROLES.ADMIN.toLowerCase() || currentRole === 'master') {
                UI.showToast('ยืนยันรายการแล้ว (รักษาสิทธิ์แอดมินเดิม)', 'success');
            } else {
                await updateDoc(userRef, { role: 'vip' });
                UI.showToast('อัปเดตสถานะสมาชิกเป็น VIP เรียบร้อยแล้ว', 'success');
            }
        } else {
            UI.showToast('ยืนยันรายการชำระเงินเรียบร้อยแล้ว', 'success');
        }

        await fetchPayments();
    } catch (e) {
        console.error('Verify Payment Error:', e);
        UI.showToast('เกิดข้อผิดพลาดในการดำเนินการ', 'error');
    } finally {
        UI.setLoading(false);
    }
}

document.addEventListener('DOMContentLoaded', init);

