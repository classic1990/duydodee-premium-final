// 💠 Admin Manage Series - admin-manage-series.js
import { db, collection, getDocs, doc, deleteDoc, orderBy, query, logActivity } from '/src/services/firebase.js';
import { checkAdminAccess } from '/src/middleware/auth-guard.js';
import { UI } from '/src/components/ui.js';

const PAGE_SIZE = 15;
let allSeries = [];
let filtered = [];
let currentPage = 1;

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function initSidebar() {
    const toggleBtn = document.getElementById('sidebar-toggle-btn');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('admin-overlay');
    if (!toggleBtn || !sidebar) return;
    const open = () => { sidebar.classList.remove('-translate-x-full'); overlay?.classList.remove('hidden'); };
    const close = () => { sidebar.classList.add('-translate-x-full'); overlay?.classList.add('hidden'); };
    toggleBtn.addEventListener('click', () => sidebar.classList.contains('-translate-x-full') ? open() : close());
    overlay?.addEventListener('click', close);
}

// ─── Fetch ────────────────────────────────────────────────────────────────────
async function fetchSeries() {
    const snap = await getDocs(query(collection(db, 'series'), orderBy('createdAt', 'desc')));
    allSeries = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    filtered = [...allSeries];
}

// ─── Render ───────────────────────────────────────────────────────────────────
function getThumb(series) {
    if (series.poster) return series.poster;
    return '';
}

function renderTable() {
    const tbody = document.getElementById('series-full-list');
    if (!tbody) return;

    const start = (currentPage - 1) * PAGE_SIZE;
    const page = filtered.slice(start, start + PAGE_SIZE);

    if (!filtered.length) {
        tbody.innerHTML = '<tr><td colspan="5" class="p-12 text-center text-gray-600 Thai-font text-sm">ไม่พบซีรีส์ในระบบ</td></tr>';
        return;
    }

    tbody.innerHTML = page.map(series => {
        const thumb = getThumb(series);
        const views = (series.views || 0).toLocaleString('th-TH');
        const epCount = series.episodes?.length || 0;
        return `
        <tr class="group hover:bg-white/[0.02] transition-colors">
            <td class="p-4 text-center">
                <div class="w-16 h-24 rounded-xl overflow-hidden bg-black/40 mx-auto border border-white/5">
                    ${thumb ? `<img src="${thumb}" class="w-full h-full object-cover" loading="lazy" onerror="this.src=''; this.className='hidden'" alt="${series.title || 'ปกซีรีส์'}">` : '<div class="w-full h-full flex items-center justify-center text-gray-700"><i data-lucide="tv" class="w-6 h-6"></i></div>'}
                </div>
            </td>
            <td class="p-4">
                <p class="text-sm font-black text-white Thai-font">${series.title || '(ไม่มีชื่อ)'}</p>
                <p class="text-[10px] text-gray-500 Thai-font mt-1">${series.category || ''}</p>
                <p class="text-[9px] text-gray-700 mt-1 font-mono">${series.id}</p>
            </td>
            <td class="p-4 text-center">
                <div class="flex flex-col items-center">
                    <span class="text-xl font-black text-white">${epCount}</span>
                    <span class="text-[9px] text-gray-500 Thai-font uppercase tracking-widest">ตอน</span>
                </div>
            </td>
            <td class="p-4 text-center">
                <span class="text-sm font-black text-white">${views}</span>
                <span class="text-[9px] text-gray-600 ml-1 Thai-font">ครั้ง</span>
            </td>
            <td class="p-4 text-right">
                <div class="flex items-center justify-end gap-2">
                    <a href="/admin/admin-edit-series.html?id=${series.id}" class="px-4 py-2 text-[10px] font-black text-white bg-white/5 border border-white/10 rounded-xl hover:bg-brand-primary hover:text-black hover:border-brand-primary transition-all uppercase tracking-widest Thai-font flex items-center gap-1.5">
                        <i data-lucide="pencil" class="w-3 h-3"></i> แก้ไข
                    </a>
                    <button onclick="confirmDelete('${series.id}', '${(series.title || '').replace(/'/g, '\\\'')}')" class="px-4 py-2 text-[10px] font-black text-red-500 bg-red-500/5 border border-red-500/10 rounded-xl hover:bg-red-500 hover:text-white hover:border-red-500 transition-all uppercase tracking-widest Thai-font flex items-center gap-1.5">
                        <i data-lucide="trash-2" class="w-3 h-3"></i> ลบ
                    </button>
                </div>
            </td>
        </tr>`;
    }).join('');
    if (window.lucide) window.lucide.createIcons();
    renderPagination();
}

function renderPagination() {
    const container = document.getElementById('pagination-container');
    if (!container) return;
    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    if (totalPages <= 1) { container.innerHTML = ''; return; }

    let html = '';
    for (let i = 1; i <= totalPages; i++) {
        html += `<button onclick="goToPage(${i})" class="w-10 h-10 rounded-xl text-xs font-black transition-all ${i === currentPage ? 'bg-brand-primary text-black' : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'}">${i}</button>`;
    }
    container.innerHTML = html;
}

// ─── Search ───────────────────────────────────────────────────────────────────
function initSearch() {
    const input = document.getElementById('series-search');
    if (!input) return;
    input.addEventListener('input', () => {
        const q = input.value.toLowerCase().trim();
        filtered = q ? allSeries.filter(s => (s.title || '').toLowerCase().includes(q) || (s.category || '').toLowerCase().includes(q) || s.id.toLowerCase().includes(q)) : [...allSeries];
        currentPage = 1;
        renderTable();
    });
}

// ─── Delete ───────────────────────────────────────────────────────────────────
window.confirmDelete = function (id, title) {
    if (!confirm(`ยืนยันการลบ "${title}"?\n\nการกระทำนี้ไม่สามารถย้อนคืนได้`)) return;
    deleteDoc(doc(db, 'series', id)).then(() => {
        logActivity('DELETE_SERIES', { id, title });
        UI.showToast('ลบซีรีส์เรียบร้อยแล้ว', 'success');
        allSeries = allSeries.filter(s => s.id !== id);
        filtered = filtered.filter(s => s.id !== id);
        renderTable();
    }).catch(err => {
        console.error('Delete error:', err);
        UI.showToast('เกิดข้อผิดพลาดในการลบ: ' + err.message, 'error');
    });
};

window.goToPage = function (page) {
    currentPage = page;
    renderTable();
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// ─── Main ─────────────────────────────────────────────────────────────────────
async function init() {
    initSidebar();
    try {
        await checkAdminAccess();
        await fetchSeries();
        initSearch();
        renderTable();
    } catch (err) {
        console.error('[admin-manage-series] Access Denied:', err);
        window.location.replace('/login.html');
    }
}

document.addEventListener('DOMContentLoaded', init);
