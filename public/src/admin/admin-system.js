import { db, collection, getDocs, writeBatch } from '../services/firebase.js';
import { checkAdminAccess } from '../middleware/auth-guard.js';
import { UI } from '../components/ui.js';

/**
 * 🛡️ DUYดูDEE SYSTEM SAFETY ENGINE
 * Unified Logic for High-Level System Controls
 */

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const { user } = await checkAdminAccess();
    UI.setupSidebar(user);
    UI.initAdminSidebar();
    initSystemControls();
    UI.refreshIcons();
  } catch (err) {
    console.error('Access Denied:', err);
  }
});

function initSystemControls() {
  const purgeBtn = document.getElementById('purge-data-btn');
  if (!purgeBtn) {
    return;
  }

  purgeBtn.addEventListener('click', handlePurgeData);
}

async function handlePurgeData() {
  if (
    !confirm(
      '🚨 คำเตือนสูงสุด: คุณต้องการลบข้อมูลหนังและซีรีส์ทั้งหมดในระบบใช่หรือไม่? การกระทำนี้ไม่สามารถเรียกคืนได้!'
    )
  ) {
    return;
  }

  const password = prompt("กรุณาพิมพ์ 'CONFIRM DELETE' เพื่อยืนยัน:");
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
        snap.forEach((d) => {
          batch.delete(d.ref);
        });
        await batch.commit();
        totalDeleted += snap.size;
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
