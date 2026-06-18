import {
    db,
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp,
    runTransaction
} from './firebase.js';
import { SCHEMA } from '../constants.js';

/**
 * ⭐ DUYดูDEE REVIEW SERVICE
 * Manages user reviews and ratings for movies and series
 */
export const ReviewService = {
    /**
     * Get reviews for a specific movie or series
     */
    async getReviews(contentType, contentId, options = {}) {
        try {
            const {
                limitCount = 10,
                sortBy = 'createdAt',
                direction = 'desc'
            } = options;

            const q = query(
                collection(db, SCHEMA.COLLECTIONS.REVIEWS),
                where(contentType === 'movie' ? 'movieId' : 'seriesId', '==', contentId),
                orderBy(sortBy, direction),
                limit(limitCount)
            );

            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('ReviewService Error [getReviews]:', error);
            return [];
        }
    },

    /**
     * Get a specific review by user and content
     */
    async getUserReview(contentType, contentId, userId) {
        try {
            const q = query(
                collection(db, SCHEMA.COLLECTIONS.REVIEWS),
                where(contentType === 'movie' ? 'movieId' : 'seriesId', '==', contentId),
                where('userId', '==', userId),
                limit(1)
            );

            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
                return {
                    id: snapshot.docs[0].id,
                    ...snapshot.docs[0].data()
                };
            }
            return null;
        } catch (error) {
            console.error('ReviewService Error [getUserReview]:', error);
            return null;
        }
    },

    /**
     * Create or update a review
     */
    async submitReview(reviewData) {
        try {
            const {
                contentType,
                contentId,
                userId,
                rating,
                review,
                userName,
                userEmail
            } = reviewData;

            // Validate rating
            if (rating < 1 || rating > 5) {
                throw new Error('Rating must be between 1 and 5');
            }

            // Check if user already reviewed
            const existingReview = await this.getUserReview(contentType, contentId, userId);

            const reviewDataObj = {
                [contentType === 'movie' ? 'movieId' : 'seriesId']: contentId,
                userId,
                rating,
                review: review || '',
                userName: userName || 'Anonymous',
                userEmail: userEmail || '',
                updatedAt: serverTimestamp()
            };

            let reviewId;
            let isUpdate = false;

            if (existingReview) {
                // Update existing review
                reviewId = existingReview.id;
                await updateDoc(doc(db, SCHEMA.COLLECTIONS.REVIEWS, reviewId), reviewDataObj);
                isUpdate = true;
            } else {
                // Create new review
                reviewDataObj.createdAt = serverTimestamp();
                const newReviewRef = doc(collection(db, SCHEMA.COLLECTIONS.REVIEWS));
                reviewId = newReviewRef.id;
                await setDoc(newReviewRef, reviewDataObj);
            }

            // Update content's rating statistics
            await this._updateContentRating(contentType, contentId, rating, isUpdate ? existingReview.rating : null);

            return {
                success: true,
                reviewId,
                isUpdate
            };
        } catch (error) {
            console.error('ReviewService Error [submitReview]:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    /**
     * Delete a review
     */
    async deleteReview(reviewId, contentType, contentId, rating) {
        try {
            await deleteDoc(doc(db, SCHEMA.COLLECTIONS.REVIEWS, reviewId));

            // Update content's rating statistics
            await this._updateContentRating(contentType, contentId, null, rating);

            return { success: true };
        } catch (error) {
            console.error('ReviewService Error [deleteReview]:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    /**
     * Get average rating and total reviews for content
     */
    async getContentRating(contentType, contentId) {
        try {
            const contentDoc = await getDoc(
                doc(
                    db,
                    contentType === 'movie' ? SCHEMA.COLLECTIONS.MOVIES : SCHEMA.COLLECTIONS.SERIES,
                    contentId
                )
            );

            if (contentDoc.exists()) {
                const data = contentDoc.data();
                return {
                    averageRating: data.averageRating || 0,
                    totalReviews: data.totalReviews || 0
                };
            }

            return { averageRating: 0, totalReviews: 0 };
        } catch (error) {
            console.error('ReviewService Error [getContentRating]:', error);
            return { averageRating: 0, totalReviews: 0 };
        }
    },

    /**
     * Get all reviews by a specific user
     */
    async getUserReviews(userId, options = {}) {
        try {
            const { limitCount = 20, sortBy = 'createdAt', direction = 'desc' } = options;

            const q = query(
                collection(db, SCHEMA.COLLECTIONS.REVIEWS),
                where('userId', '==', userId),
                orderBy(sortBy, direction),
                limit(limitCount)
            );

            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('ReviewService Error [getUserReviews]:', error);
            return [];
        }
    },

    /**
     * Get recent reviews across all content (for admin)
     */
    async getRecentReviews(limitCount = 50) {
        try {
            const q = query(
                collection(db, SCHEMA.COLLECTIONS.REVIEWS),
                orderBy('createdAt', 'desc'),
                limit(limitCount)
            );

            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('ReviewService Error [getRecentReviews]:', error);
            return [];
        }
    },

    /**
     * Report a review (for moderation)
     */
    async reportReview(reviewId, reason, reporterId) {
        try {
            await updateDoc(doc(db, SCHEMA.COLLECTIONS.REVIEWS, reviewId), {
                reported: true,
                reportedBy: reporterId,
                reportedReason: reason,
                reportedAt: serverTimestamp()
            });

            return { success: true };
        } catch (error) {
            console.error('ReviewService Error [reportReview]:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    /**
     * Get reported reviews (for admin)
     */
    async getReportedReviews() {
        try {
            const q = query(
                collection(db, SCHEMA.COLLECTIONS.REVIEWS),
                where('reported', '==', true),
                orderBy('reportedAt', 'desc')
            );

            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('ReviewService Error [getReportedReviews]:', error);
            return [];
        }
    },

    /**
     * Admin: Delete review and clear report
     */
    async adminDeleteReview(reviewId) {
        try {
            const reviewDoc = await getDoc(doc(db, SCHEMA.COLLECTIONS.REVIEWS, reviewId));
            if (!reviewDoc.exists()) {
                throw new Error('Review not found');
            }

            const reviewData = reviewDoc.data();
            const contentType = reviewData.movieId ? 'movie' : 'series';
            const contentId = reviewData.movieId || reviewData.seriesId;

            await deleteDoc(doc(db, SCHEMA.COLLECTIONS.REVIEWS, reviewId));

            // Update content rating
            await this._updateContentRating(contentType, contentId, null, reviewData.rating);

            return { success: true };
        } catch (error) {
            console.error('ReviewService Error [adminDeleteReview]:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    /**
     * Admin: Clear report from review
     */
    async clearReviewReport(reviewId) {
        try {
            await updateDoc(doc(db, SCHEMA.COLLECTIONS.REVIEWS, reviewId), {
                reported: false,
                reportedBy: null,
                reportedReason: null,
                reportedAt: null
            });

            return { success: true };
        } catch (error) {
            console.error('ReviewService Error [clearReviewReport]:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    /**
     * Internal method to update content rating statistics
     */
    async _updateContentRating(contentType, contentId, newRating, oldRating) {
        try {
            const contentRef = doc(
                db,
                contentType === 'movie' ? SCHEMA.COLLECTIONS.MOVIES : SCHEMA.COLLECTIONS.SERIES,
                contentId
            );

            await runTransaction(db, async (transaction) => {
                const contentDoc = await transaction.get(contentRef);
                if (!contentDoc.exists()) {
                    throw new Error('Content does not exist');
                }

                const data = contentDoc.data();
                let totalReviews = data.totalReviews || 0;
                let ratingSum = (data.averageRating || 0) * totalReviews;

                if (newRating && !oldRating) {
                    // New review added
                    totalReviews += 1;
                    ratingSum += newRating;
                } else if (!newRating && oldRating) {
                    // Review deleted
                    totalReviews = Math.max(0, totalReviews - 1);
                    ratingSum = Math.max(0, ratingSum - oldRating);
                } else if (newRating && oldRating) {
                    // Review updated
                    ratingSum = ratingSum - oldRating + newRating;
                }

                const newAverageRating = totalReviews > 0 ? ratingSum / totalReviews : 0;

                transaction.update(contentRef, {
                    totalReviews,
                    averageRating: newAverageRating
                });
            });
        } catch (error) {
            console.error('ReviewService Error [_updateContentRating]:', error);
            throw error;
        }
    }
};
