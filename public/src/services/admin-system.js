import { ContentService } from '../../services/content-service.js';
import { UI } from '../../components/ui.js';

/**
 * ⚙️ ADMIN SYSTEM SETTINGS - Master Control
 */
document.addEventListener('DOMContentLoaded', async () => {
    UI.initAdminSidebar();

    const resetBtn = document.getElementById('reset-weekly-btn');

    if (resetBtn) {
        resetBtn.onclick = async () => {
            const isConfirmed = confirm(
                '⚠️ คำเตือน: คุณต้องการรีเซ็ตยอดวิวประจำสัปดาห์และคะแนน Trending ของเนื้อหาทั้งหมดใช่หรือไม่? \n(การดำเนินการนี้ไม่สามารถย้อนคืนได้)'
            );

            if (!isConfirmed) {
                return;
            }

            UI.setLoading(true);
            resetBtn.disabled = true;

            try {
                const result = await ContentService.resetWeeklyViews();

                if (result.success) {
                    UI.showToast(
                        `รีเซ็ตข้อมูลสำเร็จ! ทั้งหมด ${result.total} รายการ`,
                        'success'
                    );
                }
            } catch (error) {
                console.error('Reset Error:', error);
                UI.showToast('เกิดข้อผิดพลาดในการรีเซ็ตข้อมูล', 'error');
            } finally {
                UI.setLoading(false);
                resetBtn.disabled = false;
            }
        };
    }

    UI.refreshIcons();
});
