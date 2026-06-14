import { db, collection, query, orderBy, getDocs, doc, updateDoc, getDoc, SCHEMA, auth, logActivity } from '../services/firebase.js';
import { UI } from '../components/ui.js';
import { checkAdminAccess } from '../middleware/auth-guard.js';
import { injectAdminSidebar } from './sidebar-loader.js';

/**
 * 🛰️ DUYดูDEE VIP PAYMENT MANAGEMENT ENGINE
 * Refactored: Decoupled Data & UI Architecture
 */

// 📂 1. Data & State Management Service
const VipPaymentService = {
    state: {
        currentPayments: [],
        currentFilter: 'all',
        searchTerm: ''
    },

    async fetchPayments() {
        try {
            const q = query(collection(db, SCHEMA.COLLECTIONS.VIP_PAYMENTS), orderBy('createdAt', 'desc'));
            const snap = await getDocs(q);
            this.state.currentPayments = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            return this.state.currentPayments;
        } catch (e) {
            console.error('Error fetching payments:', e);
            throw e;
        }
    },

    async verifyPayment(id, userId) {
        // eslint-disable-next-line no-alert
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

                if (currentRole === SCHEMA.ROLES.MASTER.toLowerCase() || currentRole === SCHEMA.ROLES.ADMIN.toLowerCase() || currentRole === 'master') {
                    UI.showToast('ยืนยันรายการแล้ว (รักษาสิทธิ์แอดมินเดิม)', 'success');
                    this.logAdminActivity('vip-verify-admin-protected', { paymentId: id, userId, currentRole });
                } else {
                    await updateDoc(userRef, { role: 'vip' });
                    UI.showToast('อัปเดตสถานะสมาชิกเป็น VIP เรียบร้อยแล้ว', 'success');
                    this.logAdminActivity('vip-verify-success', { paymentId: id, userId, duration: performance.now() - startTime });
                }
            } else {
                UI.showToast('ยืนยันรายการชำระเงินเรียบร้อยแล้ว', 'success');
                this.logAdminActivity('vip-verify-guest', { paymentId: id });
            }

            // Reload payments after verification
            await this.fetchPayments();
            VipPaymentView.renderTable(this.state.currentPayments);
        } catch (e) {
            console.error('Verify Payment Error:', e);
            UI.showToast('เกิดข้อผิดพลาดในการดำเนินการ', 'error');
            this.logAdminActivity('vip-verify-error', { paymentId: id, userId, error: e.message, duration: performance.now() - startTime });
        } finally {
            UI.setLoading(false);
        }
    },

    logAdminActivity(action, details = {}) {
        try {
            logActivity(action, details);
        } catch (error) {
            console.error('Failed to log admin activity:', error);
        }
    }
};

// 🎨 2. UI & Rendering Layer
const VipPaymentView = {
    elements: {
        paymentList: document.getElementById('payment-history-list'),
        statusSelect: document.getElementById('filter-status'),
        searchInput: document.getElementById('filter-search')
    },

    showLoading() {
        if (this.elements.paymentList) {
            this.elements.paymentList.innerHTML = `
                <tr>
                    <td colspan="6" class="py-16 text-center Thai-font">
                        <div class="inline-block w-8 h-8 border-2 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin"></div>
                        <p class="mt-4 text-[10px] text-gray-500 uppercase tracking-widest animate-pulse">กำลังซิงค์ข้อมูลการชำระเงิน</p>
                    </td>
                </tr>`;
        }
    },

    renderEmpty() {
        if (this.elements.paymentList) {
            this.elements.paymentList.innerHTML = '<tr><td colspan="6" class="p-20 text-center text-xs text-gray-500 Thai-font opacity-40">ไม่พบรายการชำระเงินในระบบ</td></tr>';
            UI.refreshIcons();
        }
    },

    renderError(message, onRetry) {
        if (this.elements.paymentList) {
            this.elements.paymentList.innerHTML = `
                <tr>
                    <td colspan="6" class="p-20 text-center">
                        <div class="space-y-4">
                            <i data-lucide="alert-circle" class="w-12 h-12 text-red-500 mx-auto"></i>
                            <p class="text-red-500 text-sm font-bold Thai-font">ไม่สามารถโหลดข้อมูลได้</p>
                            <p class="text-gray-600 text-xs Thai-font">${message || 'Permission denied'}</p>
                            <button class="retry-btn mt-4 px-4 py-2 bg-brand-primary text-black text-[10px] font-black uppercase rounded-xl hover:scale-105 transition-all">
                                ลองใหม่
                            </button>
                        </div>
                    </td>
                </tr>`;
            UI.refreshIcons();
            const retryBtn = this.elements.paymentList.querySelector('.retry-btn');
            if (retryBtn && onRetry) {
                retryBtn.addEventListener('click', onRetry);
            }
        }
    },

    renderTable(payments) {
        if (!this.elements.paymentList) {
            return;
        }

        requestAnimationFrame(() => {
            const filteredPayments = payments.filter(p => {
                const matchStatus = VipPaymentService.state.currentFilter === 'all' || VipPaymentService.state.currentFilter === 'ALL' || p.status === VipPaymentService.state.currentFilter;
                const matchSearch = (p.senderName || '').toLowerCase().includes(VipPaymentService.state.searchTerm.toLowerCase()) ||
                    (p.userId || '').toLowerCase().includes(VipPaymentService.state.searchTerm.toLowerCase());
                return matchStatus && matchSearch;
            });

            if (filteredPayments.length === 0) {
                this.renderEmpty();
                return;
            }

            this.elements.paymentList.innerHTML = filteredPayments.map(data => {
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
                </tr>`;
            }).join('');
            UI.refreshIcons();
        });
    },

    setupEventListeners(onStatusChange, onSearchInput, onVerifyPayment) {
        if (this.elements.statusSelect) {
            this.elements.statusSelect.addEventListener('change', (e) => {
                onStatusChange(e.target.value);
            });
        }

        if (this.elements.searchInput) {
            this.elements.searchInput.addEventListener('input', UI.debounce((e) => {
                onSearchInput(e.target.value);
            }, 300));
        }

        if (this.elements.paymentList) {
            this.elements.paymentList.addEventListener('click', (e) => {
                const btn = e.target.closest('.payment-action-btn');
                if (!btn) {
                    return;
                }

                const action = btn.dataset.action;
                const id = btn.dataset.id;
                const userId = btn.dataset.userId;

                if (action === 'verify-payment' && onVerifyPayment) {
                    onVerifyPayment(id, userId);
                }
            });
        }
    }
};

// 3. Controller (Main Logic)
async function init() {
    try {
        const user = auth.currentUser;
        if (!user) {
            window.location.href = '/login.html';
            return;
        }

        try {
            await checkAdminAccess();
            await injectAdminSidebar();

            VipPaymentView.setupEventListeners(
                (status) => {
                    VipPaymentService.state.currentFilter = status;
                    VipPaymentView.renderTable(VipPaymentService.state.currentPayments);
                },
                (term) => {
                    VipPaymentService.state.searchTerm = term;
                    VipPaymentView.renderTable(VipPaymentService.state.currentPayments);
                },
                (id, userId) => VipPaymentService.verifyPayment(id, userId)
            );

            VipPaymentView.showLoading();
            const payments = await VipPaymentService.fetchPayments();
            VipPaymentView.renderTable(payments);
        } catch (err) {
            console.error('VIP Management Init Failed:', err);
            UI.showToast('สิทธิการเข้าถึงถูกปฏิเสธ', 'error');
            setTimeout(() => {
                window.location.href = '/admin/admin-manage.html';
            }, 2000);
        }
    } catch (err) {
        console.error('Auth state error:', err);
        UI.showToast('เกิดข้อผิดพลาดในการตรวจสอบสิทธิ', 'error');
    }
}

// Global initialization
document.addEventListener('DOMContentLoaded', () => {
    // We need to wait for auth state to be ready
    auth.onAuthStateChanged((user) => {
        if (user) {
            init();
        } else {
            window.location.href = '/login.html';
        }
    });

    // 🎯 Feature: Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'r' && e.ctrlKey) {
            e.preventDefault();
            VipPaymentService.fetchPayments().then(p => VipPaymentView.renderTable(p));
        }
    });
});
