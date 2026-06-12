/**
 * 🛠️ DUYดูDEE UI UTILS
 */
export const UIUtils = {
    extractYouTubeId: (url) => {
        if (!url || typeof url !== 'string') return null;
        // Match standard watch links, share links, embed links
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    },

    escapeHTML: (str) => {
        if (typeof str !== 'string') return '';
        return str.replace(/[&<>"']/g, (match) => {
            const escapeMap = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                '\'': '&#x27;'
            };
            return escapeMap[match];
        });
    },

    getMediaWatchPath: (category, type, id) => {
        if (type === 'series') {
            if (category === 'ซีรีส์แนวตั้ง') {
                return `/watch-movie.html?id=${id}`;
            }
            return `/watch-series.html?id=${id}`;
        }
        return `/watch-movie.html?id=${id}`;
    }
};
