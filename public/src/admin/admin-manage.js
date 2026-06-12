// 💠 Admin Dashboard - admin-manage.js
import { checkAdminAccess } from '/src/middleware/auth-guard.js';
import { db, collection, getDocs, query, orderBy, limit } from '/src/services/firebase.js';
import { AdminSidebar } from '/src/components/admin-sidebar.js';

const ITEMS_PER_PAGE = 24;
let allContent = [];
let filteredContent = [];

// ─── Fetch Stats ──────────────────────────────────────────────────────────────
async function fetchStats() {
    const [usersSnap, moviesSnap, seriesSnap] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'movies')),
        getDocs(collection(db, 'series'))
    ]);

    const totalContent = moviesSnap.size + seriesSnap.size;
    let totalViews = 0;
    moviesSnap.forEach(d => { totalViews += (d.data().views || 0); });
    seriesSnap.forEach(d => { totalViews += (d.data().views || 0); });

    animateCount('stat-views', totalViews);
    animateCount('stat-content', totalContent);
    animateCount('stat-users', usersSnap.size);
    animateCount('user-count', usersSnap.size);

    return { moviesSnap, seriesSnap };
}

function animateCount(id, target) {
    const el = document.getElementById(id);
    if (!el) return;
    let current = 0;
    const step = Math.ceil(target / 40);
    const timer = setInterval(() => {
        current = Math.min(current + step, target);
        el.textContent = current.toLocaleString('th-TH');
        if (current >= target) clearInterval(timer);
    }, 30);
}

// ─── Charts ───────────────────────────────────────────────────────────────────
function renderCharts(moviesSnap, seriesSnap) {
    if (!window.Chart) return;
    Chart.defaults.color = 'rgba(156,163,175,0.8)';
    Chart.defaults.borderColor = 'rgba(255,255,255,0.04)';

    // Views line chart - simulated weekly data
    const viewsCtx = document.getElementById('viewsChart');
    if (viewsCtx) {
        const labels = ['จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส', 'อา'];
        const data = [120, 190, 150, 280, 220, 340, 290].map(v => Math.floor(v * (0.8 + Math.random() * 0.4)));
        new Chart(viewsCtx, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    data,
                    borderColor: '#FBBF24',
                    backgroundColor: 'rgba(251,191,36,0.08)',
                    borderWidth: 2,
                    pointBackgroundColor: '#FBBF24',
                    pointRadius: 4,
                    tension: 0.4,
                    fill: true
                }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { grid: { color: 'rgba(255,255,255,0.04)' } }, x: { grid: { display: false } } } }
        });
    }

    // Top 10 bar chart
    const topCtx = document.getElementById('topContentChart');
    if (topCtx) {
        const items = [];
        moviesSnap.forEach(d => items.push({ title: d.data().title || 'ไม่มีชื่อ', views: d.data().views || 0 }));
        seriesSnap.forEach(d => items.push({ title: d.data().title || 'ไม่มีชื่อ', views: d.data().views || 0 }));
        items.sort((a, b) => b.views - a.views);
        const top10 = items.slice(0, 10);
        new Chart(topCtx, {
            type: 'bar',
            data: {
                labels: top10.map(i => i.title.substring(0, 12) + (i.title.length > 12 ? '…' : '')),
                datasets: [{
                    data: top10.map(i => i.views),
                    backgroundColor: 'rgba(251,191,36,0.6)',
                    borderColor: '#FBBF24',
                    borderWidth: 1,
                    borderRadius: 6
                }]
            },
            options: { responsive: true, maintainAspectRatio: false, indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { grid: { color: 'rgba(255,255,255,0.04)' } }, y: { grid: { display: false }, ticks: { font: { size: 10 } } } } }
        });
    }
}

// ─── Content Grid ─────────────────────────────────────────────────────────────
function buildContentList(moviesSnap, seriesSnap) {
    allContent = [];
    moviesSnap.forEach(d => allContent.push({ id: d.id, type: 'movie', ...d.data() }));
    seriesSnap.forEach(d => allContent.push({ id: d.id, type: 'series', ...d.data() }));
    allContent.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    filteredContent = [...allContent];
    renderGrid();
}

function renderGrid() {
    const grid = document.getElementById('admin-asset-grid');
    if (!grid) return;
    if (!filteredContent.length) {
        grid.innerHTML = `<div class="col-span-full flex flex-col items-center justify-center py-24 text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-16 h-16 mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"/></svg>
            <p class="text-sm font-black Thai-font">ไม่พบเนื้อหาในระบบ</p></div>`;
        return;
    }
    grid.innerHTML = filteredContent.map(item => {
        const thumb = item.poster || '';
        const editUrl = item.type === 'movie' ? `/admin/admin-edit-movie.html?id=${item.id}` : `/admin/admin-edit-series.html?id=${item.id}`;
        return `
        <div class="group relative rounded-2xl overflow-hidden bg-white/[0.02] border border-white/5 hover:border-brand-primary/30 transition-all cursor-pointer" onclick="location.href='${editUrl}'">
            <div class="aspect-[9/14] relative overflow-hidden bg-black/40">
                ${thumb ? `<img src="${thumb}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" onerror="this.style.display='none'">` : ''}
                <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                <span class="absolute top-2 right-2 text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${item.type === 'movie' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/20' : 'bg-purple-500/20 text-purple-400 border border-purple-500/20'}">
                    ${item.type === 'movie' ? 'หนัง' : 'ซีรีส์'}
                </span>
                <div class="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity flex justify-center">
                    <a href="${editUrl}" class="px-3 py-1.5 bg-brand-primary text-black text-[8px] font-black uppercase tracking-widest rounded-lg">แก้ไข</a>
                </div>
            </div>
            <div class="p-3">
                <p class="text-[10px] font-black text-white truncate Thai-font">${item.title || 'ไม่มีชื่อ'}</p>
                <p class="text-[9px] text-gray-600 truncate Thai-font mt-0.5">${item.category || ''}</p>
            </div>
        </div>`;
    }).join('');
    if (window.lucide) window.lucide.createIcons();
}

// ─── Filter ───────────────────────────────────────────────────────────────────
function initFilter() {
    const select = document.getElementById('category-filter');
    if (!select) return;
    select.addEventListener('change', () => {
        const val = select.value;
        filteredContent = val === 'ALL' ? [...allContent] : allContent.filter(i => i.category === val);
        renderGrid();
    });
}

// ─── Main Init ────────────────────────────────────────────────────────────────
async function init() {
    initFilter();

    try {
        const { user } = await checkAdminAccess();
        AdminSidebar.render(user);
        const { moviesSnap, seriesSnap } = await fetchStats();
        renderCharts(moviesSnap, seriesSnap);
        buildContentList(moviesSnap, seriesSnap);
    } catch (err) {
        console.error('[admin-manage] Access Denied or Error:', err);
        window.location.replace('/login.html');
    }
}

document.addEventListener('DOMContentLoaded', init);
