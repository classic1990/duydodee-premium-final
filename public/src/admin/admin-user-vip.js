import { db, collection, getDocs, query, where, orderBy, doc, getDoc, updateDoc, serverTimestamp, SCHEMA, auth, logActivity, checkIsAdmin } from '../services/firebase.js';
import { UI } from '../components/ui.js';

/**
 * 💎 ADMIN INDIVIDUAL VIP REPORT - Page Controller
 */
document.addEventListener('DOMContentLoaded', async () => {
    UI.initAdminSidebar();
    UI.setLoading(true);

    // 1. ดึง UID จาก URL Parameters (?uid=xxxx)
    const params = new URLSearchParams(window.location.search);
    const targetUid = params.get('uid');

    if (!targetUid) {
        UI.showToast('ไม่พบรหัสผู้ใช้งานที่ต้องการตรวจสอบ', 'error');
        setTimeout(() => history.back(), 2000);
        return;
    }

    // 2. ตรวจสอบสิทธิ์ผู้ใช้งาน (ต้องเป็น Admin/Master เท่านั้น)
    const user = auth.currentUser;
    // ปรับปรุง: ใช้ checkIsAdmin ที่ import มาโดยตรง
    const isAdmin = await checkIsAdmin(user);
    if (!isAdmin) {
        window.location.href = '/';
        return;
    }

    // 3. เริ่มโหลดข้อมูล
    await loadUserVIPData(targetUid);
    UI.setLoading(false);
});

/**
 * ดึงข้อมูลโปรไฟล์และประวัติการชำระเงินจาก Firestore
 */
async function loadUserVIPData(uid) {
    const emailEl = document.getElementById('target-user-email');
    const totalEl = document.getElementById('total-paid');
    const tbody = document.getElementById('payment-history-body');

    try {
        // 📂 ก. ดึงข้อมูลอีเมลผู้ใช้เพื่อแสดงใน Header
        const userSnap = await getDoc(doc(db, SCHEMA.COLLECTIONS.USERS, uid));
        if (userSnap.exists()) {
            emailEl.innerText = userSnap.data().email || 'Unknown Member';
        }

        // 📂 ข. ดึงรายการชำระเงินจาก vip_payments เฉพาะของ UID นี้
        const q = query(
            collection(db, SCHEMA.COLLECTIONS.VIP_PAYMENTS),
            where('userId', '==', uid),
            orderBy('createdAt', 'desc')
        );
        const snap = await getDocs(q);

        let totalPaid = 0;
        if (snap.empty) {
            tbody.innerHTML = '<tr><td colspan="4" class="p-10 text-center text-gray-500 Thai-font">ไม่พบประวัติการชำระเงินสำหรับสมาชิกคนนี้</td></tr>';
            return;
        }

        // 📂 ค. ประมวลผลข้อมูลและสร้าง HTML Rows
        tbody.innerHTML = snap.docs.map(docSnap => {
            const p = docSnap.data();
            const isConfirmed = p.status === 'confirmed';
            if (isConfirmed) totalPaid += (p.amount || 0);

            const statusClass = isConfirmed ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
            const statusLabel = isConfirmed ? 'ยืนยันแล้ว' : 'รอตรวจสอบ';
            const dateStr = p.createdAt?.toDate().toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' }) || 'ไม่มีข้อมูลวันที่';

            return `
                <tr class="hover:bg-white/[0.02] transition-colors group">
                    <td class="p-5 text-[10px] text-gray-400 font-medium">${dateStr}</td>
                    <td class="p-5 text-sm font-bold text-brand-primary Thai-font">${(p.amount || 0).toLocaleString()} THB</td>
                    <td class="p-5">
                        <span class="px-2 py-1 rounded border text-[9px] font-black uppercase ${statusClass}">${statusLabel}</span>
                    </td>
                    <td class="p-5 relative group/slip">
                        <div class="flex flex-col cursor-help">
                            <span class="text-[10px] text-white font-bold Thai-font group-hover/slip:text-brand-primary transition-colors underline decoration-white/10 underline-offset-4">${p.senderName || '-'}</span>
                            <span class="text-[9px] text-gray-600 font-medium uppercase tracking-widest">${p.transferTime || '--:--'} น.</span>
                        </div>
                        ${p.slipURL ? `
                            <div class="absolute bottom-full left-0 mb-3 w-48 p-2 bg-brand-obsidian/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] opacity-0 scale-90 group-hover/slip:opacity-100 group-hover/slip:scale-100 transition-all z-[100] pointer-events-none origin-bottom-left">
                                <img src="${p.slipURL}" class="w-full rounded-xl object-contain border border-white/5 shadow-inner" alt="Payment Slip">
                                <p class="text-[7px] text-center text-gray-500 mt-2 font-black uppercase tracking-widest">Evidence Preview</p>
                            </div>
                        ` : ''}
                    </td>
                    <td class="p-5 text-right">
                        ${!isConfirmed ? `
                            <button class="confirm-btn px-4 py-2 bg-brand-primary text-black text-[10px] font-black uppercase rounded-xl hover:scale-105 transition-all Thai-font shadow-lg shadow-brand-primary/20" 
                                    data-id="${docSnap.id}" data-amount="${p.amount}">
                                ยืนยันยอด
                            </button>
                        ` : `
                            <div class="flex items-center justify-end gap-2 text-green-500/50">
                                <i data-lucide="check-circle" class="w-4 h-4"></i>
                                <span class="text-[9px] font-black uppercase">Confirmed</span>
                            </div>
                        `}
                    </td>
                </tr>`;
        }).join('');

        // 📂 ค.2 Attach Event Listeners สำหรับปุ่มยืนยัน
        tbody.querySelectorAll('.confirm-btn').forEach(btn => {
            btn.onclick = async () => {
                const paymentId = btn.dataset.id;
                if (!confirm(`ยืนยันการรับยอดชำระเงิน ${btn.dataset.amount} THB และเพิ่มสถานะ VIP?`)) return;

                UI.setLoading(true);
                try {
                    // 1. คำนวณวันหมดอายุ (บวกเพิ่ม 30 วัน)
                    const userRef = doc(db, SCHEMA.COLLECTIONS.USERS, uid);
                    const userSnap = await getDoc(userRef);
                    const userData = userSnap.data() || {};
                    const currentExpiry = userData.vipUntil?.toDate();
                    const now = new Date();

                    // ถ้ายังไม่หมดอายุให้ต่อจากวันเดิม ถ้าหมดแล้วให้เริ่มจากตอนนี้
                    const startDate = (currentExpiry && currentExpiry > now) ? currentExpiry : now;
                    const newExpiry = new Date(startDate);
                    newExpiry.setDate(newExpiry.getDate() + 30);

                    // 2. อัปเดตข้อมูลผู้ใช้และรายการโอน
                    await Promise.all([
                        updateDoc(userRef, {
                            vipUntil: newExpiry,
                            role: ['admin', 'master', 'super-admin'].includes(userData.role) ? userData.role : 'vip',
                            updatedAt: serverTimestamp()
                        }),
                        updateDoc(doc(db, SCHEMA.COLLECTIONS.VIP_PAYMENTS, paymentId), {
                            status: 'confirmed',
                            confirmedAt: serverTimestamp(),
                            confirmedBy: auth.currentUser.email
                        })
                    ]);

                    await logActivity('CONFIRM_PAYMENT', `ยืนยันยอดเงิน ${btn.dataset.amount} THB (UID: ${uid}) วันหมดอายุใหม่: ${newExpiry.toLocaleDateString()}`);
                    UI.showToast('ยืนยันยอดเงินและปรับสถานะ VIP สำเร็จ', 'success');
                    loadUserVIPData(uid);
                } catch (err) {
                    console.error(err);
                    UI.showToast('เกิดข้อผิดพลาดในการบันทึกข้อมูล', 'error');
                } finally { UI.setLoading(false); }
            };
        });

        // 📂 ง. อัปเดตยอดรวมทั้งหมด
        totalEl.innerText = `${totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })} THB`;
        UI.refreshIcons();

    } catch (e) { console.error('VIP History Error:', e); UI.showToast('ไม่สามารถดึงข้อมูลได้', 'error'); }
}
