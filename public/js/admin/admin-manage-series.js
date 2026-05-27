import { db, collection, getDocs, doc, deleteDoc, query, orderBy, limit, startAfter, getCountFromServer, SCHEMA, getMediaWatchPath } from '/js/services/firebase.js';
import { UI } from '/js/components/ui.js';
import { checkAdminAccess } from '/js/middleware/auth-guard.js';

/**
 * 📺 DUYดูDEE SERIES MANAGEMENT ENGINE
 * ระบบจัดการซีรีส์ (แบบตอน) แบบมืออาชีพ
 */

const PAGE_SIZE = 10;
let currentPage = 1;
let cursors = [null]; 
let totalSeries = 0;
let allSeriesCache = []; 
let isSearchMode = false;

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const { user } = await checkAdminAccess();
        UI.setupSidebar(user);
        UI.initAdminSidebar();
        initManageSeries();
    } catch (err) {
        console.error('Access Denied:', err);
    }
});

async function initManageSeries() {
    UI.setLoading(true);
    await updateSeriesCount();
    loadSeries();
    
    const searchInput = document.getElementById('series-search');
    if (searchInput) {
        searchInput.addEventListener('input', UI.debounce((e) => {
            handleSearch(e.target.value.toLowerCase().trim());
        }, 400));
    }
}

async function updateSeriesCount() {
    try {
        const countSnap = await getCountFromServer(collection(db, SCHEMA.COLLECTIONS.SERIES));
        totalSeries = countSnap.data().count;
    } catch (e) { console.error('Count failed:', e); }
}

async function loadSeries() {
    if (isSearchMode) return;
    
    const tableBody = document.getElementById('series-full-list');
    if (!tableBody) return;

    tableBody.innerHTML = '<tr><td colspan="5" class="py-20 text-center Thai-font"><div class="inline-block w-8 h-8 border-2 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin"></div><p class="mt-4 text-[10px] text-gray-500 uppercase tracking-widest animate-pulse">กำลังดึงข้อมูลจากศูนย์ควบคุม</p></td></tr>';

    try {
        const cursor = cursors[currentPage - 1];
        let q = query(collection(db, SCHEMA.COLLECTIONS.SERIES), orderBy('createdAt', 'desc'), limit(PAGE_SIZE));
        if (cursor) q = query(q, startAfter(cursor));

        const snap = await getDocs(q);
        
        if (!snap.empty) {
            cursors[currentPage] = snap.docs[snap.docs.length - 1];
            renderSeries(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            updatePaginationUI();
        } else if (currentPage > 1) {
            currentPage--;
            loadSeries();
        } else {
            renderSeries([]);
        }
    } catch (error) {
        console.error('Error loading series:', error);
        UI.showToast('เกิดข้อผิดพลาดในการโหลดข้อมูล', 'error');
        tableBody.innerHTML = '<tr><td colspan="5" class="py-10 text-center text-red-500 Thai-font text-xs">ไม่สามารถเชื่อมต่อฐานข้อมูลได้</td></tr>';
    } finally {
        UI.setLoading(false);
    }
}

async function handleSearch(term) {
    const tableBody = document.getElementById('series-full-list');
    const pagContainer = document.getElementById('pagination-container');

    if (!term) {
        isSearchMode = false;
        pagContainer?.classList.remove('hidden');
        loadSeries();
        return;
    }

    isSearchMode = true;
    pagContainer?.classList.add('hidden');
    tableBody.innerHTML = '<tr><td colspan="5" class="py-10 text-center text-brand-primary Thai-font text-xs animate-pulse">กำลังค้นหาในคลังซีรีส์...</td></tr>';

    try {
        if (allSeriesCache.length === 0) {
            const snap = await getDocs(query(collection(db, SCHEMA.COLLECTIONS.SERIES), limit(500)));
            allSeriesCache = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        }

        const filtered = allSeriesCache.filter(s => 
            s.title?.toLowerCase().includes(term) || 
            s.category?.toLowerCase().includes(term) ||
            s.id.toLowerCase().includes(term)
        );

        renderSeries(filtered);
    } catch (e) {
        console.error('Search failed:', e);
        UI.showToast('การค้นหาล้มเหลว', 'error');
    }
}

function renderSeries(seriesList) {
    const tableBody = document.getElementById('series-full-list');
    if (!tableBody) return;

    if (seriesList.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" class="py-24 text-center animate-fade-in opacity-40">
            <div class="flex flex-col items-center gap-6">
                <div class="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                    <i data-lucide="tv" class="w-10 h-10 text-gray-500"></i>
                </div>
                <p class="text-sm font-black text-gray-500 uppercase tracking-[0.4em] Thai-font">ไม่มีข้อมูลซีรีส์ในระบบ</p>
            </div>
        </td></tr>`;
        UI.refreshIcons();
        return;
    }

    tableBody.innerHTML = seriesList.map(series => `
        <tr class="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
            <td class="py-4 text-center">
                <div class="relative inline-block">
                    <img src="${UI.getSafePoster(series.poster)}" 
                         class="w-10 h-14 object-cover rounded-lg border border-white/10 shadow-lg group-hover:scale-105 transition-transform" 
                         alt="${UI.escapeHTML(series.title)}"
                         onerror="this.src='/assets/logo/DUYDODEE.png';">
                </div>
            </td>
            <td class="py-4">
                <div class="flex flex-col gap-0.5">
                    <span class="font-bold text-white Thai-font text-sm group-hover:text-brand-primary transition-colors">${UI.escapeHTML(series.title)}</span>
                    <div class="flex items-center gap-2">
                        <span class="text-[8px] px-1.5 py-0.5 bg-brand-primary/10 text-brand-primary rounded font-black border border-brand-primary/20 uppercase tracking-tighter Thai-font">${series.category || 'ซีรีส์'}</span>
                        <span class="text-[8px] text-gray-600 uppercase font-bold tracking-widest opacity-50">${series.id}</span>
                    </div>
                </div>
            </td>
            <td class="py-4 text-center">
                <span class="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] font-black text-gray-400 Thai-font uppercase tracking-widest">
                    ${series.episodeCount || 0} ตอน
                </span>
            </td>
            <td class="py-4 text-center">
                <div class="flex flex-col items-center">
                    <span class="text-xs font-black text-white">${(series.views || 0).toLocaleString()}</span>
                    <span class="text-[8px] font-black text-gray-600 uppercase tracking-widest opacity-40 Thai-font">ยอดเข้าชม</span>
                </div>
            </td>
            <td class="py-4 text-right px-10">
                <div class="flex items-center justify-end gap-2.5">
                    <button onclick="window.open('${getMediaWatchPath(series.category, 'series', series.id)}', '_blank')"
                       class="w-8 h-8 flex items-center justify-center rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white transition-all border border-green-500/20"
                       title="ดูตัวอย่าง">
                        <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
                    </button>
                    <a href="./admin-edit-series.html?id=${series.id}" 
                       class="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-all border border-blue-500/20"
                       title="แก้ไขข้อมูล">
                        <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
                    </a>
                    <button onclick="deleteSeries('${series.id}')" 
                            class="w-8 h-8 flex items-center justify-center rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
                            title="ลบซีรีส์">
                        <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');

    UI.refreshIcons();
}

function updatePaginationUI() {
    const container = document.getElementById('pagination-container');
    if (!container || isSearchMode) {
        if(container) container.innerHTML = '';
        return;
    }

    const totalPages = Math.ceil(totalSeries / PAGE_SIZE) || 1;
    
    container.innerHTML = `
        <div class="flex items-center gap-6 bg-black/20 p-2 px-6 rounded-2xl border border-white/5 backdrop-blur-md">
            <button id="prev-btn" class="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-brand-primary hover:border-brand-primary/50 transition-all disabled:opacity-20 disabled:pointer-events-none" ${currentPage === 1 ? 'disabled' : ''}>
                <i data-lucide="chevron-left" class="w-5 h-5"></i>
            </button>
            
            <div class="flex flex-col items-center">
                <span class="text-[10px] font-black text-white tracking-widest uppercase Thai-font">หน้า ${currentPage} / ${totalPages}</span>
                <span class="text-[8px] font-bold text-gray-600 uppercase tracking-tighter Thai-font">ทั้งหมด ${totalSeries} เรื่อง</span>
            </div>

            <button id="next-btn" class="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-brand-primary hover:border-brand-primary/50 transition-all disabled:opacity-20 disabled:pointer-events-none" ${currentPage >= totalPages ? 'disabled' : ''}>
                <i data-lucide="chevron-right" class="w-5 h-5"></i>
            </button>
        </div>
    `;

    document.getElementById('prev-btn')?.addEventListener('click', () => { if (currentPage > 1) { currentPage--; loadSeries(); } });
    document.getElementById('next-btn')?.addEventListener('click', () => { currentPage++; loadSeries(); });
    UI.refreshIcons();
}

window.deleteSeries = async (id) => {
    if (!confirm('ยืนยันการลบซีรีส์ชุดนี้และตอนทั้งหมดที่เกี่ยวข้อง? การกระทำนี้ไม่สามารถย้อนคืนได้')) return;

    UI.setLoading(true);
    try {
        await deleteDoc(doc(db, SCHEMA.COLLECTIONS.SERIES, id));
        UI.showToast('ลบซีรีส์เรียบร้อยแล้ว', 'success');
        
        await updateSeriesCount();
        loadSeries();
    } catch (error) {
        console.error('Error deleting series:', error);
        UI.showToast('ไม่สามารถลบข้อมูลได้', 'error');
    } finally {
        UI.setLoading(false);
    }
};
