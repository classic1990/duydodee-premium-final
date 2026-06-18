/**
 * 📊 DUYดูDEE ANALYTICS SERVICE
 * User viewing statistics and analytics dashboard
 */

import {
    db,
    collection,
    getDocs,
    query,
    orderBy,
    SCHEMA
} from './firebase.js';

/**
 * Analytics Service for calculating user viewing statistics
 */
export const AnalyticsService = {
    /**
     * Get comprehensive viewing analytics for a user
     */
    async getUserAnalytics(userId) {
        try {
            // Get all watch history
            const historyRef = collection(db, SCHEMA.COLLECTIONS.USERS, userId, 'history');
            const q = query(historyRef, orderBy('watchedAt', 'desc'));
            const snapshot = await getDocs(q);

            const historyItems = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            if (historyItems.length === 0) {
                return this.getEmptyAnalytics();
            }

            // Calculate statistics
            const analytics = {
                totalWatchTime: this.calculateTotalWatchTime(historyItems),
                totalContentWatched: historyItems.length,
                completedContent: this.calculateCompletedContent(historyItems),
                categoryBreakdown: this.calculateCategoryBreakdown(historyItems),
                typeBreakdown: this.calculateTypeBreakdown(historyItems),
                topContent: this.getTopContent(historyItems, 5),
                viewingPatterns: this.analyzeViewingPatterns(historyItems),
                favoriteGenres: this.calculateFavoriteGenres(historyItems),
                averageCompletionRate: this.calculateAverageCompletionRate(historyItems)
            };

            return analytics;
        } catch (error) {
            console.error('Analytics Service Error:', error);
            return this.getEmptyAnalytics();
        }
    },

    /**
     * Calculate total watch time (estimated)
     */
    calculateTotalWatchTime(historyItems) {
        // Estimate: assume average content is 90 minutes
        // Use progress percentage to estimate actual watch time
        let totalMinutes = 0;

        historyItems.forEach(item => {
            const progress = item.progress || 0;
            // Estimate based on progress (0-100%)
            // Assume average content length of 90 minutes
            const estimatedMinutes = (progress / 100) * 90;
            totalMinutes += estimatedMinutes;
        });

        const hours = Math.floor(totalMinutes / 60);
        const minutes = Math.floor(totalMinutes % 60);

        return {
            totalMinutes: Math.round(totalMinutes),
            hours,
            minutes,
            formatted: `${hours} ชั่วโมง ${minutes} นาที`
        };
    },

    /**
     * Calculate completed content (progress >= 90%)
     */
    calculateCompletedContent(historyItems) {
        return historyItems.filter(item => (item.progress || 0) >= 90).length;
    },

    /**
     * Break down viewing by category
     */
    calculateCategoryBreakdown(historyItems) {
        const categories = {};

        historyItems.forEach(item => {
            const category = item.category || 'Other';
            categories[category] = (categories[category] || 0) + 1;
        });

        // Convert to array and sort
        return Object.entries(categories)
            .map(([name, count]) => ({
                name,
                count,
                percentage: Math.round((count / historyItems.length) * 100)
            }))
            .sort((a, b) => b.count - a.count);
    },

    /**
     * Break down viewing by type (movie vs series)
     */
    calculateTypeBreakdown(historyItems) {
        const types = { movie: 0, series: 0 };

        historyItems.forEach(item => {
            const type = item.type || 'movie';
            types[type] = (types[type] || 0) + 1;
        });

        return {
            movie: {
                count: types.movie,
                percentage: Math.round((types.movie / historyItems.length) * 100)
            },
            series: {
                count: types.series,
                percentage: Math.round((types.series / historyItems.length) * 100)
            }
        };
    },

    /**
     * Get top content by watch frequency or progress
     */
    getTopContent(historyItems, limit = 5) {
        // Group by content ID
        const contentMap = new Map();

        historyItems.forEach(item => {
            const contentId = item.id;
            if (!contentMap.has(contentId)) {
                contentMap.set(contentId, {
                    id: contentId,
                    title: item.title || 'Unknown',
                    poster: item.poster || item.posterURL,
                    category: item.category,
                    type: item.type,
                    watchCount: 0,
                    maxProgress: 0
                });
            }

            const content = contentMap.get(contentId);
            content.watchCount++;
            content.maxProgress = Math.max(content.maxProgress, item.progress || 0);
        });

        // Sort by watch count, then by progress
        return Array.from(contentMap.values())
            .sort((a, b) => {
                if (b.watchCount !== a.watchCount) {
                    return b.watchCount - a.watchCount;
                }
                return b.maxProgress - a.maxProgress;
            })
            .slice(0, limit);
    },

    /**
     * Analyze viewing patterns by time of day
     */
    analyzeViewingPatterns(historyItems) {
        const timeSlots = {
            morning: { count: 0, label: 'เช้า (6AM-12PM)' },    // 6-12
            afternoon: { count: 0, label: 'บ่าย (12PM-6PM)' },  // 12-18
            evening: { count: 0, label: 'ค่ำ (6PM-12AM)' },     // 18-24
            night: { count: 0, label: 'ดึก (12AM-6AM)' }       // 0-6
        };

        historyItems.forEach(item => {
            if (item.watchedAt) {
                const date = item.watchedAt.toDate ? item.watchedAt.toDate() : new Date(item.watchedAt);
                const hour = date.getHours();

                if (hour >= 6 && hour < 12) {
                    timeSlots.morning.count++;
                } else if (hour >= 12 && hour < 18) {
                    timeSlots.afternoon.count++;
                } else if (hour >= 18 && hour < 24) {
                    timeSlots.evening.count++;
                } else {
                    timeSlots.night.count++;
                }
            }
        });

        // Find most popular time slot
        const total = historyItems.length;
        let maxSlot = 'evening';
        let maxCount = 0;

        Object.entries(timeSlots).forEach(([key, value]) => {
            value.percentage = total > 0 ? Math.round((value.count / total) * 100) : 0;
            if (value.count > maxCount) {
                maxCount = value.count;
                maxSlot = key;
            }
        });

        return {
            slots: timeSlots,
            peakTime: timeSlots[maxSlot]
        };
    },

    /**
     * Calculate favorite genres based on categories
     */
    calculateFavoriteGenres(historyItems) {
        const genreCount = {};

        historyItems.forEach(item => {
            const category = item.category || 'Other';
            genreCount[category] = (genreCount[category] || 0) + 1;
        });

        return Object.entries(genreCount)
            .map(([name, count]) => ({
                name,
                count
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 3);
    },

    /**
     * Calculate average completion rate
     */
    calculateAverageCompletionRate(historyItems) {
        if (historyItems.length === 0) {
            return 0;
        }

        const totalProgress = historyItems.reduce((sum, item) => {
            return sum + (item.progress || 0);
        }, 0);

        return Math.round(totalProgress / historyItems.length);
    },

    /**
     * Get empty analytics structure
     */
    getEmptyAnalytics() {
        return {
            totalWatchTime: {
                totalMinutes: 0,
                hours: 0,
                minutes: 0,
                formatted: '0 ชั่วโมง 0 นาที'
            },
            totalContentWatched: 0,
            completedContent: 0,
            categoryBreakdown: [],
            typeBreakdown: {
                movie: { count: 0, percentage: 0 },
                series: { count: 0, percentage: 0 }
            },
            topContent: [],
            viewingPatterns: {
                slots: {},
                peakTime: { label: 'ยังไม่มีข้อมูล', count: 0, percentage: 0 }
            },
            favoriteGenres: [],
            averageCompletionRate: 0
        };
    }
};
