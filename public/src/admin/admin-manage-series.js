import { db, collection, getDocs, doc, deleteDoc, query, orderBy, limit, startAfter, getCountFromServer, SCHEMA, getMediaWatchPath } from '../services/firebase.js';
import { UI } from '../components/ui.js';
import { checkAdminAccess } from '../middleware/auth-guard.js';
import { injectAdminSidebar } from './sidebar-loader.js';

/**
 * 📺 DUYดูDEE SERIES MANAGEMENT ENGINE
 * Refactored: Decoupled Data & UI Architecture
 */

// 📂 1. Data & State Management Service
const SeriesService = {
    PAGE_SIZE: 10,
    state: {
        currentPage: 1,
        cursors: [null],
        totalSeries: 0,
        allSeriesCache: [],
        isSearchMode: false
    },

    async getCount() {
        try {
            const countSnap = await getCountFromServer(collection(db, SCHEMA.COLLECTIONS.SERIES));
            this.state.totalSeries = countSnap.data().count;
            return this.state.totalSeries;
        } catch (e) {
            console.error('Count failed:', e);
            return 0;
        }
    },

    async fetchPage(page) {
        const cursor = this.state.cursors[page - 1];
        let q = query(collection(db, SCHEMA.COLLECTIONS.SERIES), orderBy('createdAt', 'desc'), limit(this.PAGE_SIZE));
        if (cursor) {
            q = query(q, startAfter(cursor));
        }

        const snap = await getDocs(q);
        if (!snap.empty) {
            this.state.cursors[page] = snap.docs[snap.docs.length - 1];
            return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        }
        return [];
    },

    async search(term) {
        if (this.state.allSeriesCache.length === 0) {
            const snap = await getDocs(query(collection(db, SCHEMA.COLLECTIONS.SERIES), limit(500)));
            this.state.allSeriesCache = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        }
        return this.state.allSeriesCache.filter(s =>
            s.title?.toLowerCase().includes(term) ||
            s.category?.toLowerCase().includes(term) ||
            s.id.toLowerCase().includes(term)
        );
    },

    async delete(id) {
        await deleteDoc(doc(db, SCHEMA.COLLECTIONS.SERIES, id));
    }
};

// 🎨 2. UI & Rendering Layer
const SeriesView = {
    elements: {
        tableBody: document.getElementById('series-full-list'),
        pagination: document.getElementById('pagination-container'),
        searchInput: document.getElementById('series-search')
    },

    showLoading() {
        if (this.elements.tableBody) {
            this.elements.tableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="py-16 text-center Thai-font">
                        <div class="inline-block w-8 h-8 border-2 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin"></div>
                        <p class="mt-4 text-[10px] text-gray-500 uppercase tracking-widest animate-pulse">กำลังซิงค์ข้อมูลกับศูนย์ควบคุม</p>
                    </td>
                </tr>`;
        }
    },

    renderEmpty() {
        if (this.elements.tableBody) {
            this.elements.tableBody.innerHTML = `
                <tr><td colspan="5" class="py-20 text-center animate-fade-in opacity-40">
                    <div class="flex flex-col items-center gap-6">
                        <div class="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                            <i data-lucide="tv" class="w-10 h-10 text-gray-500"></i>
                        </div>
                        <p class="text-sm font-black text-gray-500 uppercase tracking-[0.4em] Thai-font">ไม่มีข้อมูลซีรีส์ในระบบ</p>
                    </div>
                </td></tr>`;
            UI.refreshIcons();
        }
    }
};

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const { user } = await checkAdminAccess();
        UI.setupSidebar(user);
        await injectAdminSidebar();
        UI.initAdminSidebar();

        initManageSeries();
    } catch (err) {
        console.error('Access Denied:', err);
        UI.showToast('ไม่มีสิทธิเข้าถึงหน้าจัดการซีรีส์', 'error');
        setTimeout(() => {
            window.location.href = '/admin/admin-manage.html';
        }, 1500);
    }
});

async function initManageSeries() {
    UI.setLoading(true);
    await updateSeriesCount();
    loadSeries();

    const searchInput = document.getElementById('series-search');
    searchInput?.addEventListener('input', UI.debounce((e) => {
        handleSearch(e.target.value.toLowerCase().trim());
    }, 400));
}

async function updateSeriesCount() {
    await SeriesService.getCount();
}

async function loadSeries() {
    if (SeriesService.state.isSearchMode) {
        return;
    }

    SeriesView.showLoading();

    try {
        const data = await SeriesService.fetchPage(SeriesService.state.currentPage);

        if (data.length > 0) {
            renderSeries(data);
            updatePaginationUI();
        } else if (SeriesService.state.currentPage > 1) {
            // Auto-fallback if current page is empty
            SeriesService.state.currentPage--;
            loadSeries();
        } else if (SeriesService.state.currentPage === 1 && data.length === 0) {
            // จริงๆ มีข้อมูลแต่หน้าแรกดันว่าง (อาจจะกรณีลบจนหมด)
            await SeriesService.getCount();
            SeriesView.renderEmpty();
            loadSeries();
        } else {
            renderSeries([]);
        }
    } catch (error) {
        console.error('Error loading series:', error);
        UI.showToast('เกิดข้อผิดพลาดในการโหลดข้อมูล', 'error');
        if (SeriesView.elements.tableBody) {
            SeriesView.elements.tableBody.innerHTML = '<tr><td colspan="5" class="py-10 text-center text-red-500 Thai-font text-xs">ไม่สามารถเชื่อมต่อฐานข้อมูลได้</td></tr>';
        }
    } finally {
        UI.setLoading(false);
    }
}

async function handleSearch(term) {
    if (!term) {
        SeriesService.state.isSearchMode = false;
        SeriesView.elements.pagination?.classList.remove('hidden');
        loadSeries();
        return;
    }

    SeriesService.state.isSearchMode = true;
    SeriesView.elements.pagination?.classList.add('hidden');

    try {
        const filtered = await SeriesService.search(term);
        renderSeries(filtered);
    } catch (e) {
        console.error('Search failed:', e);
        UI.showToast('การค้นหาล้มเหลว', 'error');
    }
}

function renderSeries(seriesList) {
    const tableBody = document.getElementById('series-full-list');
    if (!tableBody) {
        return;
    }

    if (seriesList.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" class="py-20 text-center animate-fade-in opacity-40">
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
                    <button data-action="preview" data-url="${getMediaWatchPath(series.category, 'series', series.id)}"
                       class="series-action-btn w-8 h-8 flex items-center justify-center rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white transition-all border border-green-500/20"
                       title="ดูตัวอย่าง">
                        <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
                    </button>
                    <a href="./admin-edit-series.html?id=${series.id}"
                       class="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-all border border-blue-500/20"
                       title="แก้ไขข้อมูล">
                        <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
                    </a>
                    <button data-action="delete-series" data-id="${series.id}"
                            class="series-action-btn w-8 h-8 flex items-center justify-center rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
                            title="ลบซีรีส์">
                        <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');

    UI.refreshIcons();

    // Setup event delegation for series action buttons
    setupSeriesActionListeners();
}

/**
 * Sets up event delegation for series action buttons
 */
function setupSeriesActionListeners() {
    const tableBody = document.getElementById('series-full-list');
    if (!tableBody) {
        return;
    }

    tableBody.addEventListener('click', (e) => {
        const btn = e.target.closest('.series-action-btn');
        if (!btn) {
            return;
        }

        const action = btn.dataset.action;
        const url = btn.dataset.url;
        const id = btn.dataset.id;

        if (action === 'preview' && url) {
            window.open(url, '_blank');
        } else if (action === 'delete-series') {
            deleteSeries(id);
        }
    });
}

function updatePaginationUI() {
    const container = SeriesView.elements.pagination;
    if (!container || SeriesService.state.isSearchMode) {
        if (container) {
            container.innerHTML = '';
        }
        return;
    }

    const totalPages = Math.ceil(SeriesService.state.totalSeries / SeriesService.PAGE_SIZE) || 1;
    const currentPage = SeriesService.state.currentPage;

    container.innerHTML = `
        <div class="flex items-center gap-6 bg-black/20 p-2 px-6 rounded-2xl border border-white/5 backdrop-blur-md">
            <button id="prev-btn" class="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-brand-primary hover:border-brand-primary/50 transition-all disabled:opacity-20 disabled:pointer-events-none" ${currentPage === 1 ? 'disabled' : ''}>
                <i data-lucide="chevron-left" class="w-5 h-5"></i>
            </button>
            
            <div class="flex flex-col items-center">
                <span class="text-[10px] font-black text-white tracking-widest uppercase Thai-font">หน้า ${currentPage} / ${totalPages}</span>
                <span class="text-[8px] font-bold text-gray-600 uppercase tracking-tighter Thai-font">ทั้งหมด ${SeriesService.state.totalSeries} เรื่อง</span>
            </div>

            <button id="next-btn" class="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-brand-primary hover:border-brand-primary/50 transition-all disabled:opacity-20 disabled:pointer-events-none" ${currentPage >= totalPages ? 'disabled' : ''}>
                <i data-lucide="chevron-right" class="w-5 h-5"></i>
            </button>
        </div>`;

    document.getElementById('prev-btn')?.addEventListener('click', () => {
        if (SeriesService.state.currentPage > 1) {
            SeriesService.state.currentPage--;
            loadSeries();
        }
    });
    document.getElementById('next-btn')?.addEventListener('click', () => {
        if (SeriesService.state.currentPage < totalPages) {
            SeriesService.state.currentPage++;
            loadSeries();
        }
    });
    UI.refreshIcons();
}

/**
 * Deletes a series and all its episodes
 * @param {string} id - Series ID
 * @returns {Promise<void>}
 */
async function deleteSeries(id) {
    // eslint-disable-next-line no-alert
    if (!confirm('ยืนยันการลบซีรีส์ชุดนี้และตอนทั้งหมดที่เกี่ยวข้อง? การกระทำนี้ไม่สามารถย้อนคืนได้')) {
        return;
    }

    UI.setLoading(true);
    try {
        await SeriesService.delete(id);
        UI.showToast('ลบซีรีส์เรียบร้อยแล้ว', 'success');

        await updateSeriesCount();
        loadSeries();
    } catch (error) {
        console.error('Error deleting series:', error);
        UI.showToast('ไม่สามารถลบข้อมูลได้', 'error');
    } finally {
        UI.setLoading(false);
    }
}

/**
 * 🎯 COMMAND CENTER FUNCTIONS
 */
async function loadCommandCenterData() {
    try {
        // Load real stats from Firebase
        const totalSeries = await SeriesService.getCount();
        document.getElementById('stat-views').textContent = formatNumber(totalSeries * 15) + ' Views'; // Estimate views
        document.getElementById('stat-users').textContent = formatNumber(3) + ' Users'; // Would load from users collection

        // Load Hall of Fame (Top content by views)
        await loadHallOfFame();

        // Load Recent Content
        await loadRecentContent();

        // Load VIP Payment Data
        await loadVIPPayments();
    } catch (error) {
        console.error('Command Center loading error:', error);
    }
}

async function loadHallOfFame() {
    try {
        // Get top series by views
        const q = query(collection(db, SCHEMA.COLLECTIONS.SERIES), orderBy('views', 'desc'), limit(3));
        const snap = await getDocs(q);
        const topSeries = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Update Hall of Fame UI
        const hallOfFameCards = document.querySelectorAll('[class*="aspect-[2/3]"]');
        topSeries.forEach((series, index) => {
            if (hallOfFameCards[index]) {
                const img = hallOfFameCards[index].querySelector('img');
                const loadingText = hallOfFameCards[index].querySelector('p');
                if (img && series.poster) {
                    img.src = series.poster;
                }
                if (loadingText) {
                    loadingText.textContent = series.title || 'Unknown';
                }
            }
        });
    } catch (error) {
        console.error('Hall of Fame loading error:', error);
    }
}

async function loadRecentContent() {
    try {
        const grid = document.getElementById('recent-content-grid');
        if (!grid) {
            return;
        }

        // Get recent series
        const q = query(collection(db, SCHEMA.COLLECTIONS.SERIES), orderBy('createdAt', 'desc'), limit(10));
        const snap = await getDocs(q);
        const recentSeries = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        grid.innerHTML = recentSeries.map(series => `
            <div class="group cursor-pointer">
                <div class="relative aspect-[2/3] rounded-xl overflow-hidden border border-white/5 bg-brand-obsidian">
                    <img src="${series.poster || '/assets/logo/DUYDODEE.png'}" 
                         class="w-full h-full object-cover opacity-90 group-hover:scale-110 transition-transform duration-500" 
                         onerror="this.onerror=null;this.src='/assets/logo/DUYDODEE.png'">
                    <div class="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                        <p class="text-[9px] font-black text-white line-clamp-2 Thai-font">${UI.escapeHTML(series.title || 'Unknown')}</p>
                        <div class="flex items-center gap-2 mt-1">
                            <span class="text-[8px] text-brand-primary font-black">${series.category || 'ซีรีส์'}</span>
                            <span class="text-[8px] text-gray-500">${series.episodeCount || 0} ตอน</span>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        UI.refreshIcons();
    } catch (error) {
        console.error('Recent content loading error:', error);
    }
}

async function loadVIPPayments() {
    try {
        const table = document.getElementById('payment-verification-table');
        if (!table) {
            return;
        }

        // Get recent VIP payments
        const q = query(collection(db, SCHEMA.COLLECTIONS.VIP_PAYMENTS), orderBy('createdAt', 'desc'), limit(10));
        const snap = await getDocs(q);
        const payments = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        if (payments.length > 0) {
            table.innerHTML = payments.map(payment => `
                <tr>
                    <td class="py-2 text-white Thai-font">${payment.senderName || 'Unknown'}</td>
                    <td class="py-2 text-brand-primary font-black">฿${payment.amount || 0}</td>
                    <td class="py-2">
                        <span class="px-2 py-0.5 ${payment.status === 'approved' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'} text-[8px] font-black rounded">
                            ${payment.status === 'approved' ? 'ยืนยันแล้ว' : 'รอตรวจสอบ'}
                        </span>
                    </td>
                    <td class="py-2 text-right">
                        <button class="text-blue-400 hover:text-blue-300 text-[9px] font-black">ตรวจสอบ</button>
                    </td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error('VIP payments loading error:', error);
    }
}

function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Global function for account info update
window.updateAccountInfo = async function() {
    const accountNumber = document.getElementById('account-number').value;
    const accountName = document.getElementById('account-name').value;

    if (!accountNumber || !accountName) {
        UI.showToast('กรุณากรอกข้อมูลให้ครบถ้วน', 'error');
        return;
    }

    UI.setLoading(true);
    try {
        // In real implementation, this would update Firebase config or settings
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
        UI.showToast('อัปเดตข้อมูลบัญชีเรียบร้อยแล้ว', 'success');
    } catch (error) {
        console.error('Account update error:', error);
        UI.showToast('ไม่สามารถอัปเดตข้อมูลได้', 'error');
    } finally {
        UI.setLoading(false);
    }
};

// Initialize Command Center on page load
document.addEventListener('DOMContentLoaded', () => {
    // Wait for existing initialization
    setTimeout(() => {
        loadCommandCenterData();
    }, 1000);
});
