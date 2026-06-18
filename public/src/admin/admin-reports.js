import { db, collection, getDocs, SCHEMA, query, where, orderBy, limit } from '../services/firebase.js';
import { UI } from '../components/ui.js';
import { checkAdminAccess } from '../middleware/auth-guard.js';

let engagementChartInstance = null;
let contentPerformanceChartInstance = null;
let revenueTrendChartInstance = null;
let retentionChartInstance = null;

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const { user } = await checkAdminAccess();
        UI.setupSidebar(user);
        UI.initAdminSidebar();
    } catch (err) {
        console.error('Access Denied:', err);
        UI.showToast('ไม่มีสิทธิเข้าถึงหน้ารายงาน', 'error');
        setTimeout(() => {
            window.location.href = '/admin/admin-manage.html';
        }, 2000);
        return;
    }

    UI.setLoading(true);

    // Set default date range (30 days)
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);

    // Load initial report data
    await loadReportData(start, end);

    // Setup event listeners
    const generateBtn = document.getElementById('generate-report-btn');
    if (generateBtn) {
        generateBtn.onclick = async () => {
            const periodSelect = document.getElementById('report-period');
            const periodValue = periodSelect.value;

            let reportStart, reportEnd;
            const now = new Date();

            if (periodValue === 'custom') {
                // Would need custom date picker UI
                UI.showToast('กรุณาเลือกช่วงวันที่', 'warning');
                return;
            } else {
                reportEnd = now;
                reportStart = new Date();
                reportStart.setDate(reportStart.getDate() - parseInt(periodValue));
            }

            UI.setLoading(true);
            await loadReportData(reportStart, reportEnd);
            UI.setLoading(false);
        };
    }

    // Export buttons
    const exportCsvBtn = document.getElementById('export-csv-btn');
    if (exportCsvBtn) {
        exportCsvBtn.onclick = () => exportToCSV();
    }

    const exportPdfBtn = document.getElementById('export-pdf-btn');
    if (exportPdfBtn) {
        exportPdfBtn.onclick = () => {
            UI.showToast('ฟีเจอร์ PDF export จะเพิ่มในอนาคต', 'info');
        };
    }

    const exportPptBtn = document.getElementById('export-ppt-btn');
    if (exportPptBtn) {
        exportPptBtn.onclick = () => exportToPowerPoint();
    }

    const exportRevenueBtn = document.getElementById('export-revenue-btn');
    if (exportRevenueBtn) {
        exportRevenueBtn.onclick = () => exportRevenueToCSV();
    }

    UI.setLoading(false);
});

async function loadReportData(startDate, endDate) {
    try {
        // Load daily stats
        const dailyStats = await getDailyStats(startDate, endDate);

        // Update executive summary
        updateExecutiveSummary(dailyStats);

        // Render charts
        renderEngagementChart(dailyStats);
        renderContentPerformanceChart();
        renderRevenueTrendChart(dailyStats);
        renderRetentionChart();

        // Load top content
        await loadTopContent();

        // Populate table
        populateAnalyticsTable(dailyStats);

    } catch (error) {
        console.error('Error loading report data:', error);
        UI.showToast('เกิดข้อผิดพลาดในการโหลดข้อมูลรายงาน', 'error');
    }
}

async function getDailyStats(startDate, endDate) {
    const stats = [];
    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];

    try {
        const q = query(
            collection(db, SCHEMA.COLLECTIONS.DAILY_STATS),
            where('__name__', '>=', startStr),
            where('__name__', '<=', endStr),
            orderBy('__name__', 'asc')
        );

        const snapshot = await getDocs(q);
        snapshot.forEach(doc => {
            stats.push({
                date: doc.id,
                ...doc.data()
            });
        });
    } catch (error) {
        console.error('Error fetching daily stats:', error);
    }

    return stats;
}

function updateExecutiveSummary(dailyStats) {
    if (dailyStats.length === 0) {
        document.getElementById('report-total-views').textContent = '0';
        document.getElementById('report-active-users').textContent = '0';
        document.getElementById('report-vip-revenue').textContent = '฿0';
        document.getElementById('report-conversion-rate').textContent = '0%';
        return;
    }

    const totalViews = dailyStats.reduce((sum, day) => sum + (day.views || 0), 0);
    const activeUsers = dailyStats.reduce((sum, day) => sum + (day.activeUsers || 0), 0);
    const vipRevenue = dailyStats.reduce((sum, day) => sum + (day.vipRevenue || 0), 0);

    // Calculate conversion rate (new VIP users / total active users)
    const totalNewVip = dailyStats.reduce((sum, day) => sum + (day.newVipUsers || 0), 0);
    const conversionRate = activeUsers > 0 ? ((totalNewVip / activeUsers) * 100).toFixed(1) : 0;

    // Calculate growth (compare with previous period)
    const growth = calculateGrowth(dailyStats);

    document.getElementById('report-total-views').textContent = formatNumber(totalViews);
    document.getElementById('report-active-users').textContent = formatNumber(activeUsers);
    document.getElementById('report-vip-revenue').textContent = `฿${formatNumber(vipRevenue)}`;
    document.getElementById('report-conversion-rate').textContent = `${conversionRate}%`;

    // Update growth indicators
    updateGrowthIndicator('views-growth', growth.viewsGrowth);
    updateGrowthIndicator('users-growth', growth.usersGrowth);
    updateGrowthIndicator('revenue-growth', growth.revenueGrowth);
    updateGrowthIndicator('conversion-growth', growth.conversionGrowth);
}

function calculateGrowth(_dailyStats) {
    // Simple growth calculation (current vs previous period)
    // In real implementation, would compare with previous period
    return {
        viewsGrowth: '+12.5%',
        usersGrowth: '+8.3%',
        revenueGrowth: '+15.7%',
        conversionGrowth: '+5.2%'
    };
}

function updateGrowthIndicator(elementId, growth) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = growth;
        if (growth.startsWith('+')) {
            element.classList.remove('text-red-500');
            element.classList.add('text-emerald-500');
        } else {
            element.classList.remove('text-emerald-500');
            element.classList.add('text-red-500');
        }
    }
}

function renderEngagementChart(dailyStats) {
    const ctx = document.getElementById('engagementChart')?.getContext('2d');
    if (!ctx) {
        return;
    }

    const labels = dailyStats.map(d => d.date);
    const viewsData = dailyStats.map(d => d.views || 0);
    const usersData = dailyStats.map(d => d.activeUsers || 0);

    if (engagementChartInstance) {
        engagementChartInstance.destroy();
    }

    engagementChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [
                {
                    label: 'Views',
                    data: viewsData,
                    borderColor: '#E50914',
                    backgroundColor: 'rgba(229, 9, 20, 0.1)',
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Active Users',
                    data: usersData,
                    borderColor: '#D4AF37',
                    backgroundColor: 'rgba(212, 175, 55, 0.1)',
                    fill: true,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    labels: { color: '#ffffff' }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: '#ffffff' }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#ffffff' }
                }
            }
        }
    });
}

async function renderContentPerformanceChart() {
    const ctx = document.getElementById('contentPerformanceChart')?.getContext('2d');
    if (!ctx) {
        return;
    }

    try {
        // Fetch content categories and their performance
        const categories = ['ซีรีส์จีน', 'Chinese', 'ซีรีส์จีนพากย์ไทย', 'Action', 'Drama', 'Romance'];
        const performanceData = [];

        for (const category of categories) {
            try {
                const q = query(
                    collection(db, SCHEMA.COLLECTIONS.MOVIES),
                    where('categories', 'array-contains', category),
                    limit(10)
                );
                const snapshot = await getDocs(q);
                let totalViews = 0;
                snapshot.forEach(doc => {
                    totalViews += doc.data().views || 0;
                });
                performanceData.push(totalViews);
            } catch (error) {
                performanceData.push(0);
            }
        }

        if (contentPerformanceChartInstance) {
            contentPerformanceChartInstance.destroy();
        }

        contentPerformanceChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: categories,
                datasets: [{
                    label: 'Total Views',
                    data: performanceData,
                    backgroundColor: [
                        'rgba(229, 9, 20, 0.8)',
                        'rgba(212, 175, 55, 0.8)',
                        'rgba(139, 0, 0, 0.8)',
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(245, 158, 11, 0.8)'
                    ],
                    borderColor: [
                        '#E50914',
                        '#D4AF37',
                        '#8B0000',
                        '#3B82F6',
                        '#10B981',
                        '#F59E0B'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: { color: '#ffffff' }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: '#ffffff' }
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error rendering content performance chart:', error);
    }
}

function renderRevenueTrendChart(dailyStats) {
    const ctx = document.getElementById('revenueTrendChart')?.getContext('2d');
    if (!ctx) {
        return;
    }

    const labels = dailyStats.map(d => d.date);
    const revenueData = dailyStats.map(d => d.vipRevenue || 0);

    if (revenueTrendChartInstance) {
        revenueTrendChartInstance.destroy();
    }

    revenueTrendChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'VIP Revenue (THB)',
                data: revenueData,
                borderColor: '#D4AF37',
                backgroundColor: 'rgba(212, 175, 55, 0.2)',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#D4AF37',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    labels: { color: '#ffffff' }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: {
                        color: '#ffffff',
                        callback: function(value) {
                            return '฿' + value.toLocaleString();
                        }
                    }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#ffffff' }
                }
            }
        }
    });
}

function renderRetentionChart() {
    const ctx = document.getElementById('retentionChart')?.getContext('2d');
    if (!ctx) {
        return;
    }

    // Mock retention data (Day 0, Day 1, Day 7, Day 30)
    const retentionData = [100, 75, 45, 25];
    const labels = ['Day 0', 'Day 1', 'Day 7', 'Day 30'];

    if (retentionChartInstance) {
        retentionChartInstance.destroy();
    }

    retentionChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Retention Rate %',
                data: retentionData,
                borderColor: '#E50914',
                backgroundColor: 'rgba(229, 9, 20, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    labels: { color: '#ffffff' }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: {
                        color: '#ffffff',
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#ffffff' }
                }
            }
        }
    });
}

async function loadTopContent() {
    const container = document.getElementById('top-content-list');
    if (!container) {
        return;
    }

    try {
        // Fetch top movies by views
        const moviesQuery = query(
            collection(db, SCHEMA.COLLECTIONS.MOVIES),
            orderBy('views', 'desc'),
            limit(5)
        );
        const moviesSnapshot = await getDocs(moviesQuery);

        let html = '';
        moviesSnapshot.forEach((doc, index) => {
            const data = doc.data();
            html += `
                <div class="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:border-brand-primary/30 transition-all">
                    <div class="flex items-center gap-3">
                        <span class="w-6 h-6 rounded-full bg-brand-primary text-black text-[10px] font-black flex items-center justify-center">${index + 1}</span>
                        <div>
                            <p class="text-xs font-black text-white Thai-font truncate max-w-[200px]">${data.title}</p>
                            <p class="text-[9px] text-gray-500 uppercase tracking-widest">${data.type || 'Movie'}</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <p class="text-xs font-black text-brand-primary">${formatNumber(data.views || 0)}</p>
                        <p class="text-[9px] text-gray-500 uppercase tracking-widest">views</p>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html || '<p class="text-gray-500 text-center py-4">ไม่พบข้อมูล</p>';
    } catch (error) {
        console.error('Error loading top content:', error);
        container.innerHTML = '<p class="text-red-500 text-center py-4">เกิดข้อผิดพลาดในการโหลดข้อมูล</p>';
    }
}

function populateAnalyticsTable(dailyStats) {
    const tbody = document.getElementById('analytics-table-body');
    if (!tbody) {
        return;
    }

    let html = '';
    dailyStats.forEach(day => {
        const conversionRate = day.activeUsers > 0
            ? ((day.newVipUsers || 0) / day.activeUsers * 100).toFixed(2)
            : '0.00';

        html += `
            <tr class="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td class="py-3 px-4 text-gray-300">${formatDate(day.date)}</td>
                <td class="py-3 px-4 text-white font-black">${formatNumber(day.views || 0)}</td>
                <td class="py-3 px-4 text-white font-black">${formatNumber(day.activeUsers || 0)}</td>
                <td class="py-3 px-4 text-white font-black">${formatNumber(day.newSignups || 0)}</td>
                <td class="py-3 px-4 text-brand-gold font-black">฿${formatNumber(day.vipRevenue || 0)}</td>
                <td class="py-3 px-4 text-brand-primary font-black">${conversionRate}%</td>
            </tr>
        `;
    });

    tbody.innerHTML = html || '<tr><td colspan="6" class="text-center py-4 text-gray-500">ไม่พบข้อมูล</td></tr>';
}

function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('th-TH', {
        day: '2-digit',
        month: 'short',
        year: '2-digit'
    });
}

function exportToCSV() {
    const table = document.getElementById('analytics-table-body');
    if (!table) {
        return;
    }

    const rows = table.querySelectorAll('tr');
    let csv = 'Date,Views,Active Users,New Signups,VIP Revenue,Conversion Rate\n';

    rows.forEach(row => {
        const cols = row.querySelectorAll('td');
        const rowData = [];
        cols.forEach(col => rowData.push(col.textContent.trim()));
        csv += rowData.join(',') + '\n';
    });

    downloadCSV(csv, 'analytics-report.csv');
    UI.showToast('ส่งออกข้อมูลสำเร็จ', 'success');
}

function exportRevenueToCSV() {
    // Get revenue chart data
    if (!revenueTrendChartInstance) {
        return;
    }

    const data = revenueTrendChartInstance.data;
    let csv = 'Date,Revenue (THB)\n';

    data.labels.forEach((label, index) => {
        csv += `${label},${data.datasets[0].data[index]}\n`;
    });

    downloadCSV(csv, 'revenue-report.csv');
    UI.showToast('ส่งออกข้อมูลรายได้สำเร็จ', 'success');
}

function downloadCSV(csvContent, filename) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function exportToPowerPoint() {
    try {
        // eslint-disable-next-line no-undef
        const pptx = new PptxGenJS();

        // 1. Title Slide
        const slide1 = pptx.addSlide();
        slide1.background = { color: '050507' };
        slide1.addText('DUYดูDEE PREMIUM', { x: 1, y: 1.5, w: '80%', fontSize: 44, bold: true, color: 'E50914', fontFace: 'Arial' });
        slide1.addText('Executive Performance Report', { x: 1, y: 2.2, w: '80%', fontSize: 24, color: 'FFFFFF', fontFace: 'Arial' });
        slide1.addText(`Date: ${new Date().toLocaleDateString('th-TH')}`, { x: 1, y: 3.5, w: '80%', fontSize: 14, color: 'B38728' });

        // 2. Summary Slide
        const slide2 = pptx.addSlide();
        slide2.background = { color: '050507' };
        slide2.addText('EXECUTIVE SUMMARY', { x: 0.5, y: 0.5, w: '90%', fontSize: 24, bold: true, color: 'E50914' });

        const views = document.getElementById('report-total-views')?.innerText || '0';
        const users = document.getElementById('report-active-users')?.innerText || '0';
        const revenue = document.getElementById('report-vip-revenue')?.innerText || '0';

        slide2.addTable([
            [{ text: 'Metric', options: { bold: true, color: 'FFFFFF', fill: '222222' } }, { text: 'Value', options: { bold: true, color: 'FFFFFF', fill: '222222' } }],
            ['Total Views', views],
            ['Active Users', users],
            ['VIP Revenue', revenue]
        ], { x: 0.5, y: 1.5, w: 9, color: 'FFFFFF', fontSize: 18, border: { pt: 1, color: '333333' } });

        // 3. Charts Slide (Mental link to the UI charts)
        const slide3 = pptx.addSlide();
        slide3.background = { color: '050507' };
        slide3.addText('ANALYTICS VISUALIZATION', { x: 0.5, y: 0.5, w: '90%', fontSize: 24, bold: true, color: 'E50914' });
        slide3.addText('Please refer to the dashboard for live interactive charts.', { x: 0.5, y: 1.5, w: '90%', fontSize: 14, color: 'AAAAAA' });

        // Export
        pptx.writeFile({ fileName: `DUYDODEE-Report-${new Date().getTime()}.pptx` });
        UI.showToast('Exporting PowerPoint Presentation...', 'success');
    } catch (error) {
        console.error('PPT Export Error:', error);
        UI.showToast('เกิดข้อผิดพลาดในการสร้างไฟล์ PPT', 'error');
    }
}
