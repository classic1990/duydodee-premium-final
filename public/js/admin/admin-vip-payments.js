import { db, auth } from '../services/firebase.js';
import { AuthService } from '../services/auth-service.js';
import { SCHEMA } from '../constants.js';
import { collection, query, orderBy, getDocs, doc, updateDoc } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { UI } from '../components/ui.js';

const paymentList = document.getElementById('payment-history-list');
let currentPayments = [];

/**
 * 🛰️ VIP PAYMENT MANAGEMENT (ADMIN)
 */

const renderTable = (payments) => {
    if (!paymentList) return;
    if (payments.length === 0) {
        paymentList.innerHTML = '<tr><td colspan="6" class="p-8 text-center text-xs text-gray-500">ไม่พบรายการชำระเงิน</td></tr>';
        return;
    }

    paymentList.innerHTML = payments.map(data => {
        const statusClass = data.status === 'confirmed' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500';
        return `
            <tr class="hover:bg-white/[0.02] transition-colors">
                <td class="p-4">
                    <div class="text-xs font-bold text-white">${data.senderName || 'ไม่ระบุชื่อ'}</div>
                    <div class="text-[9px] text-gray-500">${data.userId || 'Guest'}</div>
                </td>
                <td class="p-4 text-center text-xs text-gray-300">Wallet</td>
                <td class="p-4 text-center text-xs font-bold text-brand-primary">${data.amount || 0}</td>
                <td class="p-4 text-center">
                    <span class="armor-badge !border-none ${statusClass}">${data.status || 'pending'}</span>
                </td>
                <td class="p-4 text-right">
                    ${data.status !== 'confirmed' ? `
                        <button onclick="verifyPayment('${data.id}', '${data.userId}')" class="btn-primary !py-1 !px-3">ยืนยัน VIP</button>
                    ` : '<span class="text-[10px] text-gray-600">ได้รับสิทธิ์แล้ว</span>'}
                </td>
            </tr>
        `;
    }).join('');
    UI.refreshIcons();
};

const fetchPayments = async () => {
    try {
        const q = query(collection(db, 'vip_payments'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        currentPayments = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        renderTable(currentPayments);
    } catch (e) {
        console.error('Error fetching payments:', e);
    }
};

window.verifyPayment = async (id, userId) => {
    const isAdmin = await AuthService.checkIsAdmin(auth.currentUser);
    if (!isAdmin) return UI.showToast('คุณไม่มีสิทธิ์ดำเนินการนี้', 'error');

    try {
        await updateDoc(doc(db, 'vip_payments', id), { status: 'confirmed' });
        if (userId && userId !== 'guest') {
            await updateDoc(doc(db, SCHEMA.COLLECTIONS.USERS, userId), { role: 'vip' });
        }
        UI.showToast('ยืนยันสถานะ VIP เรียบร้อยแล้ว');
        fetchPayments();
    } catch (e) {
        UI.showToast('เกิดข้อผิดพลาดในการยืนยัน', 'error');
    }
};

document.addEventListener('DOMContentLoaded', fetchPayments);