import { db, collection, getDocs, getCountFromServer, SCHEMA } from '../../services/firebase.js';
import { UI } from '../../components/ui.js';

document.addEventListener('DOMContentLoaded', async () => {
    UI.initAdminSidebar();
    UI.setLoading(true);
    await renderCharts();
    UI.setLoading(false);
});

async function renderCharts() {
    try {
        // 📊 1. Fetch Basic Totals
        const usersCountSnap = await getCountFromServer(collection(db, SCHEMA.COLLECTIONS.USERS));
        const totalUsers = usersCountSnap.data().count;

        const moviesSnap = await getDocs(collection(db, SCHEMA.COLLECTIONS.MOVIES));
        const seriesSnap = await getDocs(collection(db, SCHEMA.COLLECTIONS.SERIES));
        
        const allContent = [...moviesSnap.docs, ...seriesSnap.docs].map(doc => doc.data());
        const totalViews = allContent.reduce((sum, item) => sum + (item.views || 0), 0);

        // 📊 Views Comparison (Movie vs Series)
        const movieViews = moviesSnap.docs.reduce((sum, d) => sum + (d.data().views || 0), 0);
        const seriesViews = seriesSnap.docs.reduce((sum, d) => sum + (d.data().views || 0), 0);

        new Chart(document.getElementById('viewTypeChart'), {
            type: 'pie',
            data: {
                labels: ['ภาพยนตร์ (Movies)', 'ซีรีส์ (Series)'],
                datasets: [{
                    data: [movieViews, seriesViews],
                    backgroundColor: ['#fbbf24', '#3b82f6'],
                    borderWidth: 0,
                    hoverOffset: 20
                }]
            },
            options: { maintainAspectRatio: false, plugins: { legend: { labels: { color: '#ccc', font: { family: 'Kanit' } } } } }
        });

        // Update Summary Cards
        UI.setCounter('total-users', totalUsers);
        UI.setCounter('total-views', totalViews);
        UI.setCounter('total-movies', moviesSnap.size);
        UI.setCounter('total-series', seriesSnap.size);

        // 📈 2. Process: Views by Category
        const catData = {};
        allContent.forEach(item => {
            const cat = item.category || 'อื่นๆ';
            catData[cat] = (catData[cat] || 0) + (item.views || 0);
        });

        new Chart(document.getElementById('categoryChart'), {
            type: 'doughnut',
            data: {
                labels: Object.keys(catData),
                datasets: [{
                    data: Object.values(catData),
                    backgroundColor: ['#fbbf24', '#3b82f6', '#ef4444', '#10b981', '#8b5cf6'],
                    borderWidth: 0
                }]
            },
            options: { plugins: { legend: { position: 'bottom', labels: { color: '#888', font: { family: 'Kanit' } } } } }
        });

        // 2. Process: Content by Year
        const yearData = {};
        allContent.forEach(item => {
            const year = item.year || 'N/A';
            yearData[year] = (yearData[year] || 0) + 1;
        });

        new Chart(document.getElementById('yearChart'), {
            type: 'bar',
            data: {
                labels: Object.keys(yearData).sort(),
                datasets: [{
                    label: 'จำนวนเรื่อง',
                    data: Object.values(yearData),
                    backgroundColor: 'rgba(251, 191, 36, 0.5)',
                    borderColor: '#fbbf24',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#666' } },
                    x: { grid: { display: false }, ticks: { color: '#666' } }
                }
            }
        });

    } catch (error) {
        console.error('Stats Error:', error);
        UI.showToast('ไม่สามารถโหลดข้อมูลสถิติได้', 'error');
    }
}

/**
 * 📈 ดึงข้อมูลสถิติตามช่วงวันที่เลือกและอัปเดตกราฟ Daily Traffic
 */
async function renderPeriodStats() {
    const startDate = document.getElementById('date-start').value; // YYYY-MM-DD
    const endDate = document.getElementById('date-end').value;     // YYYY-MM-DD

    try {
        // ดึงข้อมูลจากคอลเลกชัน daily_stats โดยใช้ ID เป็นชื่อวันที่ (YYYY-MM-DD)
        const q = query(
            collection(db, SCHEMA.COLLECTIONS.DAILY_STATS),
            where('__name__', '>=', startDate),
            where('__name__', '<=', endDate)
        );

        const snap = await getDocs(q);
        const dailyData = {};
        let periodTotalViews = 0;

        snap.forEach(doc => {
            const data = doc.data();
            const views = data.views || 0;
            dailyData[doc.id] = views;
            periodTotalViews += views;
        });

        // อัปเดตตัวเลขยอดวิวรวมของช่วงเวลาที่เลือก (ถ้าต้องการแสดงแยก)
        // ในที่นี้เราจะอัปเดตตัวเลขในหน้า Dashboard หลักให้เห็นความเคลื่อนไหว
        const viewsEl = document.getElementById('total-views');
        if (viewsEl) viewsEl.innerText = periodTotalViews.toLocaleString();

        // 📊 อัปเดตกราฟเส้น (Daily Traffic)
        const ctx = document.getElementById('dailyChart').getContext('2d');
        if (dailyChartInstance) dailyChartInstance.destroy();

        const sortedDates = Object.keys(dailyData).sort();
        
        dailyChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: sortedDates,
                datasets: [{
                    label: 'ยอดการรับชมรายวัน',
                    data: sortedDates.map(d => dailyData[d]),
                    borderColor: '#fbbf24',
                    backgroundColor: 'rgba(251, 191, 36, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointBackgroundColor: '#fbbf24'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#666', font: { size: 10 } } },
                    x: { grid: { display: false }, ticks: { color: '#666', font: { size: 10 } } }
                }
            }
        });
    } catch (error) {
        console.error('Period Stats Error:', error);
    }
}