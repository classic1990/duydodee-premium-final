import { ReviewCard } from './ReviewCard.js';
import { ReviewService } from '../services/review-service.js';
import { RatingStars } from './RatingStars.js';

/**
 * 📋 REVIEWS LIST COMPONENT
 * Displays and manages the list of reviews for content
 */
export const ReviewsList = {
    contentType: null,
    contentId: null,
    currentUserId: null,
    reviews: [],
    userReview: null,
    isLoading: false,
    hasMore: true,
    currentPage: 0,
    pageSize: 10,
    sortBy: 'createdAt',
    sortDirection: 'desc',
    onReviewUpdate: null,

    /**
     * Initialize the reviews list
     */
    init(config) {
        this.contentType = config.contentType;
        this.contentId = config.contentId;
        this.currentUserId = config.currentUserId || null;
        this.onReviewUpdate = config.onReviewUpdate || null;
        this.sortBy = config.sortBy || 'createdAt';
        this.sortDirection = config.sortDirection || 'desc';

        this.loadReviews();
        this.loadUserReview();
    },

    /**
     * Load reviews for the content
     */
    async loadReviews(append = false) {
        if (this.isLoading) {
            return;
        }

        this.isLoading = true;
        this.renderLoading();

        try {
            const options = {
                limitCount: this.pageSize,
                sortBy: this.sortBy,
                direction: this.sortDirection
            };

            const newReviews = await ReviewService.getReviews(
                this.contentType,
                this.contentId,
                options
            );

            if (append) {
                this.reviews = [...this.reviews, ...newReviews];
            } else {
                this.reviews = newReviews;
            }

            this.hasMore = newReviews.length < this.pageSize;
            this.render();

        } catch (error) {
            console.error('ReviewsList Error [loadReviews]:', error);
            this.renderError();
        } finally {
            this.isLoading = false;
        }
    },

    /**
     * Load current user's review
     */
    async loadUserReview() {
        if (!this.currentUserId) {
            return;
        }

        try {
            this.userReview = await ReviewService.getUserReview(
                this.contentType,
                this.contentId,
                this.currentUserId
            );
        } catch (error) {
            console.error('ReviewsList Error [loadUserReview]:', error);
        }
    },

    /**
     * Render the reviews section
     */
    render() {
        const container = document.getElementById('reviews-section');
        if (!container) {
            return;
        }

        const contentRating = this._getContentRating();

        let reviewsHTML = '';

        // Rating Summary
        reviewsHTML += `
            <div class="glass-premium-enhanced p-6 rounded-2xl mb-6">
                <div class="flex items-center justify-between">
                    <div>
                        <h3 class="text-2xl font-black text-white uppercase tracking-widest Thai-font mb-2">
                            รีวิวและคะแนน
                        </h3>
                        <div class="flex items-center gap-3">
                            <div class="text-4xl font-black text-brand-primary">
                                ${contentRating.averageRating > 0 ? contentRating.averageRating.toFixed(1) : '-'}
                            </div>
                            <div>
                                ${RatingStars.render(contentRating.averageRating, 'md', false)}
                                <p class="text-gray-400 text-sm">${contentRating.totalReviews.toLocaleString()} รีวิว</p>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Sort Options -->
                    <div class="flex items-center gap-2">
                        <select id="review-sort-select" 
                                class="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-brand-primary">
                            <option value="recent-desc" ${this.sortBy === 'createdAt' && this.sortDirection === 'desc' ? 'selected' : ''}>
                                ล่าสุด
                            </option>
                            <option value="recent-asc" ${this.sortBy === 'createdAt' && this.sortDirection === 'asc' ? 'selected' : ''}>
                                เก่าสุด
                            </option>
                            <option value="rating-desc" ${this.sortBy === 'rating' && this.sortDirection === 'desc' ? 'selected' : ''}>
                                คะแนนสูงสุด
                            </option>
                            <option value="rating-asc" ${this.sortBy === 'rating' && this.sortDirection === 'asc' ? 'selected' : ''}>
                                คะแนนต่ำสุด
                            </option>
                        </select>
                    </div>
                </div>
            </div>
        `;

        // User's Review (if exists and logged in)
        if (this.userReview && this.currentUserId) {
            reviewsHTML += `
                <div class="mb-6">
                    <h4 class="text-lg font-bold text-white mb-3 Thai-font">รีวิวของคุณ</h4>
                    ${ReviewCard.render(this.userReview, {
        showActions: true,
        canDelete: true,
        isCurrentUser: true
    })}
                </div>
            `;
        }

        // All Reviews
        if (this.reviews.length > 0) {
            reviewsHTML += `
                <div class="mb-4">
                    <h4 class="text-lg font-bold text-white mb-3 Thai-font">รีวิวทั้งหมด</h4>
                    <div class="space-y-4">
                        ${this.reviews
        .filter(review => review.id !== this.userReview?.id)
        .map(review => ReviewCard.render(review, {
            showActions: !!this.currentUserId,
            canReport: !!this.currentUserId,
            isCurrentUser: review.userId === this.currentUserId
        }))
        .join('')}
                    </div>
                </div>
            `;

            // Load More Button
            if (this.hasMore) {
                reviewsHTML += `
                    <div class="text-center mt-6">
                        <button id="load-more-reviews" 
                                class="px-6 py-3 bg-white/5 text-white text-sm font-bold uppercase rounded-xl hover:bg-white/10 transition-all border border-white/10">
                            โหลดเพิ่มเติม
                        </button>
                    </div>
                `;
            }
        } else {
            reviewsHTML += `
                <div class="text-center py-12">
                    <div class="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i data-lucide="message-circle" class="w-8 h-8 text-gray-500"></i>
                    </div>
                    <h4 class="text-white font-bold text-lg mb-2 Thai-font">ยังไม่มีรีวิว</h4>
                    <p class="text-gray-400 text-sm Thai-font">เป็นคนแรกที่รีวิวเนื้อหานี้!</p>
                </div>
            `;
        }

        container.innerHTML = reviewsHTML;

        // Setup event listeners
        this._setupEventListeners();

        // Refresh icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    },

    /**
     * Render loading state
     */
    renderLoading() {
        const container = document.getElementById('reviews-section');
        if (!container) {
            return;
        }

        container.innerHTML = `
            <div class="glass-premium p-6 rounded-2xl">
                <div class="animate-pulse space-y-4">
                    <div class="h-4 bg-white/10 rounded w-1/4"></div>
                    <div class="h-8 bg-white/10 rounded w-1/3"></div>
                    <div class="space-y-3">
                        <div class="h-20 bg-white/5 rounded-xl"></div>
                        <div class="h-20 bg-white/5 rounded-xl"></div>
                        <div class="h-20 bg-white/5 rounded-xl"></div>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Render error state
     */
    renderError() {
        const container = document.getElementById('reviews-section');
        if (!container) {
            return;
        }

        container.innerHTML = `
            <div class="glass-premium p-6 rounded-2xl text-center">
                <div class="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i data-lucide="alert-circle" class="w-8 h-8 text-red-500"></i>
                </div>
                <h4 class="text-white font-bold text-lg mb-2 Thai-font">เกิดข้อผิดพลาด</h4>
                <p class="text-gray-400 text-sm Thai-font">ไม่สามารถโหลดรีวิวได้ กรุณาลองใหม่</p>
                <button onclick="window.refreshReviews()" 
                        class="mt-4 px-6 py-2 bg-brand-primary text-white text-sm font-bold rounded-xl hover:scale-105 transition-all">
                    ลองใหม่
                </button>
            </div>
        `;

        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    },

    /**
     * Setup event listeners
     */
    _setupEventListeners() {
        // Sort select
        const sortSelect = document.getElementById('review-sort-select');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                const [sortBy, direction] = e.target.value.split('-');
                this.sortBy = sortBy;
                this.sortDirection = direction;
                this.currentPage = 0;
                this.loadReviews();
            });
        }

        // Load more button
        const loadMoreBtn = document.getElementById('load-more-reviews');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                this.currentPage++;
                this.loadReviews(true);
            });
        }

        // Make functions available globally
        window.refreshReviews = () => this.loadReviews();
    },

    /**
     * Get content rating from reviews
     */
    _getContentRating() {
        if (this.reviews.length === 0) {
            return { averageRating: 0, totalReviews: 0 };
        }

        const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = totalRating / this.reviews.length;

        return {
            averageRating: averageRating,
            totalReviews: this.reviews.length
        };
    },

    /**
     * Refresh after user submits a review
     */
    async refreshAfterSubmit() {
        await this.loadReviews();
        await this.loadUserReview();

        if (this.onReviewUpdate) {
            this.onReviewUpdate();
        }
    },

    /**
     * Handle review deletion
     */
    async handleDeleteReview(reviewId) {
        // eslint-disable-next-line no-alert
        if (!confirm('คุณแน่ใจหรือไม่ที่จะลบรีวิวนี้?')) {
            return;
        }

        try {
            const review = this.reviews.find(r => r.id === reviewId);
            if (!review) {
                return;
            }

            const result = await ReviewService.deleteReview(
                reviewId,
                this.contentType,
                this.contentId,
                review.rating
            );

            if (result.success) {
                // Remove from local state
                this.reviews = this.reviews.filter(r => r.id !== reviewId);
                if (this.userReview?.id === reviewId) {
                    this.userReview = null;
                }

                this.render();

                if (this.onReviewUpdate) {
                    this.onReviewUpdate();
                }

                // eslint-disable-next-line no-alert
                alert('ลบรีวิวสำเร็จ');
            } else {
                // eslint-disable-next-line no-alert
                alert('เกิดข้อผิดพลาด กรุณาลองใหม่');
            }
        } catch (error) {
            console.error('Delete review error:', error);
            // eslint-disable-next-line no-alert
            alert('เกิดข้อผิดพลาด กรุณาลองใหม่');
        }
    },

    /**
     * Handle review reporting
     */
    async handleReportReview(reviewId) {
        // eslint-disable-next-line no-alert
        const reason = prompt('กรุณาระบุเหตุผลในการรายงาน:');
        if (!reason) {
            return;
        }

        try {
            const result = await ReviewService.reportReview(reviewId, reason, this.currentUserId);

            if (result.success) {
                // eslint-disable-next-line no-alert
                alert('รายงานรีวิวสำเร็จ');
            } else {
                // eslint-disable-next-line no-alert
                alert('เกิดข้อผิดพลาด กรุณาลองใหม่');
            }
        } catch (error) {
            console.error('Report review error:', error);
            // eslint-disable-next-line no-alert
            alert('เกิดข้อผิดพลาด กรุณาลองใหม่');
        }
    }
};
