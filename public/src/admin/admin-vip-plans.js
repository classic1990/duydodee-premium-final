import { db, collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, serverTimestamp, SCHEMA, auth, useFallback, firebaseFallback } from '../services/firebase.js';
import { AuthService } from '../services/auth-service.js';
import { UI } from '../components/ui.js';
import { injectAdminSidebar } from './sidebar-loader.js';

/**
 * 👑 VIP PLANS MANAGEMENT ENGINE (Admin Only)
 */
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Check authentication
        let user;
        if (useFallback) {
            user = await firebaseFallback.getCurrentUser();
        } else {
            user = auth.currentUser;
        }
        if (!user) {
            window.location.href = '/login.html';
            return;
        }

        UI.setupSidebar(user);
        await injectAdminSidebar();
        UI.initAdminSidebar();
        loadVipPlans();
    } catch (err) {
        console.error('Error initializing:', err);
        window.location.href = '/login.html';
    }
});

async function loadVipPlans() {
    const tableBody = document.getElementById('vip-plans-table');
    if (!tableBody) {
        return;
    }

    tableBody.innerHTML = '<tr><td colspan="5" class="text-center py-10 opacity-50">กำลังโหลดข้อมูล...</td></tr>';

    try {
        const snapshot = await getDocs(collection(db, SCHEMA.COLLECTIONS.VIP_PLANS));
        tableBody.innerHTML = '';

        if (snapshot.empty) {
            tableBody.innerHTML = '<tr><td colspan="5" class="text-center py-10">ไม่พบแผน VIP ในขณะนี้</td></tr>';
            return;
        }

        let totalPlans = 0;
        let popularPlans = 0;
        let activePlans = 0;

        snapshot.forEach(doc => {
            const plan = doc.data();
            const planId = doc.id;

            totalPlans++;
            if (plan.popular) {
                popularPlans++;
            }
            if (plan.active !== false) {
                activePlans++;
            }

            const row = `
                <tr class="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td class="py-4 px-2">
                        <div>
                            <div class="text-sm font-bold text-white">${plan.nameTH || '-'}</div>
                            <div class="text-xs text-gray-500">${plan.nameEN || '-'}</div>
                        </div>
                    </td>
                    <td class="py-4 px-2 text-sm text-brand-gold font-bold">${plan.price} ฿</td>
                    <td class="py-4 px-2 text-sm">${plan.duration} วัน</td>
                    <td class="py-4 px-2">
                        ${plan.active !== false ?
        '<span class="px-3 py-1 bg-green-500/10 text-green-500 text-[10px] font-black uppercase rounded-full border border-green-500/20">Active</span>' :
        '<span class="px-3 py-1 bg-red-500/10 text-red-500 text-[10px] font-black uppercase rounded-full border border-red-500/20">Inactive</span>'
}
                        ${plan.popular ? '<span class="px-2 py-0.5 bg-brand-primary/10 text-brand-primary text-[8px] font-black uppercase rounded-full border border-brand-primary/20 ml-2">Popular</span>' : ''}
                    </td>
                    <td class="py-4 px-2 text-right">
                        <div class="flex justify-end gap-2">
                            <button onclick="editPlan('${planId}')" class="p-2 hover:text-brand-primary transition-colors">
                                <i data-lucide="edit" class="w-4 h-4"></i>
                            </button>
                            <button onclick="togglePopular('${planId}')" class="p-2 hover:text-cyan-400 transition-colors">
                                <i data-lucide="star" class="w-4 h-4"></i>
                            </button>
                            <button onclick="toggleActive('${planId}')" class="p-2 hover:text-green-500 transition-colors">
                                <i data-lucide="${plan.active !== false ? 'eye-off' : 'eye'}" class="w-4 h-4"></i>
                            </button>
                            <button onclick="deletePlan('${planId}')" class="p-2 hover:text-red-500 transition-colors">
                                <i data-lucide="trash-2" class="w-4 h-4"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
            tableBody.insertAdjacentHTML('beforeend', row);
        });

        document.getElementById('total-plans').textContent = totalPlans;
        document.getElementById('popular-plans').textContent = popularPlans;
        document.getElementById('active-plans').textContent = activePlans;

        UI.refreshIcons();
    } catch (error) {
        console.error('Error loading VIP plans:', error);
        UI.showToast('ไม่สามารถโหลดข้อมูลแผน VIP ได้', 'error');
    }
}

function openPlanModal(planId = null) {
    const modal = document.getElementById('plan-modal');
    const title = document.getElementById('modal-title');
    const form = document.getElementById('plan-form');

    modal.classList.remove('hidden');

    if (planId) {
        title.textContent = 'แก้ไขแผน VIP';
        // Load plan data
        loadPlanData(planId);
    } else {
        title.textContent = 'เพิ่มแผน VIP ใหม่';
        form.reset();
        document.getElementById('plan-id').value = '';
    }
}

function closePlanModal() {
    document.getElementById('plan-modal').classList.add('hidden');
}

async function loadPlanData(planId) {
    try {
        const snap = await getDoc(doc(db, SCHEMA.COLLECTIONS.VIP_PLANS, planId));
        if (snap.exists()) {
            const plan = snap.data();
            document.getElementById('plan-id').value = planId;
            document.getElementById('plan-name-th').value = plan.nameTH || '';
            document.getElementById('plan-name-en').value = plan.nameEN || '';
            document.getElementById('plan-price').value = plan.price || '';
            document.getElementById('plan-duration').value = plan.duration || '';
            document.getElementById('plan-features').value = (plan.features || []).join('\n');
            document.getElementById('plan-popular').checked = plan.popular || false;
        }
    } catch (error) {
        console.error('Error loading plan data:', error);
        UI.showToast('ไม่สามารถโหลดข้อมูลแผนได้', 'error');
    }
}

document.getElementById('plan-form').onsubmit = async (e) => {
    e.preventDefault();
    UI.setLoading(true);

    try {
        const planId = document.getElementById('plan-id').value;
        const planData = {
            nameTH: document.getElementById('plan-name-th').value.trim(),
            nameEN: document.getElementById('plan-name-en').value.trim(),
            price: parseFloat(document.getElementById('plan-price').value),
            duration: parseInt(document.getElementById('plan-duration').value),
            features: document.getElementById('plan-features').value.split('\n').filter(f => f.trim()),
            popular: document.getElementById('plan-popular').checked,
            active: true,
            updatedAt: serverTimestamp()
        };

        if (planId) {
            await updateDoc(doc(db, SCHEMA.COLLECTIONS.VIP_PLANS, planId), planData);
            UI.showToast('อัปเดตแผน VIP สำเร็จ', 'success');
        } else {
            planData.createdAt = serverTimestamp();
            await addDoc(collection(db, SCHEMA.COLLECTIONS.VIP_PLANS), planData);
            UI.showToast('เพิ่มแผน VIP สำเร็จ', 'success');
        }

        closePlanModal();
        loadVipPlans();
    } catch (error) {
        console.error('Error saving plan:', error);
        UI.showToast('เกิดข้อผิดพลาดในการบันทึกข้อมูล', 'error');
    } finally {
        UI.setLoading(false);
    }
};

async function editPlan(planId) {
    openPlanModal(planId);
}

async function togglePopular(planId) {
    try {
        const snap = await getDoc(doc(db, SCHEMA.COLLECTIONS.VIP_PLANS, planId));
        if (snap.exists()) {
            const plan = snap.data();
            await updateDoc(doc(db, SCHEMA.COLLECTIONS.VIP_PLANS, planId), {
                popular: !plan.popular,
                updatedAt: serverTimestamp()
            });
            UI.showToast('อัปเดตสถานะ Popular สำเร็จ', 'success');
            loadVipPlans();
        }
    } catch (error) {
        console.error('Error toggling popular:', error);
        UI.showToast('เกิดข้อผิดพลาด', 'error');
    }
}

async function toggleActive(planId) {
    try {
        const snap = await getDoc(doc(db, SCHEMA.COLLECTIONS.VIP_PLANS, planId));
        if (snap.exists()) {
            const plan = snap.data();
            await updateDoc(doc(db, SCHEMA.COLLECTIONS.VIP_PLANS, planId), {
                active: plan.active === false ? true : false,
                updatedAt: serverTimestamp()
            });
            UI.showToast('อัปเดตสถานะ Active สำเร็จ', 'success');
            loadVipPlans();
        }
    } catch (error) {
        console.error('Error toggling active:', error);
        UI.showToast('เกิดข้อผิดพลาด', 'error');
    }
}

async function deletePlan(planId) {
    // eslint-disable-next-line no-alert
    if (!confirm('คุณต้องการลบแผน VIP นี้ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้')) {
        return;
    }

    UI.setLoading(true);
    try {
        await deleteDoc(doc(db, SCHEMA.COLLECTIONS.VIP_PLANS, planId));
        UI.showToast('ลบแผน VIP สำเร็จ', 'success');
        loadVipPlans();
    } catch (error) {
        console.error('Error deleting plan:', error);
        UI.showToast('เกิดข้อผิดพลาดในการลบแผน', 'error');
    } finally {
        UI.setLoading(false);
    }
}

// Export functions for HTML onclick
window.openPlanModal = openPlanModal;
window.closePlanModal = closePlanModal;
window.editPlan = editPlan;
window.togglePopular = togglePopular;
window.toggleActive = toggleActive;
window.deletePlan = deletePlan;
