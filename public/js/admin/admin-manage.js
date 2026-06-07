import { db, collection, getDocs, query, orderBy, limit, SCHEMA, getCountFromServer, getAggregateFromServer, sum, where } from '/js/services/firebase.js';
import { checkAdminAccess } from '/js/middleware/auth-guard.js';
import { UI } from '/js/components/ui.js';

/**
 * 👑 DUYดูDEE EXECUTIVE DASHBOARD ENGINE
 * ปรับปรุงระบบให้โหลดแยกกันเพื่อป้องกันหน้าจอค้าง
 */

async function init() {
    try {
        // 1. ตรวจสอบสิทธิ์ก่อน (ถ้าไม่ผ่านจะเด้งออกไปหน้าแรก)
        const { user } = await checkAdminAccess();
        UI.setupSidebar(user);
        UI.initAdminSidebar();
        
        // 2. ปิดตัวโหลดหลักทันที แล้วให้แต่ละส่วนแยกกันโหลดเอง (แบบ Async)
        UI.setLoading(false);
        
        // 3. เริ่มโหลดข้อมูลแต่ละส่วน (ไม่ใช้ await Promise.all เพื่อไม่ให้ติดบล็อก)
        fetchStats().catch(e => console.error('Stats Error:', e));
        fetchRecentAssets().catch(e => console.error('Assets Error:', e));
        initChart().catch(e => console.error('Chart Error:', e));
        initTopContentChart().catch(e => console.error('Top Chart Error:', e));
        
        setupFilter();
        UI.refreshIcons();
    } catch (err) {
        console.error('Dashboard Init Failed:', err);
        UI.setLoading(false);
        UI.showToast('การเชื่อมต่อล้มเหลว โปรดตรวจสอบสิทธิ์', 'error');
    }
}

function setupFilter() {
    const filter = document.getElementById('category-filter');
    if (!filter) return;
    filter.onchange = (e) => fetchRecentAssets(e.target.value);
}

async function initTopContentChart() {
    const ctx = document.getElementById('topContentChart')?.getContext('2d');
    if (!ctx) return;

    try {
        // ดึงข้อมูล 10 อันดับแรก
        const [mSnap, sSnap] = await Promise.all([
            getDocs(query(collection(db, SCHEMA.COLLECTIONS.MOVIES), orderBy('views', 'desc'), limit(10))),
            getDocs(query(collection(db, SCHEMA.COLLECTIONS.SERIES), orderBy('views', 'desc'), limit(10)))
        ]);

        const all = [
            ...mSnap.docs.map(d => ({ title: d.data().title, views: d.data().views })),
            ...sSnap.docs.map(d => ({ title: d.data().title, views: d.data().views }))
        ]
        .sort((a, b) => b.views - a.views)
        .slice(0, 10);

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: all.map(i => i.title.substring(0, 15) + (i.title.length > 15 ? '...' : '')),
                datasets: [{
                    label: 'จำนวนการเข้าชม',
                    data: all.map(i => i.views),
                    backgroundColor: 'rgba(59, 130, 246, 0.4)',
                    borderColor: '#3b82f6',
                    borderWidth: 2,
                    borderRadius: 8,
                    hoverBackgroundColor: '#3b82f6'
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(8, 8, 10, 0.95)',
                        titleFont: { family: 'Kanit', size: 12 },
                        bodyFont: { family: 'Kanit', size: 12 },
                        cornerRadius: 12
                    }
                },
                scales: {
                    x: {
                        grid: { color: 'rgba(255,255,255,0.02)', drawBorder: false },
                        ticks: { color: 'rgba(255,255,255,0.3)', font: { size: 9, family: 'Montserrat' } }
                    },
                    y: {
                        grid: { display: false },
                        ticks: { color: '#fff', font: { size: 9, family: 'Kanit' } }
                    }
                }
            }
        });
    } catch (err) { 
        console.warn('Top Content Chart Index missing or permission denied.');
        new Chart(ctx, {
            type: 'bar',
            data: { labels: ['ไม่มีข้อมูล'], datasets: [{ data: [0], backgroundColor: '#333' }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
        });
    }
}

async function initChart() {
    const ctx = document.getElementById('viewsChart')?.getContext('2d');
    if (!ctx) return;

    try {
        const q = query(collection(db, 'daily_stats'), orderBy('date', 'desc'), limit(7));
        const snap = await getDocs(q);
        const stats = snap.docs.map(d => d.data()).reverse();

        const labels = stats.length > 0 ? stats.map(s => s.date) : ['จุดเริ่มต้นข้อมูล'];
        const data = stats.length > 0 ? stats.map(s => s.views) : [0];

        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(251, 191, 36, 0.2)');
        gradient.addColorStop(1, 'rgba(251, 191, 36, 0)');

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'การเข้าชมรายวัน',
                    data: data,
                    borderColor: '#fbbf24',
                    borderWidth: 4,
                    pointBackgroundColor: '#fbbf24',
                    pointBorderColor: '#050507',
                    pointBorderWidth: 3,
                    pointRadius: 6,
                    pointHoverRadius: 10,
                    tension: 0.4,
                    fill: true,
                    backgroundColor: gradient
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#121218',
                        titleColor: '#fbbf24',
                        titleFont: { family: 'Kanit', size: 14, weight: 'bold' },
                        bodyFont: { family: 'Kanit', size: 13 },
                        padding: 16,
                        cornerRadius: 16,
                        borderColor: 'rgba(251,191,36,0.1)',
                        borderWidth: 1,
                        displayColors: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(255,255,255,0.02)', drawBorder: false },
                        ticks: { color: 'rgba(255,255,255,0.2)', font: { family: 'Montserrat', size: 10, weight: 'bold' } }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: 'rgba(255,255,255,0.2)', font: { family: 'Montserrat', size: 10, weight: 'bold' } }
                    }
                }
            }
        });
    } catch (err) {
        console.warn('Engagement Chart Index missing or permission denied.');
        if (typeof Chart !== 'undefined') {
            new Chart(ctx, {
                type: 'line',
                data: { labels: ['ไม่มีข้อมูล'], datasets: [{ data: [0], borderColor: '#333', fill: false }] },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
            });
        }
    }
}

async function fetchStats() {
    try {
        const moviesCol = collection(db, SCHEMA.COLLECTIONS.MOVIES);
        const seriesCol = collection(db, SCHEMA.COLLECTIONS.SERIES);
        
        const [movieViewsSnap, seriesViewsSnap, moviesCount, seriesCount, usersCount] = await Promise.all([
            getAggregateFromServer(moviesCol, { total: sum('views') }),
            getAggregateFromServer(seriesCol, { total: sum('views') }),
            getCountFromServer(moviesCol),
            getCountFromServer(seriesCol),
            getCountFromServer(collection(db, SCHEMA.COLLECTIONS.USERS))
        ]);

        const totalViews = (movieViewsSnap.data().total || 0) + (seriesViewsSnap.data().total || 0);
        const totalContent = moviesCount.data().count + seriesCount.data().count;

        UI.setCounter('stat-views', totalViews);
        UI.setCounter('stat-content', totalContent);
        UI.setCounter('stat-users', usersCount.data().count);

    } catch (err) { console.error(err); }
}

async function fetchRecentAssets(filterCat = 'ALL') {
    const container = document.getElementById('admin-asset-grid');
    if (!container) return;

    try {
        UI.renderSkeleton(container, 12);

        let mQuery = query(collection(db, SCHEMA.COLLECTIONS.MOVIES), orderBy('createdAt', 'desc'), limit(12));
        let sQuery = query(collection(db, SCHEMA.COLLECTIONS.SERIES), orderBy('createdAt', 'desc'), limit(12));

        if (filterCat !== 'ALL') {
            mQuery = query(collection(db, SCHEMA.COLLECTIONS.MOVIES), where('category', '==', filterCat), orderBy('createdAt', 'desc'), limit(12));
            sQuery = query(collection(db, SCHEMA.COLLECTIONS.SERIES), where('category', '==', filterCat), orderBy('createdAt', 'desc'), limit(12));
        }

        const [mSnap, sSnap] = await Promise.all([getDocs(mQuery), getDocs(sQuery)]);

        const getMillis = (ts) => {
            if (!ts) return 0;
            if (typeof ts.toMillis === 'function') return ts.toMillis();
            if (typeof ts.toDate === 'function') return ts.toDate().getTime();
            if (ts instanceof Date) return ts.getTime();
            if (typeof ts === 'number') return ts;
            if (ts.seconds) return ts.seconds * 1000 + Math.floor((ts.nanoseconds || 0) / 1000000);
            const parsed = Date.parse(ts);
            return isNaN(parsed) ? 0 : parsed;
        };

        let all = [
            ...mSnap.docs.map(d => ({ id: d.id, ...d.data(), type: 'movie' })),
            ...sSnap.docs.map(d => ({ id: d.id, ...d.data(), type: 'series' }))
        ]
        .sort((a, b) => getMillis(b.createdAt) - getMillis(a.createdAt))
        .slice(0, 12);

        if (all.length === 0) {
            UI.renderEmptyState(container, 'ไม่พบคอนเทนต์ในหมวดหมู่นี้');
            return;
        }

        container.innerHTML = all.map(data => UI.createAdminAssetCard(data)).join('');
        
        UI.refreshIcons();
    } catch (err) {
        console.error('Dashboard Feed Error:', err);
    }
}

document.addEventListener('DOMContentLoaded', init);
