import { RatingStars } from './RatingStars.js';
import { UIUtils } from '../utils/ui-utils.js';

/**
 * 📝 REVIEW CARD COMPONENT
 * Displays individual review with rating and user info
 */
export const ReviewCard = {
    /**
     * Render a single review card
     */
    render(review, options = {}) {
        const {
            showActions = false,
            canDelete = false,
            canReport = false,
            onDelete = null,
            onReport = null,
            isCurrentUser = false
        } = options;

        const {
            id,
            rating,
            review: reviewText,
            userName,
            userEmail,
            createdAt,
            updatedAt
        } = review;

        const formattedDate = this._formatDate(createdAt || updatedAt);
        const displayName = userName || 'Anonymous';
        const userInitial = displayName.charAt(0).toUpperCase();

        let actionsHTML = '';
        if (showActions) {
            if (isCurrentUser && canDelete && onDelete) {
                actionsHTML += `
                    <button onclick="window.handleDeleteReview('${id}')" 
                            class="text-red-500 hover:text-red-400 text-xs flex items-center gap-1 transition-colors">
                        <i data-lucide="trash-2" class="w-3 h-3"></i>
                        <span class="hidden sm:inline">ลบ</span>
                    </button>
                `;
            }
            if (canReport && !isCurrentUser && onReport) {
                actionsHTML += `
                    <button onclick="window.handleReportReview('${id}')" 
                            class="text-yellow-500 hover:text-yellow-400 text-xs flex items-center gap-1 transition-colors">
                        <i data-lucide="flag" class="w-3 h-3"></i>
                        <span class="hidden sm:inline">รายงาน</span>
                    </button>
                `;
            }
        }

        return `
            <div class="glass-premium-enhanced p-4 sm:p-6 rounded-2xl relative overflow-hidden" data-review-id="${id}">
                <!-- Premium Background Glow -->
                <div class="absolute -top-6 -right-6 w-24 h-24 bg-brand-primary/5 rounded-full blur-2xl"></div>
                
                <div class="relative z-10">
                    <!-- Header -->
                    <div class="flex items-start justify-between mb-3">
                        <div class="flex items-center gap-3">
                            <!-- User Avatar -->
                            <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-brand-primary to-brand-primary-dark flex items-center justify-center text-white font-bold text-sm sm:text-base">
                                ${userInitial}
                            </div>
                            
                            <!-- User Info -->
                            <div>
                                <h4 class="text-white font-bold text-sm sm:text-base Thai-font">${UIUtils.escapeHTML(displayName)}</h4>
                                <p class="text-gray-400 text-xs">${formattedDate}</p>
                            </div>
                        </div>
                        
                        <!-- Rating -->
                        <div class="flex-shrink-0">
                            ${RatingStars.render(rating, 'sm', false)}
                        </div>
                    </div>
                    
                    <!-- Review Text -->
                    ${reviewText ? `
                        <p class="text-gray-300 text-sm leading-relaxed line-clamp-4 sm:line-clamp-none Thai-font mb-3">
                            ${UIUtils.escapeHTML(reviewText)}
                        </p>
                    ` : ''}
                    
                    <!-- Actions -->
                    ${actionsHTML ? `
                        <div class="flex items-center gap-3 mt-3 pt-3 border-t border-white/10">
                            ${actionsHTML}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    },

    /**
     * Render review card in compact mode (for lists)
     */
    renderCompact(review) {
        const {
            rating,
            review: reviewText,
            userName,
            createdAt
        } = review;

        const formattedDate = this._formatDate(createdAt);
        const displayName = userName || 'Anonymous';

        return `
            <div class="glass-premium p-3 rounded-xl">
                <div class="flex items-center gap-2 mb-2">
                    <span class="text-white font-bold text-xs">${UIUtils.escapeHTML(displayName)}</span>
                    <span class="text-gray-500 text-xs">${formattedDate}</span>
                    ${RatingStars.render(rating, 'xs', false)}
                </div>
                ${reviewText ? `
                    <p class="text-gray-400 text-xs line-clamp-2 Thai-font">
                        ${UIUtils.escapeHTML(reviewText)}
                    </p>
                ` : ''}
            </div>
        `;
    },

    /**
     * Render review card for admin view
     */
    renderAdmin(review) {
        const {
            id,
            rating,
            review: reviewText,
            userName,
            userEmail,
            userId,
            movieId,
            seriesId,
            contentType = movieId ? 'movie' : 'series',
            contentId = movieId || seriesId,
            createdAt,
            reported,
            reportedReason
        } = review;

        const formattedDate = this._formatDate(createdAt);
        const displayName = userName || 'Anonymous';

        return `
            <div class="glass-premium p-4 rounded-xl border ${reported ? 'border-red-500/50' : 'border-white/10'}" data-review-id="${id}">
                <div class="flex items-start justify-between mb-3">
                    <div class="flex-1">
                        <div class="flex items-center gap-2 mb-1">
                            <h4 class="text-white font-bold text-sm">${UIUtils.escapeHTML(displayName)}</h4>
                            ${reported ? `
                                <span class="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full">รายงาน</span>
                            ` : ''}
                        </div>
                        <p class="text-gray-400 text-xs">${userEmail || ''}</p>
                        <p class="text-gray-500 text-xs">${formattedDate}</p>
                    </div>
                    ${RatingStars.render(rating, 'sm', false)}
                </div>
                
                ${reviewText ? `
                    <p class="text-gray-300 text-sm mb-3 line-clamp-3">
                        ${UIUtils.escapeHTML(reviewText)}
                    </p>
                ` : ''}
                
                ${reported && reportedReason ? `
                    <div class="mb-3 p-2 bg-red-500/10 rounded-lg">
                        <p class="text-red-400 text-xs"><strong>เหตุผลการรายงาน:</strong> ${UIUtils.escapeHTML(reportedReason)}</p>
                    </div>
                ` : ''}
                
                <div class="flex items-center gap-2 mt-3 pt-3 border-t border-white/10">
                    <a href="/watch-${contentType}.html?id=${contentId}" 
                       target="_blank"
                       class="text-brand-primary hover:text-brand-primary-light text-xs flex items-center gap-1">
                        <i data-lucide="external-link" class="w-3 h-3"></i>
                        ดูเนื้อหา
                    </a>
                    <button onclick="window.adminDeleteReview('${id}', '${contentType}', '${contentId}')" 
                            class="text-red-500 hover:text-red-400 text-xs flex items-center gap-1">
                        <i data-lucide="trash-2" class="w-3 h-3"></i>
                        ลบรีวิว
                    </button>
                    ${reported ? `
                        <button onclick="window.adminClearReport('${id}')" 
                                class="text-green-500 hover:text-green-400 text-xs flex items-center gap-1">
                            <i data-lucide="check-circle" class="w-3 h-3"></i>
                            ยกเลิกรายงาน
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    },

    /**
     * Format date for display
     */
    _formatDate(timestamp) {
        if (!timestamp) {
            return '';
        }

        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) {
            return 'เมื่อสักครู่';
        }
        if (diffMins < 60) {
            return `${diffMins} นาทีที่แล้ว`;
        }
        if (diffHours < 24) {
            return `${diffHours} ชั่วโมงที่แล้ว`;
        }
        if (diffDays < 7) {
            return `${diffDays} วันที่แล้ว`;
        }

        return date.toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
};
