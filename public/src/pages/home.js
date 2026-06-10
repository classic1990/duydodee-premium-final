import { auth, onAuthStateChanged, getWatchHistory, db, doc, getDoc, SCHEMA } from '../services/firebase.js';
import { UI } from '../components/ui.js';
import { UI_CONFIG } from '../constants.js';
import { ContentService } from '../services/content-service.js';

/**
 * 🎬 DUYดูDEE HOME ENGINE - Premium Master Edition
 */
let lastVisibleDoc = null;
let isFetching = false;
let hasMore = true;
let currentFilter = 'all';

document.addEventListener('DOMContentLoaded', async () => {
    UI.injectStarfield();
    UI.initNavbar();

    // 1. Initial Data Loading
    loadTrending();
    loadChineseSeries();
    loadLibrary();

    // 2. Auth-based Sections
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            loadHistory(user.uid);
            loadPersonalizedContent(user.uid); // Add this
        } else {
            document.getElementById('history-section')?.classList.add('hidden');
        }
    });

    // 3. Filter Buttons
    setupFilterButtons();

    // 4. Global Search Redirect
    const searchInput = document.getElementById('global-search');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && searchInput.value.trim()) {
                window.location.href = `/search.html?q=${encodeURIComponent(searchInput.value.trim())}`;
            }
        });
    }
});

/**
 * 🔍 Setup Filter Buttons
 */
function setupFilterButtons() {
    const filterButtons = document.querySelectorAll('.type-filter');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const filterType = btn.dataset.type;
            if (filterType === currentFilter) {
                return;
            }

            // Update active state
            filterButtons.forEach(b => {
                b.classList.remove('bg-brand-primary', 'text-black');
                b.classList.add('text-gray-400');
            });
            btn.classList.add('bg-brand-primary', 'text-black');
            btn.classList.remove('text-gray-400');

            // Update filter and reload
            currentFilter = filterType;
            lastVisibleDoc = null; // Reset pagination
            hasMore = true;
            loadLibrary();
        });
    });
}

/**
 * 💡 Load Personalized Content
 */
async function loadPersonalizedContent(uid) {
    const section = document.getElementById('personalized-section');
    const grid = document.getElementById('personalized-grid');
    const titleEl = document.getElementById('personalized-title');
    if (!grid) {
        return;
    }

    try {
        const userSnap = await getDoc(doc(db, SCHEMA.COLLECTIONS.USERS, uid));
        if (!userSnap.exists()) {
            return;
        }

        const prefs = userSnap.data().preferredCategories || {};
        const categories = Object.keys(prefs);
        if (categories.length === 0) {
            return;
        }

        // Find top category
        const topCategory = categories.reduce((a, b) => prefs[a] > prefs[b] ? a : b);

        const { items } = await ContentService.fetchItemsByCategory(['movie', 'series'], topCategory, {
            pageSize: 7
        });

        if (items.length > 0) {
            section.classList.remove('hidden');
            titleEl.innerText = `แนะนำจากความชอบของคุณ: ${topCategory}`;
            grid.innerHTML = items.map(item => UI.createMovieCard(item)).join('');
            UI.refreshIcons();
        }
    } catch (error) {
        console.error('Personalized Load Error:', error);
    }
}

/**
 * 🕒 Load Watch History
 */
async function loadHistory(uid) {
    const section = document.getElementById('history-section');
    const grid = document.getElementById('history-grid');
    if (!grid) {
        return;
    }

    try {
        const history = await getWatchHistory(uid, 8);
        if (history && history.length > 0) {
            section.classList.remove('hidden');
            grid.innerHTML = history.map(item => UI.createHistoryCard(item)).join('');
            UI.refreshIcons();
        } else {
            section.classList.add('hidden');
        }
    } catch (error) {
        console.error('History Load Error:', error);
    }
}

/**
 * 🔥 Load Trending Content
 */
async function loadTrending() {
    const section = document.getElementById('trending-section');
    const grid = document.getElementById('trending-grid');
    if (!grid) {
        return;
    }

    try {
        // Query TOP Rated/Viewed from both movies & series
        const { items } = await ContentService.fetchItemsByCategory(['movie', 'series'], null, {
            pageSize: 10,
            sortBy: 'views',
            direction: 'desc',
            isAllCategories: true
        });

        if (items.length > 0) {
            section.classList.remove('hidden');
            grid.innerHTML = items.map((item, index) => UI.createTrendingCard(item, index + 1)).join('');
            UI.refreshIcons();
        }
    } catch (error) {
        console.error('Trending Load Error:', error);
    }
}

/**
 * 🏮 Load Chinese Series
 */
async function loadChineseSeries() {
    const grid = document.getElementById('chinese-series-grid');
    if (!grid) {
        return;
    }

    try {
        const { items } = await ContentService.fetchItemsByCategory('series', ['ซีรีส์จีน', 'Chinese', 'ซีรีส์จีนพากย์ไทย'], {
            pageSize: 7,
            sortBy: 'createdAt',
            direction: 'desc'
        });

        if (items.length > 0) {
            grid.closest('section').classList.remove('hidden');
            grid.innerHTML = items.map(item => UI.createMovieCard(item)).join('');
            UI.refreshIcons();
        }
    } catch (error) {
        console.error('Chinese Series Load Error:', error);
    }
}

/**
 * 🎬 Load Global Library with Pagination & Filters
 */
async function loadLibrary(isAppend = false) {
    if (isFetching || (!hasMore && isAppend)) {
        return;
    }

    const grid = document.getElementById('library-grid');
    if (!grid) {
        return;
    }

    isFetching = true;

    if (isAppend) {
        UI.renderSkeleton(grid, 4, 'poster', true);
    } else {
        UI.renderSkeleton(grid, UI_CONFIG.PAGE_SIZE || 12);
    }

    try {
        const collections = currentFilter === 'all' ? ['movie', 'series'] : [currentFilter];

        const { items, lastDoc, empty } = await ContentService.fetchItemsByCategory(collections, null, {
            pageSize: UI_CONFIG.PAGE_SIZE || 12,
            lastDoc: lastVisibleDoc,
            sortBy: 'createdAt',
            direction: 'desc',
            isAllCategories: true
        });

        if (isAppend) {
            grid.querySelectorAll('.skeleton-item').forEach(el => el.remove());
        } else {
            grid.innerHTML = '';
        }

        if (empty && !isAppend) {
            grid.innerHTML = '<div class="col-span-full py-20 text-center text-gray-500 Thai-font">ไม่พบเนื้อหาในขณะนี้</div>';
            hasMore = false;
        } else {
            lastVisibleDoc = lastDoc;
            if (items.length < (UI_CONFIG.PAGE_SIZE || 12)) {
                hasMore = false;
            }

            grid.insertAdjacentHTML('beforeend', items.map(item => UI.createMovieCard(item)).join(''));
            UI.refreshIcons();
        }

        // Update pagination UI
        const nextBtn = document.getElementById('next-page');
        if (nextBtn) {
            nextBtn.disabled = !hasMore;
        }

    } catch (error) {
        console.error('Library Load Error:', error);
        grid.innerHTML = '<div class="col-span-full py-20 text-center text-red-500 Thai-font">เกิดข้อผิดพลาดในการโหลดข้อมูล</div>';
    } finally {
        isFetching = false;
    }
}

// Global scope for HTML onclick
window.changePage = (dir) => {
    if (dir === 1 && hasMore) {
        loadLibrary(true);
    }
};
