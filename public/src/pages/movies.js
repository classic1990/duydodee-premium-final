import { UI } from '/src/components/ui.js';
import { auth } from '/src/services/firebase.js';
import { ContentService } from '/src/services/content-service.js';
import { UserFooter } from '/src/components/user-footer.js';

const PAGE_SIZE = 18;
let allMovies = [];
let currentPage = 1;

async function init() {
    UI.initNavbar();
    UserFooter.render();
    UI.injectStarfield();

    const grid = document.getElementById('movies-grid');
    UI.renderSkeleton(grid, 12);

    try {
        const moviesSnap = await ContentService.searchContent('', 'movie');
        allMovies = moviesSnap.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        renderPage();
    } catch (err) {
        console.error('Movies Load Error:', err);
        grid.innerHTML = '<p class="text-red-500 text-center col-span-full">เกิดข้อผิดพลาดในการโหลดข้อมูล</p>';
    }
}

async function renderPage() {
    const grid = document.getElementById('movies-grid');
    const pagination = document.getElementById('pagination-container');

    const start = (currentPage - 1) * PAGE_SIZE;
    const pageItems = allMovies.slice(start, start + PAGE_SIZE);

    // Get Favorites status
    const favorites = auth.currentUser ? await ContentService.fetchWatchlist(auth.currentUser.uid) : [];
    const favIds = new Set(favorites.map(f => f.id));

    grid.innerHTML = pageItems.map(item => UI.createCard(item, favIds.has(item.id))).join('');

    UI.renderPagination(pagination, allMovies.length, PAGE_SIZE, currentPage, (newPage) => {
        currentPage = newPage;
        renderPage();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    if (window.lucide) window.lucide.createIcons();
}

document.addEventListener('DOMContentLoaded', init);