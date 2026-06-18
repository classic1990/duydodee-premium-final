import {
    db,
    collection,
    getDocs,
    query,
    orderBy,
    limit,
    SCHEMA,
    getCountFromServer,
    getAggregateFromServer,
    sum,
    where,
    checkIsAdmin
} from '../services/firebase.js';
import { checkAdminAccess } from '../middleware/auth-guard.js';
import { UI } from '../components/ui.js';
import config from '../config/index.js';
import { injectAdminSidebar } from './sidebar-loader.js';
import { AuthService } from '../services/auth-service.js';

/**
 * 👑 DUYดูDEE EXECUTIVE DASHBOARD ENGINE
 * ปรับปรุงระบบให้โหลดแยกกันเพื่อป้องกันหน้าจอค้าง
 */

async function init() {
    UI.setLoading(true);
    try {
        // Admin access check using environment configuration
        const { user } = await checkAdminAccess();
        if (!config.isAdmin(user.email)) {
            // 🔒 SECURITY: Double check Google login
            if (!AuthService.isGoogleUser(user)) {
                console.error('🚨 Security Alert: Non-Google login attempt detected');
                // eslint-disable-next-line no-alert
                alert('🔒 ระบบความปลอดภัย: การเข้าถึงหน้าแอดมินต้องล็อกอินด้วย Google Account เท่านั้น');
                window.location.href = '/';
                return;
            }

            const isAdmin = await checkIsAdmin(user);
            if (!isAdmin) {
                console.error('Access Denied. Role is not Admin.');
                window.location.href = '/';
                return;
            }
        }

        UI.setupSidebar(user);
        await injectAdminSidebar();
        UI.initAdminSidebar();

        // 2. ปิดตัวโหลดหลักทันที แล้วให้แต่ละส่วนแยกกันโหลดเอง (แบบ Async)
        UI.setLoading(false);

        // 3. เริ่มโหลดข้อมูลแต่ละส่วน (ไม่ใช้ await Promise.all เพื่อไม่ให้ติดบล็อก)
        fetchStats().catch((e) => console.error('Stats Error:', e));
        fetchRecentAssets().catch((e) => console.error('Assets Error:', e));
        fetchRecentPayments().catch((e) => console.error('Payments Error:', e));
        initChart().catch((e) => console.error('Chart Error:', e));
        initTopContentChart().catch((e) => console.error('Top Chart Error:', e));

        setupFilter();
        UI.refreshIcons();
    } catch (err) {
        console.error('Dashboard Init Failed:', err);
        UI.setLoading(false);
        UI.showToast('การเชื่อมต่อล้มเหลว โปรดตรวจสอบสิทธิ์', 'error');
    }
}

async function fetchRecentPayments() {
    const container = document.getElementById('vip-payment-list');
    if (!container) {
        return;
    }

    try {
        const q = query(collection(db, SCHEMA.COLLECTIONS.VIP_PAYMENTS), orderBy('createdAt', 'desc'), limit(5));
        const snap = await getDocs(q);

        if (snap.empty) {
            container.innerHTML = '<tr><td colspan="4" class="p-4 text-center text-gray-500 text-xs">ไม่มีรายการใหม่</td></tr>';
            return;
        }

        container.innerHTML = snap.docs.map(d => {
            const data = d.data();
            const isConfirmed = data.status === 'confirmed';
            return `
            <tr>
                <td class="p-4 text-xs font-bold text-white">${UI.escapeHTML(data.senderName || 'ไม่ระบุชื่อ')}</td>
                <td class="p-4 text-center text-xs text-brand-primary">฿${(data.amount || 0).toLocaleString()}</td>
                <td class="p-4 text-center"><span class="px-2 py-1 rounded text-[9px] font-black ${isConfirmed ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}">${isConfirmed ? 'ยืนยันแล้ว' : 'รอตรวจสอบ'}</span></td>
                <td class="p-4 text-right">
                    <button onclick="window.location.href='/admin/admin-vip-payments.html'" class="btn-primary !py-1.5 !px-3 !text-[9px]">ตรวจสอบ</button>
                </td>
            </tr>`;
        }).join('');
    } catch (e) {
        console.error('Payments Fetch Error:', e);
        // Handle permissions error specifically
        if (e.code === 'permission-denied' || e.message.includes('Missing or insufficient permissions')) {
            container.innerHTML = '<tr><td colspan="4" class="p-4 text-center text-red-500 text-xs">❌ ไม่มีสิทธิ์เข้าถึงข้อมูล - กรุณาตรวจสอบสิทธิ์ Admin</td></tr>';
            UI.showToast('ไม่มีสิทธิ์เข้าถึงข้อมูลการชำระเงิน', 'error');
        } else {
            container.innerHTML = '<tr><td colspan="4" class="p-4 text-center text-red-500 text-xs">❌ เกิดข้อผิดพลาดในการโหลดข้อมูล</td></tr>';
        }
    }
}

function setupFilter() {
    const filter = document.getElementById('category-filter');
    if (!filter) {
        return;
    }
    filter.onchange = (e) => fetchRecentAssets(e.target.value);
}

async function initTopContentChart() {
    const ctx = document.getElementById('topContentChart')?.getContext('2d');
    if (!ctx) {
        return;
    }

    try {
        // ดึงข้อมูล 10 อันดับแรก
        const [mSnap, sSnap] = await Promise.all([
            getDocs(
                query(
                    collection(db, SCHEMA.COLLECTIONS.MOVIES),
                    orderBy('views', 'desc'),
                    limit(10)
                )
            ),
            getDocs(
                query(
                    collection(db, SCHEMA.COLLECTIONS.SERIES),
                    orderBy('views', 'desc'),
                    limit(10)
                )
            )
        ]);

        const all = [
            ...mSnap.docs.map((d) => ({
                title: d.data().title,
                views: d.data().views
            })),
            ...sSnap.docs.map((d) => ({
                title: d.data().title,
                views: d.data().views
            }))
        ]
            .sort((a, b) => b.views - a.views)
            .slice(0, 10);

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: all.map(
                    (i) => i.title.substring(0, 15) + (i.title.length > 15 ? '...' : '')
                ),
                datasets: [
                    {
                        label: 'จำนวนการเข้าชม',
                        data: all.map((i) => i.views),
                        backgroundColor: 'rgba(59, 130, 246, 0.4)',
                        borderColor: '#3b82f6',
                        borderWidth: 2,
                        borderRadius: 8,
                        hoverBackgroundColor: '#3b82f6'
                    }
                ]
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
                        ticks: {
                            color: 'rgba(255,255,255,0.3)',
                            font: { size: 9, family: 'Montserrat' }
                        }
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
            data: {
                labels: ['ไม่มีข้อมูล'],
                datasets: [{ data: [0], backgroundColor: '#333' }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } }
            }
        });
    }
}

async function initChart() {
    const ctx = document.getElementById('viewsChart')?.getContext('2d');
    if (!ctx) {
        return;
    }

    try {
        const q = query(
            collection(db, 'daily_stats'),
            orderBy('date', 'desc'),
            limit(7)
        );
        const snap = await getDocs(q);
        const stats = snap.docs.map((d) => d.data()).reverse();

        const labels =
            stats.length > 0 ? stats.map((s) => s.date) : ['จุดเริ่มต้นข้อมูล'];
        const data = stats.length > 0 ? stats.map((s) => s.views) : [0];

        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(251, 191, 36, 0.2)');
        gradient.addColorStop(1, 'rgba(251, 191, 36, 0)');

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
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
                    }
                ]
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
                        ticks: {
                            color: 'rgba(255,255,255,0.2)',
                            font: { family: 'Montserrat', size: 10, weight: 'bold' }
                        }
                    },
                    x: {
                        grid: { display: false },
                        ticks: {
                            color: 'rgba(255,255,255,0.2)',
                            font: { family: 'Montserrat', size: 10, weight: 'bold' }
                        }
                    }
                }
            }
        });
    } catch (err) {
        console.warn('Engagement Chart Index missing or permission denied.');
        if (typeof Chart !== 'undefined') {
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['ไม่มีข้อมูล'],
                    datasets: [{ data: [0], borderColor: '#333', fill: false }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } }
                }
            });
        }
    }
}

async function fetchStats() {
    try {
        const moviesCol = collection(db, SCHEMA.COLLECTIONS.MOVIES);
        const seriesCol = collection(db, SCHEMA.COLLECTIONS.SERIES);

        const [
            movieViewsSnap,
            seriesViewsSnap,
            moviesCount,
            seriesCount,
            usersCount
        ] = await Promise.all([
            getAggregateFromServer(moviesCol, { total: sum('views') }),
            getAggregateFromServer(seriesCol, { total: sum('views') }),
            getCountFromServer(moviesCol),
            getCountFromServer(seriesCol),
            getCountFromServer(collection(db, SCHEMA.COLLECTIONS.USERS))
        ]);

        const totalViews =
            (movieViewsSnap.data().total || 0) + (seriesViewsSnap.data().total || 0);
        const totalContent = moviesCount.data().count + seriesCount.data().count;

        UI.setCounter('stat-views', totalViews);
        UI.setCounter('stat-content', totalContent);
        UI.setCounter('stat-users', usersCount.data().count);
    } catch (err) {
        console.error('Stats Fetch Error:', err);
        // Provide fallback indicator for failed stats
        UI.setCounter('stat-views', '-');
        UI.setCounter('stat-content', '-');
        UI.setCounter('stat-users', '-');
    }
}

async function fetchRecentAssets(filterCat = 'ALL') {
    const container = document.getElementById('admin-asset-grid');
    if (!container) {
        return;
    }

    try {
        UI.renderSkeleton(container, 12);

        let mQuery = query(
            collection(db, SCHEMA.COLLECTIONS.MOVIES),
            orderBy('createdAt', 'desc'),
            limit(12)
        );
        let sQuery = query(
            collection(db, SCHEMA.COLLECTIONS.SERIES),
            orderBy('createdAt', 'desc'),
            limit(12)
        );

        if (filterCat !== 'ALL') {
            mQuery = query(
                collection(db, SCHEMA.COLLECTIONS.MOVIES),
                where('category', '==', filterCat),
                orderBy('createdAt', 'desc'),
                limit(12)
            );
            sQuery = query(
                collection(db, SCHEMA.COLLECTIONS.SERIES),
                where('category', '==', filterCat),
                orderBy('createdAt', 'desc'),
                limit(12)
            );
        }

        const [mSnap, sSnap] = await Promise.all([
            getDocs(mQuery),
            getDocs(sQuery)
        ]);

        const getMillis = (ts) => {
            if (!ts) {
                return 0;
            }
            if (typeof ts.toMillis === 'function') {
                return ts.toMillis();
            }
            if (typeof ts.toDate === 'function') {
                return ts.toDate().getTime();
            }
            if (ts instanceof Date) {
                return ts.getTime();
            }
            if (typeof ts === 'number') {
                return ts;
            }
            if (ts.seconds) {
                return ts.seconds * 1000 + Math.floor((ts.nanoseconds || 0) / 1000000);
            }
            const parsed = Date.parse(ts);
            return isNaN(parsed) ? 0 : parsed;
        };

        const all = [
            ...mSnap.docs.map((d) => ({ id: d.id, ...d.data(), type: 'movie' })),
            ...sSnap.docs.map((d) => ({ id: d.id, ...d.data(), type: 'series' }))
        ]
            .sort((a, b) => getMillis(b.createdAt) - getMillis(a.createdAt))
            .slice(0, 12);

        if (all.length === 0) {
            UI.renderEmptyState(container, 'ไม่พบคอนเทนต์ในหมวดหมู่นี้');
            return;
        }

        container.innerHTML = all
            .map((data) => UI.createAdminAssetCard(data))
            .join('');

        UI.refreshIcons();
    } catch (err) {
        console.error('Dashboard Feed Error:', err);
        // Handle permission errors for content view
        const isPermissionError = err.code === 'permission-denied' || err.message?.includes('permissions');
        container.innerHTML = `<div class="col-span-full py-12 text-center Thai-font">
            <p class="text-red-500 text-xs font-bold">${isPermissionError ? '❌ ไม่มีสิทธิ์เข้าถึงข้อมูลคอนเทนต์' : '❌ เกิดข้อผิดพลาดในการโหลดข้อมูล'}</p>
            <button onclick="location.reload()" class="mt-4 text-[10px] text-gray-500 underline uppercase tracking-widest">ลองใหม่อีกครั้ง</button>
        </div>`;
    }
}

/**
 * 🏆 Render the top 3 content podium (Hall of Fame)
 */
async function _renderRankingPodium() {
    try {
        const [mSnap, sSnap] = await Promise.all([
            getDocs(query(collection(db, SCHEMA.COLLECTIONS.MOVIES), orderBy('views', 'desc'), limit(3))),
            getDocs(query(collection(db, SCHEMA.COLLECTIONS.SERIES), orderBy('views', 'desc'), limit(3)))
        ]);

        const all = [
            ...mSnap.docs.map(d => ({ ...d.data(), id: d.id })),
            ...sSnap.docs.map(d => ({ ...d.data(), id: d.id }))
        ]
            .sort((a, b) => (b.views || 0) - (a.views || 0))
            .slice(0, 3);

        // Map positions (1st is index 0, 2nd is index 1, 3rd is index 2)
        const positions = [
            { poster: 'rank-1-poster', title: 'rank-1-title' },
            { poster: 'rank-2-poster', title: 'rank-2-title' },
            { poster: 'rank-3-poster', title: 'rank-3-title' }
        ];

        all.forEach((item, index) => {
            const pos = positions[index];
            const posterEl = document.getElementById(pos.poster);
            const titleEl = document.getElementById(pos.title);

            if (posterEl) {
                const img = posterEl.querySelector('img');
                if (img) {
                    img.src = item.poster || item.posterURL || '/assets/logo/DUYDODEE.png';
                }
            }
            if (titleEl) {
                titleEl.innerText = item.title;
            }
        });
    } catch (error) {
        console.error('Podium Render Error:', error);
    }
}

document.addEventListener('DOMContentLoaded', init);
