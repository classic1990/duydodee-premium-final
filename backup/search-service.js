/**
 * 🔍 DUYดูDEE SEARCH SERVICE
 * Algolia-powered search with fallback to local search
 */

const ALGOLIA_APP_ID = import.meta.env.VITE_ALGOLIA_APP_ID || '';
const ALGOLIA_SEARCH_KEY = import.meta.env.VITE_ALGOLIA_SEARCH_KEY || '';

let searchClient = null;
let index = null;

export const SearchService = {
    /**
     * Initialize Algolia search client
     * @returns {Promise<boolean>} True if initialization successful
     */
    async init() {
        if (!ALGOLIA_APP_ID || !ALGOLIA_SEARCH_KEY) {
            console.warn('SearchService: Algolia not configured, using local search');
            return false;
        }
        try {
            const algoliasearch = (await import('algoliasearch')).default;
            searchClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_SEARCH_KEY);
            index = searchClient.initIndex('duydodee_content');
            return true;
        } catch (e) {
            console.warn('SearchService: Failed to init Algolia', e);
            return false;
        }
    },

    /**
     * Search content using Algolia
     * @param {string} query - Search query
     * @param {Object} options - Search options (hitsPerPage, etc.)
     * @returns {Promise<Array|null>} Search results or null if fallback needed
     * @example
     * const results = await SearchService.search('action', { hitsPerPage: 12 });
     */
    async search(query, options = { hitsPerPage: 20 }) {
        if (index) {
            try {
                const { hits } = await index.search(query, options);
                return hits;
            } catch (e) {
                console.warn('SearchService: Algolia failed, falling back', e);
            }
        }
        return null;
    }
};
