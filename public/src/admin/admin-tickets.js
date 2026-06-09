import { db, collection, query, orderBy, onSnapshot, updateDoc, doc, SCHEMA, auth, arrayUnion, serverTimestamp } from '../services/firebase.js';
import { UI } from '../components/ui.js';

document.addEventListener('DOMContentLoaded', async () => {
    UI.initAdminSidebar();
    loadTickets();
});

function loadTickets() {
    const container = document.getElementById('tickets-container');
    const filter = document.getElementById('status-filter');

    // ใช้ onSnapshot เพื่อให้เป็น Real-time Dashboard
    const q = query(collection(db, SCHEMA.COLLECTIONS.TICKETS), orderBy('createdAt', 'desc'));
    
    onSnapshot(q, (snap) => {
        const selectedStatus = filter.value;
        container.innerHTML = '';

        if (snap.empty) {
            return UI.renderEmptyState(container, 'ยังไม่มีรายการแจ้งปัญหาในขณะนี้');
        }

        snap.forEach(ticketDoc => {
            const t = ticketDoc.data();
            if (selectedStatus !== 'all' && t.status !== selectedStatus) return;

            const dateStr = t.createdAt?.toDate().toLocaleString('th-TH') || 'N/A';
            const isVIP = t.priority === 'high';
            
            const repliesHtml = (t.replies || []).map(r => `
                <div class="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                    <div class="flex justify-between items-center">
                        <span class="text-[8px] font-black text-brand-primary uppercase Thai-font">${r.adminName}</span>
                        <span class="text-[7px] text-gray-600">${r.createdAt?.toDate ? r.createdAt.toDate().toLocaleString('th-TH') : new Date(r.createdAt).toLocaleString('th-TH')}</span>
                    </div>
                    <p class="text-[10px] text-gray-300 Thai-font leading-relaxed">${UI.escapeHTML(r.message)}</p>
                </div>
            `).join('');

            const card = document.createElement('div');
            card.className = `glass-premium p-6 border ${isVIP ? 'border-brand-primary/30 bg-brand-primary/5' : 'border-white/5'} transition-all animate-fade-in`;
            card.innerHTML = `
                <div class="flex flex-col md:flex-row justify-between gap-6">
                    <div class="flex-1 space-y-4">
                        <div class="flex items-center gap-3">
                            <span class="px-2 py-1 rounded bg-black/40 text-[8px] font-black uppercase border border-white/10 ${t.status === 'open' ? 'text-red-500' : (t.status === 'resolved' ? 'text-green-500' : 'text-blue-400')}">${t.status}</span>
                            ${isVIP ? '<span class="badge-premium !text-[7px]">VIP PRIORITY</span>' : ''}
                            <span class="text-[9px] text-gray-500 uppercase font-bold">${dateStr}</span>
                        </div>
                        <div>
                            <h3 class="text-lg font-black text-white Thai-font">${UI.escapeHTML(t.subject)}</h3>
                            <p class="text-xs text-gray-400 Thai-font mt-2 leading-relaxed">${UI.escapeHTML(t.message)}</p>
                        </div>

                        <div class="mt-4 pt-4 border-t border-white/5 space-y-3">
                            <p class="text-[8px] font-black text-gray-600 uppercase tracking-widest">การตอบกลับ (${t.replies?.length || 0})</p>
                            <div class="space-y-2 max-h-48 overflow-y-auto scrollbar-hide">${repliesHtml}</div>
                            <div class="flex gap-2">
                                <input type="text" id="reply-input-${ticketDoc.id}" placeholder="พิมพ์ข้อความตอบกลับ..." class="flex-1 bg-black/60 border border-white/10 rounded-xl px-4 py-2 text-[10px] text-white outline-none focus:border-brand-primary Thai-font">
                                <button class="reply-btn p-2 bg-brand-primary text-black rounded-lg hover:scale-110 transition-all" data-id="${ticketDoc.id}">
                                    <i data-lucide="send" class="w-4 h-4"></i>
                                </button>
                            </div>
                        </div>

                        <div class="flex items-center gap-3 pt-2 border-t border-white/5">
                            <div class="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[10px] font-black text-brand-primary">${t.userName.charAt(0)}</div>
                            <div class="flex flex-col">
                                <span class="text-[10px] font-bold text-white">${t.userName}</span>
                                <span class="text-[8px] text-gray-600 uppercase">${t.userEmail}</span>
                            </div>
                        </div>
                    </div>
                    <div class="flex flex-row md:flex-col gap-2 justify-end">
                        <button class="status-btn px-4 py-2 bg-blue-600/20 text-blue-400 text-[9px] font-black uppercase rounded-lg border border-blue-600/20 hover:bg-blue-600 hover:text-white transition-all" data-id="${ticketDoc.id}" data-status="in-progress">รับเรื่อง</button>
                        <button class="status-btn px-4 py-2 bg-green-600/20 text-green-400 text-[9px] font-black uppercase rounded-lg border border-green-600/20 hover:bg-green-600 hover:text-white transition-all" data-id="${ticketDoc.id}" data-status="resolved">ปิดงาน</button>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });

        // Attach Events
        container.querySelectorAll('.status-btn').forEach(btn => {
            btn.onclick = async () => {
                const newStatus = btn.dataset.status;
                await updateDoc(doc(db, SCHEMA.COLLECTIONS.TICKETS, btn.dataset.id), { 
                    status: newStatus,
                    updatedAt: serverTimestamp() 
                });
                UI.showToast(`อัปเดตสถานะเป็น ${newStatus} สำเร็จ`);
            };
        });

        // Reply Actions
        container.querySelectorAll('.reply-btn').forEach(btn => {
            btn.onclick = async () => {
                const tid = btn.dataset.id;
                const input = document.getElementById(`reply-input-${tid}`);
                const msg = input.value.trim();
                if (!msg) return;

                await updateDoc(doc(db, SCHEMA.COLLECTIONS.TICKETS, tid), {
                    replies: arrayUnion({
                        adminName: auth.currentUser?.displayName || 'Admin',
                        message: msg,
                        createdAt: new Date()
                    }),
                    status: 'in-progress',
                    updatedAt: serverTimestamp()
                });
                UI.showToast('ส่งคำตอบเรียบร้อยแล้ว', 'success');
            };
        });

        UI.refreshIcons();
    });

    filter.onchange = () => loadTickets();
}
