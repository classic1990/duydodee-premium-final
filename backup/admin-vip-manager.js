import { db, collection, query, where, orderBy, getDocs, limit, doc, getDoc, updateDoc, serverTimestamp, SCHEMA, logActivity } from '../services/firebase.js';
import { UI } from '../components/ui.js';

/**
 * 👑 VIP MANAGEMENT ENGINE (Admin Only)
 */
document.addEventListener('DOMContentLoaded', () => {
    // สมมติว่ามี Table body id="vip-user-table" ใน HTML
    loadVipUsers();
});

async function loadVipUsers() {
    const tableBody = document.getElementById('vip-user-table');
    if (!tableBody) {
        return;
    }

    tableBody.innerHTML = '<tr><td colspan="5" class="text-center py-10 opacity-50">กำลังโหลดข้อมูล...</td></tr>';

    try {
        // 🔍 Query: เฉพาะสมาชิก VIP ที่ยัง Active และเรียงตามวันหมดอายุ (ใกล้หมดอยู่บน)
        const q = query(
            collection(db, SCHEMA.COLLECTIONS.USERS),
            where('vipStatus', '==', 'active'),
            orderBy('vipUntil', 'asc'),
            limit(50)
        );

        const snapshot = await getDocs(q);
        tableBody.innerHTML = '';

        if (snapshot.empty) {
            tableBody.innerHTML = '<tr><td colspan="5" class="text-center py-10">ไม่พบสมาชิก VIP ในขณะนี้</td></tr>';
            return;
        }

        const now = Date.now();
        let totalVip = 0;
        let expiringSoon = 0;
        let expiringWeek = 0;
        let activeNormal = 0;

        snapshot.forEach(doc => {
            const user = doc.data();
            const expiryDate = user.vipUntil?.toDate();
            const timeLeft = expiryDate ? expiryDate.getTime() - now : 0;
            const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));

            // 🎨 กำหนดสถานะสีตามความเร่งด่วน
            let statusClass = 'text-green-500';
            let statusText = 'ปกติ';

            if (daysLeft <= 3) {
                statusClass = 'text-red-500 font-bold animate-pulse';
                statusText = 'เร่งด่วน';
                expiringSoon++;
            } else if (daysLeft <= 7) {
                statusClass = 'text-amber-500 font-bold';
                statusText = 'ใกล้หมด';
                expiringWeek++;
            } else {
                activeNormal++;
            }

            totalVip++;

            const row = `
                <tr class="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td class="py-4 px-2">
                        <div class="flex items-center gap-3">
                            <img src="${user.photoURL || '/assets/logo/DUYDODEE.png'}" class="w-8 h-8 rounded-full object-cover">
                            <div>
                                <div class="text-sm font-bold text-white">${user.displayName || 'Unknown'}</div>
                            </div>
                        </div>
                    </td>
                    <td class="py-4 px-2 text-sm opacity-60">${user.email || '-'}</td>
                    <td class="py-4 px-2 text-sm">${expiryDate ? expiryDate.toLocaleDateString('th-TH') : '-'}</td>
                    <td class="py-4 px-2 text-sm ${statusClass}">${statusText}</td>
                    <td class="py-4 px-2 text-right">
                         <button onclick="extendVip('${doc.id}')" class="p-2 hover:text-brand-primary transition-colors">
                            <i data-lucide="calendar-plus" class="w-4 h-4"></i>
                         </button>
                    </td>
                </tr>
            `;
            tableBody.insertAdjacentHTML('beforeend', row);
        });

        // Update stats
        document.getElementById('total-vip').textContent = totalVip;
        document.getElementById('expiring-soon').textContent = expiringSoon;
        document.getElementById('expiring-week').textContent = expiringWeek;
        document.getElementById('active-normal').textContent = activeNormal;

        UI.refreshIcons();
    } catch (error) {
        console.error('Error loading VIP users:', error);
        UI.showToast('ไม่สามารถโหลดข้อมูลสมาชิกได้', 'error');
    }
}

/**
 * ➕ ต่ออายุสมาชิก VIP (เพิ่ม 30 วัน)
 */
async function extendVip(uid) {
    // eslint-disable-next-line no-alert
    if (!confirm('คุณต้องการต่ออายุสมาชิก VIP ให้กับผู้ใช้รายนี้อีก 30 วันใช่หรือไม่?')) {
        return;
    }

    UI.setLoading(true);
    try {
        const userRef = doc(db, SCHEMA.COLLECTIONS.USERS, uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            throw new Error('ไม่พบข้อมูลผู้ใช้');
        }

        const userData = userSnap.data();
        const currentExpiry = userData.vipUntil?.toDate();
        const now = new Date();

        // 💡 Logic: ถ้ายังไม่หมดอายุให้ต่อจากวันเดิม ถ้าหมดแล้วให้เริ่มจากตอนนี้
        const baseDate = (currentExpiry && currentExpiry > now) ? currentExpiry : now;
        const newExpiry = new Date(baseDate);
        newExpiry.setDate(newExpiry.getDate() + 30);

        await updateDoc(userRef, {
            vipUntil: newExpiry,
            vipStatus: 'active',
            updatedAt: serverTimestamp()
        });

        await logActivity('ADMIN_EXTEND_VIP', { targetUid: uid, newExpiry });
        UI.showToast('ต่ออายุสมาชิกสำเร็จ', 'success');
        loadVipUsers(); // โหลดตารางใหม่
    } catch (error) {
        console.error('Error extending VIP:', error);
        UI.showToast('เกิดข้อผิดพลาดในการต่ออายุ', 'error');
    } finally {
        UI.setLoading(false);
    }
}

// ผูกฟังก์ชันเข้ากับ Window เพื่อให้เรียกใช้จาก HTML onclick ได้
window.extendVip = extendVip;
