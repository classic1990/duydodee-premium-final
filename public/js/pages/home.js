import { AuthService } from '/js/services/auth-service.js';
import { ContentService } from '/js/services/content-service.js';
import { UI } from '/js/components/ui.js';
import { UI_CONFIG } from '/js/constants.js';

/**
 * 🏠 DUYดูDEE HOME ENGINE - REFACTORED V2.1
 * Fixed ESLint issues and missing functions.
 */

// --- Global State ---
let pageNumber = 0;
let pageCursors = [null]; // Stack of cursors
let isEndOfContent = false;
let currentType = 'all'; 

document.addEventListener('DOMContentLoaded', async () => {
    UI.injectStarfield();
    UI.initNavbar();
    UI.updateMeta({});
    
    // Core Data Boot
    initHeroSlider();
    loadTrendingMovies();
    initSearchSystem();
    initFilterSystem();
    
    // Initial Discovery Load
    loadDiscoveryContent(true);

    AuthService.onStateChanged(user => {
        if (user) loadUserHistory(user.uid);
        else document.getElementById('history-section')?.classList.add('hidden');
    });
});

// --- 1. HERO SLIDER ---
async function initHeroSlider() {
    const heroContainer = document.getElementById('hero-slider-container');
    if (!heroContainer) return;

    try {
        const { items: slides } = await ContentService.fetchItems('hero', { pageSize: 5, sortBy: 'order', direction: 'asc' });
        
        // Use Premium Default if no slides
        if (slides.length === 0) {
            renderSlider([{
                title: 'DUYดูDEE',
                description: 'ก้าวข้ามขีดจำกัดเดิมๆ สู่โลกความบันเทิงระดับมาสเตอร์พีซ คมชัดทุกอณูบนทุกอุปกรณ์',
                targetUrl: '/category.html?cat=vertical'
            }], heroContainer);
            return;
        }
        renderSlider(slides, heroContainer);
    } catch (e) { 
        console.error('Hero Slider Error:', e);
        // Fallback Premium
        renderSlider([{
            title: 'DUYดูDEE PREMIUM',
            description: 'ที่สุดแห่งประสบการณ์ความบันเทิงระดับ 4K HDR ที่ออกแบบมาเพื่อคุณ',
            targetUrl: '#'
        }], heroContainer);
    }
}

function renderSlider(slides, container) {
    let currentIndex = 0, timer = null;
    const showSlide = () => {
        container.innerHTML = `
            <div class="absolute bottom-10 right-10 z-10">
                ${slides.length > 1 ? `<div class="flex items-center justify-end gap-3">${slides.map((_, i) => `<button data-index="${i}" aria-label="Slide ${i + 1}" class="slider-dot h-1.5 rounded-full transition-all duration-700 ${i === currentIndex ? 'w-12 bg-brand-primary' : 'w-2 bg-white/20 hover:bg-white/40'}"></button>`).join('')}</div>` : ''}
            </div>`;
        
        UI.refreshIcons();
        document.querySelectorAll('.slider-dot').forEach(dot => {
            dot.onclick = (e) => { 
                resetTimer(); 
                currentIndex = parseInt(e.target.dataset.index); 
                showSlide(currentIndex); 
            };
        });
    };
    const resetTimer = () => { if (timer) clearInterval(timer); timer = setInterval(() => { currentIndex = (currentIndex + 1) % slides.length; showSlide(currentIndex); }, 10000); };
    showSlide(currentIndex); if (slides.length > 1) resetTimer();
}

// --- 2. TRENDING ---
async function loadTrendingMovies() {
    const container = document.getElementById('trending-grid');
    if (!container) return;
    try {
        const { items: trending } = await ContentService.fetchItems('movie', { pageSize: 10, sortBy: 'views', direction: 'desc' });
        if (trending.length === 0) return;
        document.getElementById('trending-section')?.classList.remove('hidden');
        container.innerHTML = trending.map((item, i) => UI.createTrendingCard(item, i + 1)).join('');
        UI.refreshIcons();
    } catch (e) { console.error(e); }
}

// --- 3. DISCOVERY ---
async function loadDiscoveryContent(reset = false) {
    const container = document.getElementById('library-grid');
    const paginationContainer = document.getElementById('pagination-container');

    if (!container) return;

    if (reset) {
        container.innerHTML = '';
        pageNumber = 0;
        pageCursors = [null];
        isEndOfContent = false;
        paginationContainer?.classList.remove('hidden');
        UI.renderSkeleton(container, UI_CONFIG.PAGE_SIZE);
    }

    try {
        let items = [];
        let newLastDoc = null;
        let empty = true;

        const cursor = pageCursors[pageNumber];

        let res;
        if (currentType === 'all') {
            res = await ContentService.fetchItemsByCategory(['movie', 'series'], null, { 
                pageSize: UI_CONFIG.PAGE_SIZE, 
                lastDoc: cursor,
                isAllCategories: true 
            });
        } else {
            res = await ContentService.fetchItems(currentType, { 
                pageSize: UI_CONFIG.PAGE_SIZE, 
                lastDoc: cursor 
            });
        }
        
        items = res.items;
        newLastDoc = res.lastDoc;
        empty = res.empty;

        if (reset) container.innerHTML = '';

        isEndOfContent = empty || items.length < UI_CONFIG.PAGE_SIZE;

        if (!isEndOfContent && pageCursors.length <= pageNumber + 1) {
            pageCursors[pageNumber + 1] = newLastDoc;
        }

        container.innerHTML = items.length > 0 
            ? items.map(item => UI.createMovieCard(item)).join('') 
            : '<p class="col-span-full text-center text-gray-500 py-20 Thai-font">ไม่พบข้อมูลในหมวดนี้</p>';
        
        updatePaginationUI();
        UI.refreshIcons();
    } catch (e) { 
        console.error('Load Discovery Failed:', e); 
        container.innerHTML = '<p class="col-span-full text-center text-red-500 py-10 Thai-font">ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง</p>';
    }
}

function initFilterSystem() {
    const filters = document.querySelectorAll('.type-filter');
    filters.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const type = e.target.dataset.type;
            if (type === currentType) return;
            
            currentType = type;
            filters.forEach(b => b.classList.remove('active', 'bg-brand-primary', 'text-black'));
            filters.forEach(b => b.classList.add('text-gray-400'));
            btn.classList.add('active', 'bg-brand-primary', 'text-black');
            btn.classList.remove('text-gray-400');
            
            loadDiscoveryContent(true);
        });
    });
}

function changePage(direction) {
    if (direction === 1) {
        if (isEndOfContent) return;
        pageNumber++;
    } else if (direction === -1) {
        if (pageNumber <= 0) return;
        pageNumber--;
    }
    
    document.getElementById('vertical-section')?.scrollIntoView({ behavior: 'smooth' });
    loadDiscoveryContent(false);
}

// Expose changePage to window for HTML onclick
window.changePage = changePage;

function updatePaginationUI() {
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    const pageNumbersEl = document.getElementById('page-numbers');

    if (!prevPageBtn || !nextPageBtn || !pageNumbersEl) return;

    pageNumbersEl.textContent = `หน้า ${pageNumber + 1}`;
    prevPageBtn.disabled = pageNumber === 0;
    prevPageBtn.style.opacity = pageNumber === 0 ? '0.2' : '1';
    nextPageBtn.disabled = isEndOfContent;
    nextPageBtn.style.opacity = isEndOfContent ? '0.2' : '1';
}

// --- 4. SEARCH SYSTEM ---
async function initSearchSystem() {
    const dInp = document.getElementById('global-search'), mInp = document.getElementById('global-search-mobile');
    const paginationContainer = document.getElementById('pagination-container');
    if (!dInp && !mInp) return;

    const handleSearch = async (e) => {
        const term = e.target.value.trim().toLowerCase();
        const libGrid = document.getElementById('library-grid');
        if (!libGrid) return;

        if (!term) { 
            loadDiscoveryContent(true); 
            paginationContainer?.classList.remove('hidden');
            return; 
        }

        paginationContainer?.classList.add('hidden');
        UI.renderSkeleton(libGrid, 6);
        
        try {
            const [movies, series] = await Promise.all([
                ContentService.searchItems('movie', term, 12),
                ContentService.searchItems('series', term, 12)
            ]);

            const results = [...movies, ...series].sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
            
            document.getElementById('trending-section')?.classList.add('hidden');
            libGrid.innerHTML = results.length > 0 
                ? results.map(item => UI.createMovieCard(item)).join('') 
                : '<div class="col-span-full py-20 text-center animate-fade-in"><i data-lucide="search-x" class="w-12 h-12 text-gray-700 mx-auto mb-4"></i><p class="Thai-font text-gray-500">ไม่พบผลลัพธ์ที่คุณกำลังค้นหา</p></div>';
            
            UI.refreshIcons();
        } catch (e) {
            console.error('Search failed:', e);
            libGrid.innerHTML = '<p class="col-span-full text-center text-red-500 py-10 Thai-font">การค้นหาขัดข้อง กรุณาลองอีกครั้ง</p>';
        }
    };

    const debouncedSearch = UI.debounce(handleSearch, UI_CONFIG.DEBOUNCE_DELAY);
    dInp?.addEventListener('input', debouncedSearch);
    mInp?.addEventListener('input', debouncedSearch);
}

// --- 5. UTILS ---
async function loadUserHistory(userId) {
    const container = document.getElementById('history-grid'), section = document.getElementById('history-section');
    if (!container) return;
    try {
        const history = await AuthService.getWatchHistory(userId, 8);
        if (history.length === 0) { section?.classList.add('hidden'); return; }
        
        section?.classList.remove('hidden');
        // เพิ่มสไตล์การเลื่อนแนวนอนแบบ Cinematic
        container.className = 'flex overflow-x-auto gap-5 md:gap-8 pb-10 scrollbar-hide snap-x snap-mandatory px-2';
        container.innerHTML = history.map(item => UI.createHistoryCard(item)).join('');
        
        UI.refreshIcons();
    } catch (e) { console.error(e); }
}
