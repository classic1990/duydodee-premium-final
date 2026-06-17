/**
 * 🎯 DUYดูDEE RECOMMENDATION SERVICE
 * Personalized content recommendations based on user behavior
 */

import { db, doc, getDoc, collection, getDocs, query, where, orderBy, limit } from './firebase-config.js';
import { SCHEMA } from '../constants.js';

export const RecommendationService = {
    /**
     * Get personalized recommendations for a user
     * @param {string} userId - User ID
     * @param {Object} options - Options for recommendations
     * @returns {Promise<Array>} Recommended items
     */
    async getRecommendations(userId, options = {}) {
        const {
            limitCount = 12,
            excludeIds = [],
            includeWatched = false
        } = options;

        if (!userId) {
            return this.getPopularContent(limitCount, excludeIds);
        }

        try {
            // Get user preferences
            const userDoc = await getDoc(doc(db, SCHEMA.COLLECTIONS.USERS, userId));
            if (!userDoc.exists()) {
                return this.getPopularContent(limitCount, excludeIds);
            }

            const userData = userDoc.data();
            const preferredCategories = userData.preferredCategories || {};

            // Get user's watch history for better recommendations
            const watchHistory = await this.getWatchHistory(userId, 20);

            // Generate recommendations based on multiple factors
            const recommendations = await this.generateRecommendations(
                preferredCategories,
                watchHistory,
                limitCount,
                excludeIds,
                includeWatched
            );

            return recommendations;
        } catch (error) {
            console.error('Recommendation Error:', error);
            return this.getPopularContent(limitCount, excludeIds);
        }
    },

    /**
     * Generate recommendations based on user preferences and history
     */
    async generateRecommendations(preferredCategories, watchHistory, limitCount, excludeIds, includeWatched) {
        const recommendations = [];
        const watchedIds = includeWatched ? [] : watchHistory.map(h => h.id);
        const allExcludeIds = [...new Set([...excludeIds, ...watchedIds])];

        // Strategy 1: Recommend based on preferred categories
        const categoryBased = await this.getCategoryBasedRecommendations(
            preferredCategories,
            Math.floor(limitCount / 2),
            allExcludeIds
        );
        recommendations.push(...categoryBased);

        // Strategy 2: Recommend similar to watched content
        if (watchHistory.length > 0) {
            const similarBased = await this.getSimilarBasedRecommendations(
                watchHistory,
                Math.floor(limitCount / 4),
                allExcludeIds
            );
            recommendations.push(...similarBased);
        }

        // Strategy 3: Fill with popular content if needed
        if (recommendations.length < limitCount) {
            const popular = await this.getPopularContent(
                limitCount - recommendations.length,
                allExcludeIds
            );
            recommendations.push(...popular);
        }

        // Remove duplicates and limit
        const uniqueRecommendations = this.removeDuplicates(recommendations);
        return uniqueRecommendations.slice(0, limitCount);
    },

    /**
     * Get recommendations based on user's preferred categories
     */
    async getCategoryBasedRecommendations(preferredCategories, limitCount, excludeIds) {
        if (!preferredCategories || Object.keys(preferredCategories).length === 0) {
            return [];
        }

        // Sort categories by preference count
        const sortedCategories = Object.entries(preferredCategories)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([category]) => category);

        try {
            // Get content from top categories
            const { items } = await ContentService.fetchItemsByCategory(
                ['movie', 'series'],
                sortedCategories,
                { pageSize: limitCount, sortBy: 'views', direction: 'desc' }
            );

            return items.filter(item => !excludeIds.includes(item.id));
        } catch (error) {
            console.error('Category Recommendation Error:', error);
            return [];
        }
    },

    /**
     * Get recommendations based on similar content to what user watched
     */
    async getSimilarBasedRecommendations(watchHistory, limitCount, excludeIds) {
        // Get categories from watch history
        const categories = [...new Set(watchHistory.map(h => h.category))];

        try {
            // Get content from same categories but not watched
            const { items } = await ContentService.fetchItemsByCategory(
                ['movie', 'series'],
                categories,
                { pageSize: limitCount * 2, sortBy: 'rating', direction: 'desc' }
            );

            return items
                .filter(item => !excludeIds.includes(item.id))
                .slice(0, limitCount);
        } catch (error) {
            console.error('Similar Recommendation Error:', error);
            return [];
        }
    },

    /**
     * Get popular content as fallback
     */
    async getPopularContent(limitCount, excludeIds = []) {
        try {
            const { items } = await ContentService.fetchItemsByCategory(
                ['movie', 'series'],
                null,
                {
                    pageSize: limitCount + excludeIds.length,
                    sortBy: 'views',
                    direction: 'desc',
                    isAllCategories: true
                }
            );

            return items.filter(item => !excludeIds.includes(item.id)).slice(0, limitCount);
        } catch (error) {
            console.error('Popular Content Error:', error);
            return [];
        }
    },

    /**
     * Get user's watch history
     */
    async getWatchHistory(userId, count) {
        try {
            const { getWatchHistory } = await import('./firebase.js');
            return await getWatchHistory(userId, count);
        } catch (error) {
            console.error('Watch History Error:', error);
            return [];
        }
    },

    /**
     * Remove duplicate items from recommendations
     */
    removeDuplicates(items) {
        const seen = new Set();
        return items.filter(item => {
            if (seen.has(item.id)) {
                return false;
            }
            seen.add(item.id);
            return true;
        });
    },

    /**
     * Get "Because you watched" recommendations
     */
    async getBecauseYouWatched(watchedItem, limitCount = 6) {
        if (!watchedItem || !watchedItem.category) {
            return this.getPopularContent(limitCount);
        }

        try {
            const related = await ContentService.getRelatedItems(
                watchedItem.type,
                watchedItem.category,
                watchedItem.id,
                limitCount + 1
            );

            return related.filter(item => item.id !== watchedItem.id).slice(0, limitCount);
        } catch (error) {
            console.error('Because You Watched Error:', error);
            return this.getPopularContent(limitCount);
        }
    },

    /**
     * Get trending recommendations
     */
    async getTrendingRecommendations(limitCount = 12) {
        return this.getPopularContent(limitCount);
    },

    /**
     * Get new releases recommendations
     */
    async getNewReleases(limitCount = 12) {
        try {
            const { items } = await ContentService.fetchItemsByCategory(
                ['movie', 'series'],
                null,
                {
                    pageSize: limitCount,
                    sortBy: 'createdAt',
                    direction: 'desc',
                    isAllCategories: true
                }
            );

            return items;
        } catch (error) {
            console.error('New Releases Error:', error);
            return [];
        }
    }
};

// Import ContentService dynamically to avoid circular dependencies
let ContentService;
(async () => {
    const module = await import('./content-service.js');
    ContentService = module.ContentService || module.default?.ContentService;
})();
