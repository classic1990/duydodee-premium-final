import { db, collection, getDocs, SCHEMA, query, where, orderBy, limit } from '../services/firebase.js';
import { UI } from '../components/ui.js';
import { checkAdminAccess } from '../middleware/auth-guard.js';

let dailyChartInstance = null;

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const { user } = await checkAdminAccess();
        UI.setupSidebar(user);
        UI.initAdminSidebar();
    } catch (err) {
        console.error('Access Denied:', err);
        UI.showToast('ไม่มีสิทธิเข้าถึงหน้าสถิติ', 'error');
        setTimeout(() => {
            window.location.href = '/admin/admin-manage.html';
        }, 2000);
        return;
    }

    UI.setLoading(true);

    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 7);

    const startInput = document.getElementById('date-start');
    const endInput = document.getElementById('date-end');

    if (startInput) {
        startInput.value = start.toISOString().split('T')[0];
    }
    if (endInput) {
        endInput.value = end.toISOString().split('T')[0];
    }

    await renderCharts();
    await renderPeriodStats();

    const filterBtn = document.getElementById('filter-date-btn');
    if (filterBtn) {
        filterBtn.onclick = async () => {
            UI.setLoading(true);
            await renderPeriodStats();
            UI.setLoading(false);
        };
    }
    UI.setLoading(false);
});

async function renderCharts() {
    try {
        const statsSnap = await getDocs(query(collection(db, SCHEMA.COLLECTIONS.DAILY_STATS), orderBy('lastUpdated', 'asc'), limit(14)));
        if (statsSnap.empty) {
            return;
        }

        const labels = [];
        const views = [];

        statsSnap.forEach(doc => {
            labels.push(doc.id); // YYYY-MM-DD
            views.push(doc.data().views || 0);
        });

        const ctx = document.getElementById('dailyViewsChart')?.getContext('2d');
        if (ctx && typeof Chart !== 'undefined') {
            if (dailyChartInstance) {
                dailyChartInstance.destroy();
            }
            dailyChartInstance = new Chart(ctx, {
                type: 'line',
                data: {
                    labels,
                    datasets: [{
                        label: 'ยอดการเข้าชมรายวัน',
                        data: views,
                        borderColor: '#fbbf24',
                        backgroundColor: 'rgba(251, 191, 36, 0.1)',
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { beginAtZero: true, grid: { color: 'rgba(255, 255, 255, 0.05)' } },
                        x: { grid: { display: false } }
                    }
                }
            });
        }
    } catch (error) {
        console.error('Error rendering charts:', error);
    }
}

async function renderPeriodStats() {
    try {
        const start = document.getElementById('date-start')?.value;
        const end = document.getElementById('date-end')?.value;
        if (!start || !end) {
            return;
        }

        const q = query(
            collection(db, SCHEMA.COLLECTIONS.DAILY_STATS),
            where('__name__', '>=', start),
            where('__name__', '<=', end)
        );

        const snap = await getDocs(q);
        let totalViews = 0;
        snap.forEach(d => {
            totalViews += (d.data().views || 0);
        });

        const el = document.getElementById('period-total-views');
        if (el) {
            el.innerText = totalViews.toLocaleString();
        }
    } catch (error) {
        console.error('Error rendering period stats:', error);
        const el = document.getElementById('period-total-views');
        if (el) {
            el.innerText = 'N/A';
        }
    }
}
