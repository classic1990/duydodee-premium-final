import { UI } from '/src/components/ui.js';
import { auth, onAuthStateChanged } from '/src/services/firebase.js';
import { ContentService } from '/src/services/content-service.js';

let lastVisible = null;
let isLoading = false;

async function loadTrending(isInitial = false) {
    if (isLoading) return;
    isLoading = true;

    const grid = document.getElementById('trending-grid');
    const loadMoreBtn = document.getElementById('load-more-btn');
    const errorContainer = document.getElementById('error-container');

    if (isInitial) {
        UI.renderSkeleton(grid, 6);
    }

    try {
        const { items, lastVisible: nextVisible } = await ContentService.fetchTrending(12, isInitial ? null : lastVisible);
        lastVisible = nextVisible;

        if (isInitial) {
            grid.innerHTML = items.map(item => UI.createCard(item)).join('');
        } else {
            grid.innerHTML += items.map(item => UI.createCard(item)).join('');
        }

        if (items.length === 0) {
            loadMoreBtn.style.display = 'none';
        }
    } catch (err) {
        console.error('Home Error:', err);
        errorContainer.textContent = 'Failed to load content. Please try again.';
        errorContainer.style.display = 'block';
    } finally {
        isLoading = false;
    }
}

async function loadContinueWatching(user) {
    const container = document.getElementById('continue-watching-section');
    const grid = document.getElementById('continue-watching-grid');
    if (!container || !grid) return;

    try {
        const history = await ContentService.fetchHistory(user.uid, 6);
        if (history.length === 0) {
            container.classList.add('hidden');
            return;
        }

        container.classList.remove('hidden');
        grid.innerHTML = history.map(item => {
            const label = item.type === 'series' ? `ตอนที่ ${item.epIndex + 1}` : 'ดูต่อจากเดิม';
            return UI.createCard(item)
                .replace('รับชมเลย', label); // Customize the card label
        }).join('');

        if (window.lucide) window.lucide.createIcons();
    } catch (err) {
        console.error('History Error:', err);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    UI.injectStarfield();
    UI.initNavbar();

    onAuthStateChanged(auth, (user) => {
        if (user) loadContinueWatching(user);
        else document.getElementById('continue-watching-section')?.classList.add('hidden');
    });

    const grid = document.getElementById('trending-grid');
    if (!grid) return;

    // Add load more button
    const loadMoreBtn = document.createElement('button');
    loadMoreBtn.id = 'load-more-btn';
    loadMoreBtn.textContent = 'Load More';
    grid.parentNode.insertBefore(loadMoreBtn, grid.nextSibling);
    loadMoreBtn.addEventListener('click', () => loadTrending(false));

    // Add error container
    const errorContainer = document.createElement('div');
    errorContainer.id = 'error-container';
    errorContainer.style.display = 'none';
    errorContainer.style.color = 'red';
    grid.parentNode.insertBefore(errorContainer, grid);

    await loadTrending(true);
});
