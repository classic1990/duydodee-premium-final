import { UIUtils } from '../utils/ui-utils.js';

const ALGOLIA_APP_ID = import.meta.env.VITE_ALGOLIA_APP_ID || '';
const ALGOLIA_SEARCH_KEY = import.meta.env.VITE_ALGOLIA_SEARCH_KEY || '';

let searchClient = null;
let index = null;

export const SearchService = {
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
