import { ReviewService } from '../services/review-service.js';
import { ReviewCard } from '../components/ReviewCard.js';
import { AuthService } from '../services/auth-service.js';
import { SidebarLoader } from './sidebar-loader.js';

let currentFilter = 'all';
let reviews = [];

document.addEventListener('DOMContentLoaded', async () => {
    // Load sidebar
    SidebarLoader.load();

    // Check admin access
    const user = AuthService.auth.currentUser;
    if (!user) {
        window.location.href = '/login.html';
        return;
    }

    // Setup filter buttons
    setupFilters();

    // Load reviews
    await loadReviews();

    // Make admin functions available globally
    window.adminDeleteReview = handleAdminDeleteReview;
    window.adminClearReport = handleAdminClearReport;
});

function setupFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', async () => {
            // Update active state
            filterBtns.forEach(b => {
                b.classList.remove('active', 'bg-brand-primary', 'text-black', 'border-brand-primary');
                b.classList.add('bg-white/5', 'text-white', 'border-white/10');
            });
            btn.classList.remove('bg-white/5', 'text-white', 'border-white/10');
            btn.classList.add('active', 'bg-brand-primary', 'text-black', 'border-brand-primary');

            // Update filter and reload
            currentFilter = btn.dataset.filter;
            await loadReviews();
        });
    });
}

async function loadReviews() {
    const grid = document.getElementById('reviews-grid');
    const loadingState = document.getElementById('loading-state');
    const emptyState = document.getElementById('empty-state');

    // Show loading
    grid.classList.add('hidden');
    loadingState.classList.remove('hidden');
    emptyState.classList.add('hidden');

    try {
        let fetchedReviews = [];

        if (currentFilter === 'reported') {
            fetchedReviews = await ReviewService.getReportedReviews();
        } else if (currentFilter === 'recent') {
            fetchedReviews = await ReviewService.getRecentReviews(50);
        } else {
            // All reviews - get recent reviews
            fetchedReviews = await ReviewService.getRecentReviews(100);
        }

        reviews = fetchedReviews;

        // Update counts
        updateCounts();

        // Hide loading
        loadingState.classList.add('hidden');

        if (reviews.length === 0) {
            emptyState.classList.remove('hidden');
        } else {
            grid.classList.remove('hidden');
            renderReviews();
        }
    } catch (error) {
        console.error('Load reviews error:', error);
        loadingState.classList.add('hidden');
        emptyState.classList.remove('hidden');
    }
}

function renderReviews() {
    const grid = document.getElementById('reviews-grid');
    if (!grid) {
        return;
    }

    grid.innerHTML = reviews.map(review => ReviewCard.renderAdmin(review)).join('');

    // Refresh icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function updateCounts() {
    const reviewCountEl = document.getElementById('review-count');
    const reportedCountEl = document.getElementById('reported-count');

    if (reviewCountEl) {
        reviewCountEl.textContent = `รีวิวทั้งหมด: ${reviews.length}`;
    }

    // Count reported reviews
    const reportedCount = reviews.filter(r => r.reported).length;
    if (reportedCountEl) {
        reportedCountEl.textContent = `รายงาน: ${reportedCount}`;
    }
}

async function handleAdminDeleteReview(reviewId, contentType, contentId) {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบรีวิวนี้?')) {
        return;
    }

    try {
        const result = await ReviewService.adminDeleteReview(reviewId);

        if (result.success) {
            // Refresh reviews
            await loadReviews();
            alert('ลบรีวิวสำเร็จ');
        } else {
            alert('เกิดข้อผิดพลาด: ' + (result.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Admin delete review error:', error);
        alert('เกิดข้อผิดพลาด กรุณาลองใหม่');
    }
}

async function handleAdminClearReport(reviewId) {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะยกเลิกรายงานรีวิวนี้?')) {
        return;
    }

    try {
        const result = await ReviewService.clearReviewReport(reviewId);

        if (result.success) {
            // Refresh reviews
            await loadReviews();
            alert('ยกเลิกรายงานสำเร็จ');
        } else {
            alert('เกิดข้อผิดพลาด: ' + (result.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Clear report error:', error);
        alert('เกิดข้อผิดพลาด กรุณาลองใหม่');
    }
}
