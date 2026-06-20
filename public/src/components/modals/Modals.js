import {
    db,
    auth,
    getDoc,
    doc,
    collection,
    addDoc,
    serverTimestamp,
    SCHEMA,
    useFallback,
    firebaseFallback
} from '../../services/firebase.js';
import { VIP_PLANS } from '../../constants.js';

export const Modals = {
    renderVIPUpgradeModal: async (UI) => {
        // Fallback mode: show message that VIP is not available in simulation mode
        if (useFallback || !auth) {
            UI.showToast('ระบบ VIP ไม่พร้อมในโหมดจำลอง', 'warning');
            return;
        }

        const user = auth.currentUser;
        if (!user) {
            UI.showToast('กรุณาเข้าสู่ระบบก่อนสมัคร VIP', 'error');
            return;
        }

        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 z-[2000] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4';
        modal.innerHTML = `
            <div class="glass-premium border border-brand-primary/20 rounded-[2rem] p-8 max-w-2xl w-full relative max-h-[90vh] overflow-y-auto">
                <button onclick="this.closest('.fixed').remove()" class="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors">
                    <i data-lucide="x" class="w-6 h-6"></i>
                </button>
                
                <div class="text-center space-y-6 mb-8">
                    <div class="inline-block px-4 py-1.5 bg-brand-primary/10 border border-brand-primary/20 rounded-full">
                        <span class="text-brand-primary font-black text-xs uppercase tracking-widest">Premium Membership</span>
                    </div>
                    <h2 class="text-h2">เลือกแผนสมัคร VIP</h2>
                    <p class="text-body text-gray-400">สัมผัสประสบการณ์ความบันเทิงระดับพรีเมียมที่ดีที่สุด</p>
                </div>

                <!-- VIP Plans Selection -->
                <div id="vip-plans-container" class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <!-- Plans will be rendered here -->
                </div>

                <!-- Payment Details -->
                <div id="payment-details" class="bg-black/40 p-6 rounded-2xl mb-6">
                    <p class="text-label">โหลดข้อมูลบัญชี...</p>
                </div>

                <!-- Payment Form -->
                <form id="vip-form" class="space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="space-y-1">
                            <label class="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-1">ชื่อผู้โอน</label>
                            <input type="text" id="senderName" placeholder="ชื่อผู้โอน" required 
                                class="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-xs text-white focus:border-brand-primary outline-none transition-all">
                        </div>
                        <div class="space-y-1">
                            <label class="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-1">เบอร์โทรศัพท์</label>
                            <input type="text" id="senderBank" placeholder="ธนาคารที่โอน" required 
                                class="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-xs text-white focus:border-brand-primary outline-none transition-all">
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="space-y-1">
                            <label class="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-1">จำนวนเงิน (บาท)</label>
                            <input type="number" id="transferAmount" placeholder="จำนวนเงิน" required 
                                class="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-xs text-white focus:border-brand-primary outline-none transition-all">
                        </div>
                        <div class="space-y-1">
                            <label class="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-1">เวลาที่โอน</label>
                            <input type="text" id="transferTime" placeholder="เวลาที่โอน (12:00)" required 
                                class="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-xs text-white focus:border-brand-primary outline-none transition-all">
                        </div>
                    </div>

                    <div class="space-y-1">
                        <label class="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-1">อีเมลติดต่อ (สำหรับสลิปเงินคืด)</label>
                        <input type="email" id="contactEmail" placeholder="email@example.com" 
                            class="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-xs text-white focus:border-brand-primary outline-none transition-all">
                    </div>

                    <div class="space-y-1">
                        <label class="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-1">เบอร์โทรศัพท์สำหรับสลิป (ถ้ามี)</label>
                        <input type="text" id="slipBank" placeholder="ธนาคารที่เงินโอนมา" 
                            class="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-xs text-white focus:border-brand-primary outline-none transition-all">
                    </div>

                    <div class="flex items-start gap-3">
                        <input type="checkbox" id="agreeTerms" required class="mt-1">
                        <label for="agreeTerms" class="text-[10px] text-gray-400 leading-relaxed">
                            ยอมรับ <span class="text-brand-primary">เงื่อนไขและข้อกำหนด</span> ในการใช้งานสมาชิก VIP
                        </label>
                    </div>

                    <button type="button" id="submit-payment" class="btn-primary w-full !py-4 shadow-lg shadow-brand-primary/10">
                        ยืนยันการชำระเงิน
                    </button>
                </form>
            </div>`;
        document.body.appendChild(modal);
        UI.refreshIcons();

        // Render VIP Plans
        const plansContainer = document.getElementById('vip-plans-container');
        const selectedPlan = { id: null, price: 0, name: '' };

        Object.values(VIP_PLANS).forEach(plan => {
            const planElement = document.createElement('div');
            planElement.className = `vip-plan-option cursor-pointer border-2 rounded-2xl p-6 transition-all ${plan.popular ? 'border-brand-primary bg-brand-primary/5' : 'border-white/10 bg-black/40'} hover:border-brand-primary/50`;
            planElement.innerHTML = `
                <div class="text-center space-y-4">
                    <div class="inline-block px-3 py-1 ${plan.popular ? 'bg-brand-primary text-black' : 'bg-white/10 text-white'} rounded-full">
                        <span class="text-[10px] font-black uppercase tracking-widest">${plan.nameTH}</span>
                    </div>
                    <div class="text-3xl font-black text-white">${plan.price}<span class="text-sm text-gray-400">฿</span></div>
                    <div class="text-xs text-gray-400">${plan.duration} วัน</div>
                    <ul class="text-left space-y-2 text-[10px] text-gray-300">
                        ${plan.features.map(f => `<li class="flex items-start gap-2"><i data-lucide="check" class="w-3 h-3 text-brand-primary flex-shrink-0 mt-0.5"></i>${f}</li>`).join('')}
                    </ul>
                </div>
            `;
            planElement.onclick = () => {
                document.querySelectorAll('.vip-plan-option').forEach(el => {
                    el.classList.remove('border-brand-primary', 'bg-brand-primary/5');
                    el.classList.add('border-white/10', 'bg-black/40');
                });
                planElement.classList.remove('border-white/10', 'bg-black/40');
                planElement.classList.add('border-brand-primary', 'bg-brand-primary/5');
                selectedPlan.id = plan.id;
                selectedPlan.price = plan.price;
                selectedPlan.name = plan.nameTH;
            };
            plansContainer.appendChild(planElement);
        });

        // Select first plan by default
        plansContainer.children[0].click();

        try {
            const settingsSnap = await getDoc(doc(db, 'site_settings', 'payment_info'));
            const data = settingsSnap.exists() ? settingsSnap.data() : { wallet: '097-193-7338', name: 'DUYดูDEE' };
            document.getElementById('payment-details').innerHTML = `
                <div class="text-center">
                    <p class="text-label mb-2">โอนเงินผ่าน Wallet</p>
                    <div class="text-3xl font-black text-brand-gold">${data.wallet}</div>
                    <p class="text-[10px] text-gray-500 mt-1">ชื่อบัญชี: ${data.name}</p>
                    <div class="mt-3 p-3 bg-brand-primary/10 rounded-lg border border-brand-primary/20">
                        <p class="text-[10px] text-brand-primary font-bold">ยอดชำระเงิน: <span id="payment-amount">${selectedPlan.price}</span> ฿</p>
                    </div>
                </div>`;

            const submitButton = document.getElementById('submit-payment');
            if (submitButton) {
                submitButton.addEventListener('click', async (e) => {
                    e.preventDefault();

                    if (!selectedPlan.id) {
                        return UI.showToast('กรุณาเลือกแผน VIP', 'error');
                    }

                    const senderName = document.getElementById('senderName').value.trim();
                    const senderBank = document.getElementById('senderBank').value.trim();
                    const transferAmount = parseFloat(document.getElementById('transferAmount').value);
                    const transferTime = document.getElementById('transferTime').value.trim();
                    const contactEmail = document.getElementById('contactEmail').value.trim();
                    const slipBank = document.getElementById('slipBank').value.trim();
                    const agreeTerms = document.getElementById('agreeTerms').checked;

                    if (!senderName || !senderBank || !transferAmount || !transferTime || !agreeTerms) {
                        return UI.showToast('กรุณากรอกข้อมูลให้ครบ', 'error');
                    }

                    if (transferAmount < selectedPlan.price) {
                        return UI.showToast(`ยอดชำระเงินไม่ถูกต้อง อย่างน้อย ${selectedPlan.price} ฿`, 'error');
                    }

                    UI.setLoading(true);
                    try {
                        await addDoc(collection(db, SCHEMA.COLLECTIONS.VIP_PAYMENTS), {
                            planId: selectedPlan.id,
                            planName: selectedPlan.name,
                            planPrice: selectedPlan.price,
                            planDuration: VIP_PLANS[Object.keys(VIP_PLANS).find(k => VIP_PLANS[k].id === selectedPlan.id)].duration,
                            senderName: senderName,
                            senderBank: senderBank,
                            transferAmount: transferAmount,
                            transferTime: transferTime,
                            contactEmail: contactEmail,
                            slipBank: slipBank,
                            status: 'pending',
                            createdAt: serverTimestamp(),
                            userId: user.uid,
                            userEmail: user.email,
                            userName: user.displayName
                        });
                        UI.showToast('ส่งข้อมูลสมัคร VIP เรียบร้อยแล้ว เจ้าหน้าที่จะตรวจสอบและอัปเกรดภายการภายใน 24 ชั่วโมง', 'success');
                        modal.remove();
                    } catch (error) {
                        console.error('Payment submission error:', error);
                        UI.showToast('เกิดข้อผิดพลาดในการส่งข้อมูล กรุณาลองใหม่', 'error');
                    } finally {
                        UI.setLoading(false);
                    }
                });
            }
        } catch (e) {
            console.error('Error loading payment info:', e);
            UI.showToast('โหลดข้อมูลบัญชีไม่ได้', 'error');
        }
    },

    renderTicketModal: async (UI) => {
        let user;
        if (useFallback) {
            user = await firebaseFallback.getCurrentUser();
        } else {
            user = auth.currentUser;
        }
        if (!user) {
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
                const userDoc = await getDoc(doc(db, SCHEMA.COLLECTIONS.USERS, user.uid));
                const isVIP = userDoc.data()?.role === 'vip';

                await addDoc(collection(db, SCHEMA.COLLECTIONS.TICKETS), {
                    userId: user.uid,
                    userName: user.displayName || 'Member',
                    userEmail: user.email,
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
