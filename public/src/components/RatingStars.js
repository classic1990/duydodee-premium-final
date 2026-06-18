/**
 * ⭐ RATING STARS COMPONENT
 * Displays star ratings for movies and series
 */
export const RatingStars = {
    /**
     * Render static star display (read-only)
     */
    render(rating, size = 'sm', showCount = true, totalReviews = 0) {
        const sizeClasses = {
            xs: 'w-3 h-3',
            sm: 'w-4 h-4',
            md: 'w-5 h-5',
            lg: 'w-6 h-6'
        };

        const starSize = sizeClasses[size] || sizeClasses.sm;
        const filledStars = Math.round(rating);
        const hasHalfStar = rating % 1 >= 0.5;

        let starsHTML = '';

        // Filled stars
        for (let i = 0; i < filledStars; i++) {
            starsHTML += `
                <svg class="${starSize} fill-brand-primary text-brand-primary" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
            `;
        }

        // Half star
        if (hasHalfStar) {
            starsHTML += `
                <svg class="${starSize} text-brand-primary" viewBox="0 0 24 24" fill="currentColor">
                    <defs>
                        <linearGradient id="half-star-${size}">
                            <stop offset="50%" stop-color="currentColor"/>
                            <stop offset="50%" stop-color="#374151" stop-opacity="0.3"/>
                        </linearGradient>
                    </defs>
                    <path fill="url(#half-star-${size})" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
            `;
        }

        // Empty stars
        const emptyStars = 5 - filledStars - (hasHalfStar ? 1 : 0);
        for (let i = 0; i < emptyStars; i++) {
            starsHTML += `
                <svg class="${starSize} fill-gray-700 text-gray-700" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
            `;
        }

        let countHTML = '';
        if (showCount && totalReviews > 0) {
            countHTML = `<span class="text-gray-400 text-xs ml-1">(${totalReviews.toLocaleString()})</span>`;
        }

        return `
            <div class="flex items-center">
                <div class="flex items-center gap-0.5">
                    ${starsHTML}
                </div>
                ${countHTML}
            </div>
        `;
    },

    /**
     * Render interactive star rating (for review form)
     */
    renderInteractive(currentRating = 0, onRate = null) {
        const containerId = 'rating-stars-interactive';

        const html = `
            <div id="${containerId}" class="flex items-center gap-1">
                ${this._renderInteractiveStars(currentRating, onRate)}
                <span class="text-brand-primary font-bold text-sm ml-2">${currentRating}/5</span>
            </div>
        `;

        // Add event listeners after rendering
        setTimeout(() => {
            const container = document.getElementById(containerId);
            if (container) {
                const stars = container.querySelectorAll('.interactive-star');
                stars.forEach((star, index) => {
                    star.addEventListener('mouseenter', () => {
                        this._highlightStars(container, index + 1);
                    });
                    star.addEventListener('mouseleave', () => {
                        this._highlightStars(container, currentRating);
                    });
                    star.addEventListener('click', () => {
                        const newRating = index + 1;
                        this._highlightStars(container, newRating);
                        container.querySelector('.rating-value').textContent = `${newRating}/5`;
                        if (onRate) {
                            onRate(newRating);
                        }
                    });
                });
            }
        }, 0);

        return html;
    },

    /**
     * Render interactive stars HTML
     */
    _renderInteractiveStars(currentRating, onRate) {
        let starsHTML = '';
        for (let i = 1; i <= 5; i++) {
            const isFilled = i <= currentRating;
            starsHTML += `
                <button type="button" 
                        class="interactive-star w-6 h-6 transition-transform hover:scale-110 focus:outline-none"
                        data-rating="${i}"
                        aria-label="Rate ${i} stars">
                    <svg class="w-full h-full ${isFilled ? 'fill-brand-primary text-brand-primary' : 'fill-gray-700 text-gray-700'}" 
                         viewBox="0 0 24 24" 
                         fill="currentColor">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                </button>
            `;
        }
        return starsHTML;
    },

    /**
     * Highlight stars up to a certain rating
     */
    _highlightStars(container, rating) {
        const stars = container.querySelectorAll('.interactive-star');
        stars.forEach((star, index) => {
            const svg = star.querySelector('svg');
            if (index < rating) {
                svg.classList.remove('fill-gray-700', 'text-gray-700');
                svg.classList.add('fill-brand-primary', 'text-brand-primary');
            } else {
                svg.classList.remove('fill-brand-primary', 'text-brand-primary');
                svg.classList.add('fill-gray-700', 'text-gray-700');
            }
        });
    },

    /**
     * Render simple numeric rating badge
     */
    renderBadge(rating, totalReviews = 0) {
        if (rating === 0 || totalReviews === 0) {
            return '';
        }

        return `
            <div class="flex items-center gap-1 px-2 py-1 bg-brand-primary/20 rounded-lg border border-brand-primary/40">
                <svg class="w-3 h-3 fill-brand-primary text-brand-primary" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <span class="text-brand-primary font-bold text-xs">${rating.toFixed(1)}</span>
            </div>
        `;
    }
};
