import { db, collection, getDocs, doc, deleteDoc, query, orderBy, limit, startAfter, getCountFromServer, SCHEMA, getMediaWatchPath } from '../services/firebase.js';
import { UI } from '../components/ui.js';
import { checkAdminAccess } from '../middleware/auth-guard.js';
import { injectAdminSidebar } from './sidebar-loader.js';

/**
 * 🎬 DUYดูDEE MOVIE MANAGEMENT ENGINE
 * Refactored: Decoupled Data & UI Architecture
 */

// 📂 1. Data & State Management Service
const MovieService = {
    PAGE_SIZE: 10,
    state: {
        currentPage: 1,
        cursors: [null],
        totalMovies: 0,
        allMoviesCache: [],
        isSearchMode: false
    },

    async getCount() {
        try {
            const countSnap = await getCountFromServer(collection(db, SCHEMA.COLLECTIONS.MOVIES));
            this.state.totalMovies = countSnap.data().count;
            return this.state.totalMovies;
        } catch (e) {
            console.error('Count failed:', e);
            return 0;
        }
    },

    async fetchPage(page) {
        const cursor = this.state.cursors[page - 1];
        let q = query(collection(db, SCHEMA.COLLECTIONS.MOVIES), orderBy('createdAt', 'desc'), limit(this.PAGE_SIZE));
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
        if (this.state.allMoviesCache.length === 0) {
            const snap = await getDocs(query(collection(db, SCHEMA.COLLECTIONS.MOVIES), limit(500)));
            this.state.allMoviesCache = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        }
        return this.state.allMoviesCache.filter(m =>
            m.title?.toLowerCase().includes(term) ||
            m.category?.toLowerCase().includes(term) ||
            m.id.toLowerCase().includes(term)
        );
    },

    async delete(id) {
        await deleteDoc(doc(db, SCHEMA.COLLECTIONS.MOVIES, id));
    }
};

// 🎨 2. UI & Rendering Layer
const MovieView = {
    elements: {
        tableBody: document.getElementById('movies-full-list'),
        pagination: document.getElementById('pagination-container'),
        searchInput: document.getElementById('movie-search')
    },

    showLoading() {
        if (this.elements.tableBody) {
            this.elements.tableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="py-16 text-center Thai-font">
                        <div class="inline-block w-8 h-8 border-2 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin"></div>
                        <p class="mt-4 text-[10px] text-gray-500 uppercase tracking-widest animate-pulse">กำลังซิงค์ข้อมูลหนัง</p>
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
                            <i data-lucide="film" class="w-10 h-10 text-gray-500"></i>
                        </div>
                        <p class="text-sm font-black text-gray-500 uppercase tracking-[0.4em] Thai-font">ไม่มีข้อมูลภาพยนตร์ในระบบ</p>
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

        initManageMovies();
    } catch (err) {
        console.error('Access Denied:', err);
        UI.showToast('ไม่มีสิทธิเข้าถึงหน้าจัดการหนัง', 'error');
        setTimeout(() => {
            window.location.href = '/admin/admin-manage.html';
        }, 1500);
    }
});

async function initManageMovies() {
    UI.setLoading(true);

    await updateMovieCount();
    loadMovies();

    const searchInput = document.getElementById('movie-search');
    searchInput?.addEventListener('input', UI.debounce((e) => {
        handleSearch(e.target.value.toLowerCase().trim());
    }, 400));
}

async function updateMovieCount() {
    await MovieService.getCount();
}

async function loadMovies() {
    if (MovieService.state.isSearchMode) {
        return;
    }

    MovieView.showLoading();

    try {
        const data = await MovieService.fetchPage(MovieService.state.currentPage);

        if (data.length > 0) {
            renderMovies(data);
            updatePaginationUI();
        } else if (MovieService.state.currentPage > 1) {
            MovieService.state.currentPage--;
            loadMovies();
        } else if (MovieService.state.currentPage === 1 && data.length === 0) {
            await MovieService.getCount();
            MovieView.renderEmpty();
            loadMovies();
        } else {
            renderMovies([]);
        }
    } catch (error) {
        console.error('Error loading movies:', error);
        UI.showToast('เกิดข้อผิดพลาดในการโหลดข้อมูล', 'error');
        if (MovieView.elements.tableBody) {
            MovieView.elements.tableBody.innerHTML = '<tr><td colspan="5" class="py-10 text-center text-red-500 Thai-font text-xs">ไม่สามารถเชื่อมต่อฐานข้อมูลได้</td></tr>';
        }
    } finally {
        UI.setLoading(false);
    }
}

async function handleSearch(term) {
    if (!term) {
        MovieService.state.isSearchMode = false;
        MovieView.elements.pagination?.classList.remove('hidden');
        loadMovies();
        return;
    }

    MovieService.state.isSearchMode = true;
    MovieView.elements.pagination?.classList.add('hidden');

    try {
        const filtered = await MovieService.search(term);
        renderMovies(filtered);
    } catch (e) {
        console.error('Search failed:', e);
        UI.showToast('การค้นหาล้มเหลว', 'error');
    }
}

function renderMovies(movies) {
    const tableBody = MovieView.elements.tableBody;
    if (!tableBody) {
        return;
    }

    if (movies.length === 0) {
        MovieView.renderEmpty();
        return;
    }

    tableBody.innerHTML = movies.map(movie => `
        <tr class="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
            <td class="py-4 text-center">
                <div class="relative inline-block">
                    <img src="${UI.getSafePoster(movie.poster)}" 
                         class="w-10 h-14 object-cover rounded-lg border border-white/10 shadow-lg group-hover:scale-105 transition-transform" 
                         alt="${UI.escapeHTML(movie.title)}"
                         onerror="this.src='/assets/logo/DUYDODEE.png';">
                </div>
            </td>
            <td class="py-4">
                <div class="flex flex-col gap-0.5">
                    <span class="font-bold text-white Thai-font text-sm group-hover:text-brand-primary transition-colors">${UI.escapeHTML(movie.title)}</span>
                    <div class="flex items-center gap-2">
                        <span class="text-[8px] px-1.5 py-0.5 bg-blue-500/10 text-blue-500 rounded font-black border border-blue-500/20 uppercase tracking-tighter">${movie.badge || 'HD'}</span>
                        <span class="text-[8px] text-gray-600 uppercase font-bold tracking-widest opacity-50">${movie.id}</span>
                    </div>
                </div>
            </td>
            <td class="py-4 text-center">
                <span class="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] font-black text-gray-500 Thai-font uppercase tracking-widest">
                    ${movie.category}
                </span>
            </td>
            <td class="py-4 text-center">
                <div class="flex flex-col items-center">
                    <span class="text-xs font-black text-white">${(movie.views || 0).toLocaleString()}</span>
                    <span class="text-[8px] font-black text-gray-600 uppercase tracking-widest opacity-40 Thai-font">ยอดเข้าชม</span>
                </div>
            </td>
            <td class="py-4 text-right px-10">
                <div class="flex items-center justify-end gap-2.5">
                    <button data-action="preview" data-url="${getMediaWatchPath(movie.category, 'movie', movie.id)}"
                       class="movie-action-btn w-8 h-8 flex items-center justify-center rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white transition-all border border-green-500/20"
                       title="ดูตัวอย่าง">
                        <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
                    </button>
                    <a href="./admin-edit-movie.html?id=${movie.id}"
                       class="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-all border border-blue-500/20"
                       title="แก้ไขข้อมูล">
                        <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
                    </a>
                    <button data-action="delete-movie" data-id="${movie.id}"
                            class="movie-action-btn w-8 h-8 flex items-center justify-center rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
                            title="ลบหนัง">
                        <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');

    UI.refreshIcons();

    // Setup event delegation for movie action buttons
    setupMovieActionListeners();
}

/**
 * Sets up event delegation for movie action buttons
 */
function setupMovieActionListeners() {
    const tableBody = MovieView.elements.tableBody;
    if (!tableBody) {
        return;
    }

    tableBody.addEventListener('click', (e) => {
        const btn = e.target.closest('.movie-action-btn');
        if (!btn) {
            return;
        }

        const action = btn.dataset.action;
        const url = btn.dataset.url;
        const id = btn.dataset.id;

        if (action === 'preview' && url) {
            window.open(url, '_blank');
        } else if (action === 'delete-movie') {
            deleteMovie(id);
        }
    });
}

function updatePaginationUI() {
    const container = MovieView.elements.pagination;
    if (!container || MovieService.state.isSearchMode) {
        if (container) {
            container.innerHTML = '';
        }
        return;
    }

    const totalPages = Math.ceil(MovieService.state.totalMovies / MovieService.PAGE_SIZE) || 1;
    const currentPage = MovieService.state.currentPage;

    container.innerHTML = `
        <div class="flex items-center gap-6 bg-black/20 p-2 px-6 rounded-2xl border border-white/5 backdrop-blur-md">
            <button id="prev-btn" class="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-brand-primary hover:border-brand-primary/50 transition-all disabled:opacity-20 disabled:pointer-events-none" ${currentPage === 1 ? 'disabled' : ''}>
                <i data-lucide="chevron-left" class="w-5 h-5"></i>
            </button>
            
            <div class="flex flex-col items-center">
                <span class="text-[10px] font-black text-white tracking-widest uppercase Thai-font">หน้า ${currentPage} / ${totalPages}</span>
                <span class="text-[8px] font-bold text-gray-600 uppercase tracking-tighter Thai-font">ทั้งหมด ${MovieService.state.totalMovies} เรื่อง</span>
            </div>

            <button id="next-btn" class="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-brand-primary transition-all disabled:opacity-20 disabled:pointer-events-none" ${currentPage >= totalPages ? 'disabled' : ''}>
                <i data-lucide="chevron-right" class="w-5 h-5"></i>
            </button>
        </div>
    `;

    document.getElementById('prev-btn')?.addEventListener('click', () => {
        if (MovieService.state.currentPage > 1) {
            MovieService.state.currentPage--;
            loadMovies();
        }
    });
    document.getElementById('next-btn')?.addEventListener('click', () => {
        if (MovieService.state.currentPage < totalPages) {
            MovieService.state.currentPage++;
            loadMovies();
        }
    });
    UI.refreshIcons();
}

/**
 * Deletes a movie
 * @param {string} id - Movie ID
 * @returns {Promise<void>}
 */
async function deleteMovie(id) {
    // eslint-disable-next-line no-alert
    if (!confirm('ยืนยันการลบข้อมูลหนังเรื่องนี้? การกระทำนี้ไม่สามารถย้อนคืนได้')) {
        return;
    }

    UI.setLoading(true);
    try {
        await MovieService.delete(id);
        UI.showToast('ลบข้อมูลเรียบร้อยแล้ว', 'success');

        await updateMovieCount();
        loadMovies();
    } catch (error) {
        console.error('Error deleting movie:', error);
        UI.showToast('ไม่สามารถลบข้อมูลได้', 'error');
    } finally {
        UI.setLoading(false);
    }
}
