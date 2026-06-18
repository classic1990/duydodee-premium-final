import { RatingStars } from './RatingStars.js';
import { ReviewService } from '../services/review-service.js';

/**
 * 📝 REVIEW FORM COMPONENT
 * Form for submitting and editing reviews
 */
export const ReviewForm = {
    currentRating: 0,
    contentType: null,
    contentId: null,
    userId: null,
    userDisplayName: null,
    userEmail: null,
    existingReview: null,
    onSubmit: null,
    onCancel: null,

    /**
     * Initialize the review form
     */
    init(config) {
        this.contentType = config.contentType;
        this.contentId = config.contentId;
        this.userId = config.userId;
        this.userDisplayName = config.userDisplayName;
        this.userEmail = config.userEmail;
        this.existingReview = config.existingReview || null;
        this.onSubmit = config.onSubmit || null;
        this.onCancel = config.onCancel || null;
        this.currentRating = this.existingReview?.rating || 0;

        this.render();
    },

    /**
     * Render the review form
     */
    render() {
        const container = document.getElementById('review-form-container');
        if (!container) {
            return;
        }

        const isEditing = !!this.existingReview;
        const existingReviewText = this.existingReview?.review || '';

        container.innerHTML = `
            <div class="glass-premium-enhanced p-6 rounded-2xl relative overflow-hidden">
                <!-- Premium Background Glow -->
                <div class="absolute -top-10 -right-10 w-32 h-32 bg-brand-primary/10 rounded-full blur-3xl"></div>
                
                <div class="relative z-10">
                    <h3 class="text-xl font-black text-white uppercase tracking-widest Thai-font mb-4">
                        ${isEditing ? 'แก้ไขรีวิว' : 'เขียนรีวิว'}
                    </h3>
                    
                    <form id="review-submit-form" class="space-y-4">
                        <!-- Rating Selection -->
                        <div>
                            <label class="block text-gray-300 text-sm mb-2 Thai-font">คะแนนของคุณ</label>
                            <div id="rating-stars-container"></div>
                            <input type="hidden" id="review-rating" name="rating" value="${this.currentRating}" required>
                        </div>
                        
                        <!-- Review Text -->
                        <div>
                            <label for="review-text" class="block text-gray-300 text-sm mb-2 Thai-font">รีวิวของคุณ (ไม่บังคับ)</label>
                            <textarea 
                                id="review-text" 
                                name="review" 
                                rows="4" 
                                maxlength="1000"
                                class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all resize-none Thai-font"
                                placeholder="แชร์ความคิดเห็นของคุณเกี่ยวกับเนื้อหานี้...">${existingReviewText}</textarea>
                            <div class="text-right text-gray-500 text-xs mt-1">
                                <span id="review-char-count">0</span>/1000
                            </div>
                        </div>
                        
                        <!-- Action Buttons -->
                        <div class="flex items-center gap-3">
                            ${this.onCancel ? `
                                <button type="button" 
                                        onclick="window.cancelReviewForm()"
                                        class="px-6 py-3 bg-white/5 text-white text-sm font-bold uppercase rounded-xl hover:bg-white/10 transition-all border border-white/10">
                                    ยกเลิก
                                </button>
                            ` : ''}
                            <button type="submit" 
                                    class="flex-1 py-3 px-6 bg-gradient-to-r from-brand-primary to-brand-primary-dark text-white text-sm font-bold uppercase rounded-xl hover:scale-105 transition-all shadow-[0_0_30px_rgba(229,9,20,0.4)] hover:shadow-[0_0_50px_rgba(229,9,20,0.6)] relative overflow-hidden group">
                                <span class="relative z-10">${isEditing ? 'บันทึกการแก้ไข' : 'ส่งรีวิว'}</span>
                                <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        // Initialize interactive stars
        const ratingContainer = document.getElementById('rating-stars-container');
        if (ratingContainer) {
            ratingContainer.innerHTML = RatingStars.renderInteractive(this.currentRating, (rating) => {
                this.currentRating = rating;
                document.getElementById('review-rating').value = rating;
            });
        }

        // Setup character counter
        const textarea = document.getElementById('review-text');
        const charCount = document.getElementById('review-char-count');
        if (textarea && charCount) {
            textarea.addEventListener('input', () => {
                charCount.textContent = textarea.value.length;
            });
            // Initial count
            charCount.textContent = textarea.value.length;
        }

        // Setup form submission
        const form = document.getElementById('review-submit-form');
        if (form) {
            form.addEventListener('submit', (e) => this.handleSubmit(e));
        }

        // Make functions available globally
        window.cancelReviewForm = () => this.cancel();
    },

    /**
     * Handle form submission
     */
    async handleSubmit(event) {
        event.preventDefault();

        const rating = parseInt(document.getElementById('review-rating').value);
        const reviewText = document.getElementById('review-text').value.trim();

        // Validate rating
        if (rating < 1 || rating > 5) {
            this.showError('กรุณาให้คะแนนอย่างน้อย 1 ดาว');
            return;
        }

        // Show loading state
        this.setLoading(true);

        try {
            const result = await ReviewService.submitReview({
                contentType: this.contentType,
                contentId: this.contentId,
                userId: this.userId,
                rating: rating,
                review: reviewText,
                userName: this.userDisplayName,
                userEmail: this.userEmail
            });

            if (result.success) {
                if (this.onSubmit) {
                    this.onSubmit(result);
                }
                this.showSuccess(result.isUpdate ? 'แก้ไขรีวิวสำเร็จ!' : 'ส่งรีวิวสำเร็จ!');
            } else {
                this.showError(result.error || 'เกิดข้อผิดพลาด กรุณาลองใหม่');
            }
        } catch (error) {
            console.error('Review form submission error:', error);
            this.showError('เกิดข้อผิดพลาด กรุณาลองใหม่');
        } finally {
            this.setLoading(false);
        }
    },

    /**
     * Cancel the form
     */
    cancel() {
        if (this.onCancel) {
            this.onCancel();
        }
    },

    /**
     * Set loading state
     */
    setLoading(loading) {
        const form = document.getElementById('review-submit-form');
        const submitBtn = form?.querySelector('button[type="submit"]');

        if (submitBtn) {
            if (loading) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = `
                    <span class="relative z-10 flex items-center justify-center gap-2">
                        <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        กำลังบันทึก...
                    </span>
                `;
            } else {
                submitBtn.disabled = false;
                submitBtn.innerHTML = `
                    <span class="relative z-10">${this.existingReview ? 'บันทึกการแก้ไข' : 'ส่งรีวิว'}</span>
                    <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
                `;
            }
        }
    },

    /**
     * Show error message
     */
    showError(message) {
        // You can integrate with your existing toast/notification system
        // eslint-disable-next-line no-alert
        alert(message); // Fallback
    },

    /**
     * Show success message
     */
    showSuccess(message) {
        // You can integrate with your existing toast/notification system
        // eslint-disable-next-line no-alert
        alert(message); // Fallback
    }
};
