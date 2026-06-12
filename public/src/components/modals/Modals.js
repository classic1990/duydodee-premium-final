import {
    db,
    auth,
    getDoc,
    doc,
    collection,
    addDoc,
    serverTimestamp,
    SCHEMA
} from '../../services/firebase.js';

export const Modals = {
    renderVIPUpgradeModal: async (UI) => {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 z-[2000] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4';
        modal.innerHTML = `
            <div class="glass-premium border border-brand-primary/20 rounded-[2rem] p-8 max-w-sm w-full relative">
                <button onclick="this.closest('.fixed').remove()" class="absolute top-6 right-6 text-gray-500"><i data-lucide="x"></i></button>
                <div class="text-center space-y-6">
                    <h2 class="text-h2">สมัครสมาชิก VIP</h2>
                    <div id="payment-details" class="bg-black/40 p-6 rounded-2xl">
                        <p class="text-label">โหลดข้อมูลบัญชี...</p>
                    </div>
                    <form id="vip-form" class="space-y-3 text-left">
                        <input type="text" id="senderName" placeholder="ชื่อผู้โอน" required class="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-xs text-white">
                        <input type="number" id="transferAmount" placeholder="จำนวนเงิน" required class="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-xs text-white">
                        <input type="text" id="transferTime" placeholder="เวลาที่โอน (12:00)" required class="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-xs text-white">
                    </form>
                    <button id="submit-payment" class="btn-primary w-full">ยืนยันการชำระเงิน</button>
                </div>
            </div>`;
        document.body.appendChild(modal);
        UI.refreshIcons();

        try {
            const settingsSnap = await getDoc(doc(db, 'site_settings', 'payment_info'));
            const data = settingsSnap.exists() ? settingsSnap.data() : { wallet: '097-193-7338', name: 'DUYดูDEE' };
            document.getElementById('payment-details').innerHTML = `
                <p class="text-label">โอนเงินผ่าน Wallet</p>
                <div class="text-2xl font-black text-white">${data.wallet}</div>
                <p class="text-[10px] text-gray-500">ชื่อบัญชี: ${data.name}</p>`;

            document.getElementById('submit-payment').onclick = async () => {
                const name = document.getElementById('senderName').value;
                const amount = document.getElementById('transferAmount').value;
                const time = document.getElementById('transferTime').value;
                if (!name || !amount || !time) {
                    return UI.showToast('กรุณากรอกให้ครบ', 'error');
                }

                await addDoc(collection(db, 'vip_payments'), {
                    senderName: name,
                    amount: parseFloat(amount),
                    transferTime: time,
                    status: 'pending',
                    createdAt: serverTimestamp(),
                    userId: auth.currentUser?.uid || 'guest'
                });
                UI.showToast('ส่งข้อมูลเรียบร้อย');
                modal.remove();
            };
        } catch (e) {
            UI.showToast('โหลดข้อมูลบัญชีไม่ได้', 'error');
        }
    },

    renderTicketModal: async (UI) => {
        if (!auth.currentUser) {
            return UI.showToast('กรุณาเข้าสู่ระบบก่อนแจ้งปัญหา', 'error');
        }

        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 z-[2000] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 animate-fade-in';
        modal.innerHTML = `
            <div class="glass-premium border border-white/10 rounded-[2rem] p-8 max-w-md w-full relative animate-zoom-in">
                <button onclick="this.closest('.fixed').remove()" class="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors"><i data-lucide="x"></i></button>
                <div class="space-y-6">
                    <div class="text-center">
                        <h2 class="text-2xl font-black text-white Thai-font uppercase italic">HELP & <span class="text-brand-primary">SUPPORT</span></h2>
                        <p class="text-[10px] text-gray-500 uppercase tracking-widest mt-1">แจ้งปัญหาหรือสอบถามเจ้าหน้าที่</p>
                    </div>
                    <form id="ticket-form" class="space-y-4">
                        <div class="space-y-1">
                            <label class="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-1">หัวข้อปัญหา</label>
                            <input type="text" id="ticket-subject" placeholder="เช่น รับชมไม่ได้, ปัญหาการชำระเงิน" required class="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-xs text-white focus:border-brand-primary outline-none transition-all Thai-font">
                        </div>
                        <div class="space-y-1">
                            <label class="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-1">รายละเอียด</label>
                            <textarea id="ticket-message" placeholder="ระบุรายละเอียดปัญหาของคุณ..." required class="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-xs text-white h-32 resize-none focus:border-brand-primary outline-none transition-all Thai-font"></textarea>
                        </div>
                        <button type="submit" id="submit-ticket" class="btn-primary w-full !py-4 shadow-lg shadow-brand-primary/10">ส่งเรื่องแจ้งปัญหา</button>
                    </form>
                </div>
            </div>`;
        document.body.appendChild(modal);
        UI.refreshIcons();

        document.getElementById('ticket-form').onsubmit = async (e) => {
            e.preventDefault();
            UI.setLoading(true);
            try {
                const userDoc = await getDoc(doc(db, SCHEMA.COLLECTIONS.USERS, auth.currentUser.uid));
                const isVIP = userDoc.data()?.role === 'vip';

                await addDoc(collection(db, SCHEMA.COLLECTIONS.TICKETS), {
                    userId: auth.currentUser.uid,
                    userName: auth.currentUser.displayName || 'Member',
                    userEmail: auth.currentUser.email,
                    subject: document.getElementById('ticket-subject').value,
                    message: document.getElementById('ticket-message').value,
                    status: 'open',
                    priority: isVIP ? 'high' : 'normal',
                    createdAt: serverTimestamp(),
                    replies: []
                });
                UI.showToast('ส่งเรื่องแจ้งปัญหาเรียบร้อยแล้ว เจ้าหน้าที่จะตอบกลับโดยเร็วที่สุด', 'success');
                modal.remove();
            } catch (err) {
                UI.showToast('เกิดข้อผิดพลาด กรุณาลองใหม่', 'error');
            } finally {
                UI.setLoading(false);
            }
        };
    }
};
