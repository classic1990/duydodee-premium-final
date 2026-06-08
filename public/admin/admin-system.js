import { ContentService } from '../../services/content-service.js';
import { UI } from '../../components/ui.js';
import { auth, logActivity, functions, httpsCallable } from '../../services/firebase.js';

/**
 * ⚙️ ADMIN SYSTEM SETTINGS - Page Controller
 */
document.addEventListener('DOMContentLoaded', async () => {
    UI.initAdminSidebar();
    
    const resetBtn = document.getElementById('reset-weekly-btn');
    if (resetBtn) {
        resetBtn.onclick = async () => {
            if (!confirm('⚠️ รีเซ็ตยอดวิวประจำสัปดาห์?')) return;
            UI.setLoading(true);
            try {
                const result = await ContentService.resetWeeklyViews();
                if (result.success) {
                    await logActivity('RESET_WEEKLY_STATS', `แอดมินรีเซ็ตสถิติ ${result.total} รายการ`);
                    const sendLineNotify = httpsCallable(functions, 'sendLineNotify');
                    await sendLineNotify({ message: `🚀 แอดมิน ${auth.currentUser?.displayName} รีเซ็ตยอดวิวประจำสัปดาห์แล้ว` });
                    UI.showToast(`สำเร็จ! ${result.total} รายการ`, 'success');
                }
            } catch (error) { UI.showToast('ผิดพลาด', 'error'); }
            finally { UI.setLoading(false); }
        };
    }
    UI.refreshIcons();
});