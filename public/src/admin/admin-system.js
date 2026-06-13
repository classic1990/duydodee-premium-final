import { db, collection, getDocs, writeBatch, doc, getDoc, setDoc } from '../services/firebase.js';
import { checkAdminAccess } from '../middleware/auth-guard.js';
import { UI } from '../components/ui.js';
import { injectAdminSidebar } from './sidebar-loader.js';

/**
 * 🛡️ DUYดูDEE SYSTEM SAFETY ENGINE
 * Unified Logic for High-Level System Controls
 */

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const { user } = await checkAdminAccess();
        UI.setupSidebar(user);
        await injectAdminSidebar();
        UI.initAdminSidebar();
        initSystemControls();
        loadSystemSettings(); // Added load settings
        UI.refreshIcons();
    } catch (err) {
        console.error('Access Denied:', err);
        UI.showToast('ไม่มีสิทธิเข้าถึงหน้าตั้งค่าระบบ', 'error');
        setTimeout(() => {
            window.location.href = '/admin/admin-manage.html';
        }, 2000);
    }
});

function initSystemControls() {
    const purgeBtn = document.getElementById('purge-btn');
    if (purgeBtn) {
        purgeBtn.addEventListener('click', handlePurgeData);
    }

    const paymentForm = document.getElementById('payment-settings-form');
    if (paymentForm) {
        paymentForm.addEventListener('submit', handlePaymentSettings);
    }
}

async function loadSystemSettings() {
    try {
        const settingsDoc = await getDoc(doc(db, 'settings', 'payment'));
        if (settingsDoc.exists()) {
            const data = settingsDoc.data();
            document.getElementById('wallet-number').value = data.walletNumber || '';
            document.getElementById('account-name').value = data.accountName || '';
        }
    } catch (err) {
        console.error('Error loading settings:', err);
    }
}

async function handlePaymentSettings(e) {
    e.preventDefault();
    const walletNumber = document.getElementById('wallet-number').value;
    const accountName = document.getElementById('account-name').value;

    UI.setLoading(true);
    try {
        await setDoc(doc(db, 'settings', 'payment'), {
            walletNumber,
            accountName,
            updatedAt: new Date().toISOString()
        });
        UI.showToast('บันทึกข้อมูลสำเร็จ', 'success');
    } catch (err) {
        console.error(err);
        UI.showToast('เกิดข้อผิดพลาดในการบันทึก', 'error');
    } finally {
        UI.setLoading(false);
    }
}

async function handlePurgeData() {
    if (!confirm('🚨 คำเตือนสูงสุด: คุณต้องการลบข้อมูลหนังและซีรีส์ทั้งหมดในระบบใช่หรือไม่? การกระทำนี้ไม่สามารถเรียกคืนได้!')) {
        return;
    }

    const password = prompt('กรุณาพิมพ์ \'CONFIRM DELETE\' เพื่อยืนยัน:');
    if (password !== 'CONFIRM DELETE') {
        UI.showToast('การยืนยันไม่ถูกต้อง', 'error');
        return;
    }

    UI.setLoading(true);

    try {
        const collections = ['movies', 'series'];
        let totalDeleted = 0;

        for (const colName of collections) {
            const snap = await getDocs(collection(db, colName));
            if (!snap.empty) {
                const batch = writeBatch(db);
                snap.forEach(d => {
                    batch.delete(d.ref);
                    totalDeleted++;
                });
                await batch.commit();
            }
        }

        UI.showToast(`ล้างข้อมูลสำเร็จ! ลบไปทั้งหมด ${totalDeleted} รายการ`, 'success');
    } catch (err) {
        console.error(err);
        UI.showToast('เกิดข้อผิดพลาดในการล้างข้อมูล', 'error');
    } finally {
        UI.setLoading(false);
    }
}

