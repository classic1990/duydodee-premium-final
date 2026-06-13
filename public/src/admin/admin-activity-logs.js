import { db, collection, getDocs, query, orderBy, limit, startAfter, SCHEMA, where } from '../services/firebase.js';
import { UI } from '../components/ui.js';
import { checkAdminAccess } from '../middleware/auth-guard.js';
import { injectAdminSidebar } from './sidebar-loader.js';

let lastVisible = null;
let currentKeyword = '';
let adminFilter = '';
const LOG_LIMIT = 20;

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const { user } = await checkAdminAccess();
        UI.setupSidebar(user);
        await injectAdminSidebar();
        UI.initAdminSidebar();
    } catch (err) {
        console.error('Access Denied:', err);
        UI.showToast('ไม่มีสิทธิเข้าถึงหน้าบันทึกกิจกรรม', 'error');
        setTimeout(() => {
            window.location.href = '/admin/admin-manage.html';
        }, 2000);
        return;
    }

    UI.setLoading(true);
    await loadActivityLogs();
    UI.setLoading(false);

    const loadMoreBtn = document.getElementById('load-more-logs');
    if (loadMoreBtn) {
        loadMoreBtn.onclick = () => loadActivityLogs(true);
    }

    // 🔎 Setup Real-time Search & Filter Listeners
    const searchInput = document.getElementById('log-search-input');
    const adminInput = document.getElementById('admin-filter-input');
    const applyBtn = document.getElementById('apply-filters-btn');
    const exportBtn = document.getElementById('export-logs-btn');
    const quickToday = document.getElementById('quick-today-btn');
    const quickMonth = document.getElementById('quick-month-btn');

    let debounceTimer;
    const triggerReload = () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => loadActivityLogs(false), 400);
    };

    if (searchInput) {
        searchInput.oninput = (e) => {
            currentKeyword = e.target.value.trim().toUpperCase(); triggerReload();
        };
    }
    if (adminInput) {
        adminInput.oninput = (e) => {
            adminFilter = e.target.value.trim().toLowerCase(); triggerReload();
        };
    }
    if (applyBtn) {
        applyBtn.onclick = () => loadActivityLogs(false);
    }
    if (exportBtn) {
        exportBtn.onclick = () => exportLogsToCSV();
    }

    // ⚡ Quick Date Select Logic
    const setDateRange = (start, end) => {
        document.getElementById('date-start').value = start;
        document.getElementById('date-end').value = end;
        loadActivityLogs(false);
    };

    if (quickToday) {
        quickToday.onclick = () => {
            const today = new Date().toISOString().split('T')[0];
            setDateRange(today, today);
        };
    }

    if (quickMonth) {
        quickMonth.onclick = () => {
            const now = new Date();
            setDateRange(new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0], now.toISOString().split('T')[0]);
        };
    }
});

async function loadActivityLogs(isAppend = false) {
    const tbody = document.getElementById('log-table-body');
    if (!tbody) {
        return;
    }

    try {
        let q = query(collection(db, SCHEMA.COLLECTIONS.ACTIVITY_LOGS), orderBy('timestamp', 'desc'));

        // 📅 Apply Date Filters
        const dateStart = document.getElementById('date-start')?.value;
        const dateEnd = document.getElementById('date-end')?.value;
        if (dateStart) {
            q = query(q, where('timestamp', '>=', new Date(dateStart + 'T00:00:00')));
        }
        if (dateEnd) {
            q = query(q, where('timestamp', '<=', new Date(dateEnd + 'T23:59:59')));
        }

        // 📧 Apply Admin Filter
        if (adminFilter) {
            q = query(q, where('adminEmail', '==', adminFilter));
        }

        // ⚡ Apply Action Search (Prefix Matching)
        if (currentKeyword) {
            q = query(q, where('action', '>=', currentKeyword), where('action', '<=', currentKeyword + '\uf8ff'));
        }

        q = query(q, limit(LOG_LIMIT));

        if (isAppend && lastVisible) {
            q = query(q, startAfter(lastVisible));
        }

        const snap = await getDocs(q);
        if (snap.empty) {
            if (!isAppend) {
                tbody.innerHTML = '<tr><td colspan="4" class="p-10 text-center text-gray-500 Thai-font">ไม่มีประวัติการทำงาน</td></tr>';
            }
            document.getElementById('pagination-container')?.classList.add('hidden');
            return;
        }

        lastVisible = snap.docs[snap.docs.length - 1];
        const html = snap.docs.map(docSnap => {
            const log = docSnap.data();
            return `
                <tr class="hover:bg-white/[0.02] transition-colors">
                    <td class="p-5 text-[10px] font-medium text-gray-400">${UI.formatDate(log.timestamp)}</td>
                    <td class="p-5 text-xs font-bold">
                        <div class="flex flex-col">
                            <span>${log.adminName}</span>
                            <span class="text-[9px] text-gray-600 font-medium">${log.adminEmail}</span>
                        </div>
                    </td>
                    <td class="p-5"><span class="px-2 py-1 rounded bg-brand-primary/10 text-brand-primary text-[9px] font-black uppercase">${log.action}</span></td>
                    <td class="p-5 text-xs text-gray-400 font-medium Thai-font">${typeof log.details === 'object' ? JSON.stringify(log.details) : log.details}</td>
                </tr>`;
        }).join('');

        if (isAppend) {
            tbody.insertAdjacentHTML('beforeend', html);
        } else {
            tbody.innerHTML = html;
        }

    } catch (e) {
        console.error('Load Logs Error:', e);
    }
}

async function exportLogsToCSV() {
    UI.setLoading(true);
    try {
        const q = query(collection(db, SCHEMA.COLLECTIONS.ACTIVITY_LOGS), orderBy('timestamp', 'desc'), limit(1000));
        const snap = await getDocs(q);

        if (snap.empty) {
            UI.showToast('ไม่มีข้อมูลสำหรับการ Export', 'error');
            return;
        }

        const rows = [
            ['Timestamp', 'Admin Name', 'Admin Email', 'Action', 'Details']
        ];

        snap.docs.forEach(docSnap => {
            const log = docSnap.data();
            const date = log.timestamp?.toDate ? log.timestamp.toDate().toLocaleString('th-TH') : 'N/A';
            const details = typeof log.details === 'object' ? JSON.stringify(log.details).replace(/"/g, '""') : String(log.details).replace(/"/g, '""');
            rows.push([
                date,
                log.adminName || 'N/A',
                log.adminEmail || 'N/A',
                log.action || 'N/A',
                `"${details}"`
            ]);
        });

        const csvContent = '\uFEFF' + rows.map(e => e.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `admin_logs_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        UI.showToast('Export CSV สำเร็จ');
    } catch (e) {
        console.error('Export Error:', e);
        UI.showToast('Export ไม่สำเร็จ', 'error');
    } finally {
        UI.setLoading(false);
    }
}
