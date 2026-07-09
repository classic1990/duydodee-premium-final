/**
 * 🛠️ DUYดูDEE UI UTILITIES
 * Pure helper functions for the UI Engine.
 */

export const UIUtils = {
    extractYouTubeId: (url) => {
        if (!url) {
            return null;
        }
        const match = url.match(/^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/);
        return (match && match[2].length === 11) ? match[2] : null;
    },

    getMediaWatchPath: (category, type, id) => {
        const isVertical = category && (category.includes('แนวตั้ง') || category.includes('Vertical'));
        const page = (isVertical || type === 'movie' || type === 'movies') ? '/watch-movie.html' : '/watch-series.html';
        return `${page}?id=${id}`;
    },

    getSafePoster: (url) => {
        const logo = '/assets/logo/DUYDODEE.png';
        if (!url || url === '' || url.includes('DUYDODEE.png')) {
            return logo;
        }
        if (url.includes('youtube.com/watch?v=') || url.includes('youtu.be/')) {
            const match = url.match(/(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?([^&#?\s]+)/);
            const id = (match && match[1]) ? match[1] : null;
            if (id) {
                return `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
            }
        } else if (url.includes('img.youtube.com') || url.includes('firebasestorage') || url.startsWith('http')) {
            return url;
        }
        return logo;
    },

    debounce: (func, delay) => {
        let timeoutId;
        return (...args) => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            timeoutId = setTimeout(() => func.apply(null, args), delay);
        };
    },

    escapeHTML: (str) => {
        if (typeof str !== 'string') {
            return '';
        }
        return str.replace(/[&<>"']/g, m => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#039;' }[m]));
    },

    formatDate: (ts) => {
        if (!ts) {
            return 'N/A';
        }
        const d = ts.toDate ? ts.toDate() : new Date(ts);
        return d.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
    }
};



