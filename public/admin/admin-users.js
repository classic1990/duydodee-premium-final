import { db, collection, getDocs, query, orderBy, updateDoc, doc, SCHEMA, auth } from '../../services/firebase.js';
import { UI } from '../../components/ui.js';

document.addEventListener('DOMContentLoaded', async () => {
    UI.initAdminSidebar();
    UI.setLoading(true);
    
    // ตรวจสอบสิทธิ์ Admin ก่อนเริ่มงาน
    const user = auth.currentUser;
    const isAdmin = await UI.AuthService.checkIsAdmin(user);
    if (!isAdmin) {
        window.location.href = '/';
        return;
    }

    await loadUsers();
    UI.setLoading(false);
});

async function loadUsers() {
    const tbody = document.getElementById('user-table-body');
    const countEl = document.getElementById('user-count');
    if (!tbody) return;

    try {
        const q = query(collection(db, SCHEMA.COLLECTIONS.USERS), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        
        tbody.innerHTML = '';
        countEl.innerText = `สมาชิกทั้งหมด: ${snap.size}`;

        snap.forEach(userDoc => {
            const u = userDoc.data();
            const roleColor = u.role === 'master' ? 'text-brand-primary' : (u.role === 'admin' ? 'text-red-400' : 'text-gray-400');
            
            const row = document.createElement('tr');
            row.className = 'hover:bg-white/[0.02] transition-colors';
            row.innerHTML = `
                <td class="p-5 flex items-center gap-3">
                    <img src="${u.photoURL || '/assets/DUYDODEE.png'}" class="w-8 h-8 rounded-lg border border-white/10">
                    <span class="text-xs font-bold Thai-font">${u.displayName || 'Unnamed'}</span>
                </td>
                <td class="p-5 text-xs text-gray-500 font-medium">${u.email}</td>
                <td class="p-5">
                    <select class="role-select bg-black/40 border border-white/10 rounded-lg text-[10px] font-bold p-1 ${roleColor}" data-uid="${userDoc.id}">
                        <option value="member" ${u.role === 'member' ? 'selected' : ''}>Member</option>
                        <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>Admin</option>
                        <option value="master" ${u.role === 'master' ? 'selected' : ''}>Master</option>
                    </select>
                </td>
                <td class="p-5">
                    <span class="px-2 py-1 rounded text-[9px] font-black uppercase ${u.isBanned ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}">
                        ${u.isBanned ? 'Banned' : 'Active'}
                    </span>
                </td>
                <td class="p-5 text-right">
                    <button class="ban-btn p-2 hover:text-red-500 transition-colors" data-uid="${userDoc.id}" data-banned="${u.isBanned}">
                        <i data-lucide="${u.isBanned ? 'unlock' : 'user-x'}" class="w-4 h-4"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });

        // Event Listeners สำหรับการเปลี่ยน Role และแบน
        document.querySelectorAll('.role-select').forEach(sel => {
            sel.onchange = async (e) => {
                const uid = e.target.dataset.uid;
                const newRole = e.target.value;
                await updateDoc(doc(db, SCHEMA.COLLECTIONS.USERS, uid), { role: newRole });
                UI.showToast('อัปเดตสิทธิ์เรียบร้อยแล้ว');
            };
        });

        document.querySelectorAll('.ban-btn').forEach(btn => {
            btn.onclick = async (e) => {
                const uid = btn.dataset.uid;
                const isBanned = btn.dataset.banned === 'true';
                await updateDoc(doc(db, SCHEMA.COLLECTIONS.USERS, uid), { isBanned: !isBanned });
                UI.showToast(isBanned ? 'ปลดแบนสำเร็จ' : 'แบนสมาชิกสำเร็จ');
                loadUsers();
            };
        });

        UI.refreshIcons();
    } catch (e) { console.error(e); }
}