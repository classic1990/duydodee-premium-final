/**
 * 🔍 DUYดูDEE Search & Filtering Enhancements
 * Advanced search and filtering utilities
 */

import { ValidationUtils } from './validation-utils.js';

export const SearchEnhancements = {
    /**
     * Search with fuzzy matching
     */
    fuzzySearch: (query, data, options = {}) => {
        const {
            threshold = 0.6,
            keys = ['title'],
            caseSensitive = false
        } = options;

        if (!query || !data || data.length === 0) {
            return [];
        }

        const searchQuery = caseSensitive ? query : query.toLowerCase();

        return data.filter(item => {
            return keys.some(key => {
                const value = item[key];
                if (!value) {
                    return false;
                }

                const stringValue = caseSensitive ? String(value) : String(value).toLowerCase();

                // Exact match
                if (stringValue.includes(searchQuery)) {
                    return true;
                }

                // Fuzzy match
                return SearchEnhancements.fuzzyMatch(searchQuery, stringValue, threshold);
            });
        });
    },

    /**
     * Fuzzy string matching (Levenshtein distance based)
     */
    fuzzyMatch: (query, text, threshold = 0.6) => {
        const queryLen = query.length;
        const textLen = text.length;

        if (queryLen > textLen) {
            return false;
        }

        let matches = 0;
        let queryIdx = 0;
        let textIdx = 0;

        while (queryIdx < queryLen && textIdx < textLen) {
            if (query[queryIdx] === text[textIdx]) {
                matches++;
                queryIdx++;
            }
            textIdx++;
        }

        const matchRatio = matches / queryLen;
        return matchRatio >= threshold;
    },

    /**
     * Advanced search with filters
     */
    advancedSearch: (query, data, filters = {}) => {
        let results = data;

        // Apply text search first
        if (query) {
            results = SearchEnhancements.fuzzySearch(query, results, {
                threshold: 0.7,
                keys: ['title', 'description', 'category'],
                caseSensitive: false
            });
        }

        // Apply filters
        if (filters.category) {
            results = results.filter(item => item.category === filters.category);
        }

        if (filters.type) {
            results = results.filter(item => item.type === filters.type);
        }

        if (filters.year) {
            results = results.filter(item => item.year === parseInt(filters.year));
        }

        if (filters.rating) {
            results = results.filter(item => item.rating >= parseFloat(filters.rating));
        }

        if (filters.duration) {
            results = results.filter(item => item.duration <= parseInt(filters.duration));
        }

        // Sort results
        if (filters.sortBy) {
            results = SearchEnhancements.sortResults(results, filters.sortBy, filters.sortOrder);
        }

        return results;
    },

    /**
     * Sort results by criteria
     */
    sortResults: (data, sortBy, sortOrder = 'desc') => {
        const sorted = [...data];

        sorted.sort((a, b) => {
            let comparison = 0;

            switch (sortBy) {
            case 'title':
                comparison = a.title.localeCompare(b.title, 'th');
                break;
            case 'year':
                comparison = (a.year || 0) - (b.year || 0);
                break;
            case 'rating':
                comparison = (a.rating || 0) - (b.rating || 0);
                break;
            case 'viewCount':
                comparison = (a.viewCount || 0) - (b.viewCount || 0);
                break;
            case 'createdAt':
                comparison = new Date(a.createdAt) - new Date(b.createdAt);
                break;
            default:
                return 0;
            }

            return sortOrder === 'asc' ? comparison : -comparison;
        });

        return sorted;
    },

    /**
     * Get search suggestions
     */
    getSearchSuggestions: (query, data, limit = 5) => {
        if (!query || query.length < 2) {
            return [];
        }

        const suggestions = new Set();

        data.forEach(item => {
            const title = item.title || '';
            const category = item.category || '';

            // Title suggestions
            if (title.toLowerCase().includes(query.toLowerCase())) {
                suggestions.add(title);
            }

            // Category suggestions
            if (category.toLowerCase().includes(query.toLowerCase())) {
                suggestions.add(category);
            }
        });

        return Array.from(suggestions).slice(0, limit);
    },

    /**
     * Highlight search matches
     */
    highlightMatches: (text, query) => {
        if (!text || !query) {
            return text;
        }

        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark class="bg-brand-primary/50">$1</mark>');
    },

    /**
     * Debounced search
     */
    createDebouncedSearch: (callback, delay = 300) => {
        let timeoutId;

        return function(...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => callback.apply(this, args), delay);
        };
    },

    /**
     * Search history management
     */
    searchHistory: {
        get: () => {
            const history = localStorage.getItem('searchHistory');
            return history ? JSON.parse(history) : [];
        },

        add: (query) => {
            if (!query || query.trim().length === 0) {
                return;
            }

            const history = SearchEnhancements.searchHistory.get();
            const sanitizedQuery = ValidationUtils.sanitizeString(query);

            // Remove duplicate
            const filtered = history.filter(h => h.query !== sanitizedQuery);

            // Add to beginning
            filtered.unshift({
                query: sanitizedQuery,
                timestamp: Date.now()
            });

            // Keep only last 10
            const limited = filtered.slice(0, 10);

            localStorage.setItem('searchHistory', JSON.stringify(limited));
        },

        clear: () => {
            localStorage.removeItem('searchHistory');
        }
    },

    /**
     * Faceted search filters
     */
    getFacets: (data) => {
        const facets = {
            categories: new Set(),
            types: new Set(),
            years: new Set(),
            ratings: new Set()
        };

        data.forEach(item => {
            if (item.category) {
                facets.categories.add(item.category);
            }
            if (item.type) {
                facets.types.add(item.type);
            }
            if (item.year) {
                facets.years.add(item.year);
            }
            if (item.rating) {
                facets.ratings.add(item.rating);
            }
        });

        return {
            categories: Array.from(facets.categories).sort(),
            types: Array.from(facets.types).sort(),
            years: Array.from(facets.years).sort((a, b) => b - a),
            ratings: Array.from(facets.ratings).sort((a, b) => b - a)
        };
    }
};

export const FilteringEnhancements = {
    /**
     * Filter by multiple criteria
     */
    filterByCriteria: (data, criteria) => {
        return data.filter(item => {
            return Object.entries(criteria).every(([key, value]) => {
                // Skip null/undefined values
                if (value === null || value === undefined) {
                    return true;
                }

                // Array filter (any match)
                if (Array.isArray(value)) {
                    return value.includes(item[key]);
                }

                // Exact match
                if (typeof value === 'string' || typeof value === 'number') {
                    return item[key] === value;
                }

                // Range filter
                if (typeof value === 'object' && value.min !== undefined && value.max !== undefined) {
                    const itemValue = item[key] || 0;
                    return itemValue >= value.min && itemValue <= value.max;
                }

                // Greater than
                if (typeof value === 'object' && value.gte !== undefined) {
                    return (item[key] || 0) >= value.gte;
                }

                // Less than
                if (typeof value === 'object' && value.lte !== undefined) {
                    return (item[key] || 0) <= value.lte;
                }

                return true;
            });
        });
    },

    /**
     * Dynamic filter builder
     */
    buildFilter: (filters) => {
        const criteria = {};

        if (filters.categories?.length > 0) {
            criteria.category = filters.categories;
        }

        if (filters.types?.length > 0) {
            criteria.type = filters.types;
        }

        if (filters.yearRange) {
            criteria.year = filters.yearRange;
        }

        if (filters.ratingMin !== undefined) {
            criteria.rating = { gte: filters.ratingMin };
        }

        if (filters.durationMax !== undefined) {
            criteria.duration = { lte: filters.durationMax };
        }

        return criteria;
    },

    /**
     * Filter presets
     */
    presets: {
        trending: (data) => {
            return data.filter(item => item.isTrending).sort((a, b) => b.viewCount - a.viewCount);
        },

        newReleases: (data) => {
            const oneMonthAgo = new Date();
            oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

            return data.filter(item => {
                const createdAt = new Date(item.createdAt);
                return createdAt >= oneMonthAgo;
            }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        },

        topRated: (data, minRating = 8) => {
            return data.filter(item => item.rating >= minRating).sort((a, b) => b.rating - a.rating);
        },

        forKids: (data) => {
            const kidFriendlyCategories = ['Animation', 'Family', 'Kids'];
            return data.filter(item => kidFriendlyCategories.includes(item.category));
        }
    }
};

export default { SearchEnhancements, FilteringEnhancements };
