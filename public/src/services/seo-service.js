/**
 * 🔍 DUYดูDEE SEO SERVICE
 * Dynamic SEO optimization for content pages
 */

export const SEOService = {
    /**
     * Set dynamic meta tags for content pages
     * @param {Object} metadata - SEO metadata
     */
    setMetaTags(metadata) {
        if (!metadata) {
            return;
        }

        const {
            title,
            description,
            image,
            type = 'website',
            url = window.location.href,
            keywords = []
        } = metadata;

        // Update document title
        document.title = `${title} | DUYดูDEE PREMIUM`;

        // Update or create meta tags
        this.updateMetaTag('description', description);
        this.updateMetaTag('keywords', keywords.join(', '));

        // Update Open Graph tags
        this.updateMetaTag('og:title', title, 'property');
        this.updateMetaTag('og:description', description, 'property');
        this.updateMetaTag('og:image', image, 'property');
        this.updateMetaTag('og:url', url, 'property');
        this.updateMetaTag('og:type', type, 'property');

        // Update Twitter Card tags
        this.updateMetaTag('twitter:title', title, 'name');
        this.updateMetaTag('twitter:description', description, 'name');
        this.updateMetaTag('twitter:image', image, 'name');
        this.updateMetaTag('twitter:card', 'summary_large_image', 'name');

        // Update canonical URL
        this.updateCanonicalUrl(url);
    },

    /**
     * Update or create a meta tag
     */
    updateMetaTag(name, content, attribute = 'name') {
        let tag = document.querySelector(`meta[${attribute}="${name}"]`);

        if (!tag) {
            tag = document.createElement('meta');
            tag.setAttribute(attribute, name);
            document.head.appendChild(tag);
        }

        if (content) {
            tag.setAttribute('content', content);
        }
    },

    /**
     * Update canonical URL
     */
    updateCanonicalUrl(url) {
        let canonical = document.querySelector('link[rel="canonical"]');

        if (!canonical) {
            canonical = document.createElement('link');
            canonical.rel = 'canonical';
            document.head.appendChild(canonical);
        }

        canonical.href = url;
    },

    /**
     * Set structured data (Schema.org)
     * @param {Object} data - Structured data object
     */
    setStructuredData(data) {
        // Remove existing structured data
        const existing = document.getElementById('structured-data');
        if (existing) {
            existing.remove();
        }

        // Create new structured data
        const script = document.createElement('script');
        script.id = 'structured-data';
        script.type = 'application/ld+json';
        script.text = JSON.stringify(data);
        document.head.appendChild(script);
    },

    /**
     * Generate Movie/Series structured data
     */
    generateMovieSchema(item) {
        return {
            '@context': 'https://schema.org',
            '@type': item.type === 'series' ? 'TVSeries' : 'Movie',
            'name': item.title,
            'description': item.description || `ดู${item.type === 'series' ? 'ซีรีส์' : 'หนัง'} ${item.title} คุณภาพสูงระดับ 4K HDR บน DUYดูDEE PREMIUM`,
            'image': item.poster || item.posterURL,
            'url': `${window.location.origin}${this.getMediaWatchPath(item.category, item.type, item.id)}`,
            'genre': item.category,
            'datePublished': item.createdAt || new Date().toISOString(),
            'potentialAction': {
                '@type': 'WatchAction',
                'target': `${window.location.origin}${this.getMediaWatchPath(item.category, item.type, item.id)}`
            }
        };
    },

    /**
     * Generate Organization schema
     */
    generateOrganizationSchema() {
        return {
            '@context': 'https://schema.org',
            '@type': 'Organization',
            'name': 'DUYดูDEE PREMIUM',
            'alternateName': 'DUYดูDEE',
            'url': 'https://duydodeesport.web.app/',
            'logo': 'https://duydodeesport.web.app/assets/logo/DUYDODEE.png',
            'description': 'สัมผัสประสบการณ์การรับชมภาพยนตร์และซีรีส์แนวตั้งคุณภาพสูงระดับ 4K HDR ที่ดีที่สุด',
            'sameAs': [
                'https://www.facebook.com/duydodee',
                'https://twitter.com/duydodee',
                'https://www.instagram.com/duydodee'
            ]
        };
    },

    /**
     * Generate WebSite schema
     */
    generateWebSiteSchema() {
        return {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            'name': 'DUYดูDEE PREMIUM',
            'alternateName': 'DUYดูDEE',
            'url': 'https://duydodeesport.web.app/',
            'description': 'สัมผัสประสบการณ์การรับชมภาพยนตร์และซีรีส์แนวตั้งคุณภาพสูงระดับ 4K HDR',
            'potentialAction': {
                '@type': 'SearchAction',
                'target': 'https://duydodeesport.web.app/search.html?q={search_term_string}',
                'query-input': 'required name=search_term_string'
            }
        };
    },

    /**
     * Get media watch path for URLs
     */
    getMediaWatchPath(category, type, id) {
        const isVertical = category && (category.includes('แนวตั้ง') || category.includes('Vertical'));
        const page = (isVertical || type === 'movie' || type === 'movies') ? '/watch-movie.html' : '/watch-series.html';
        return `${page}?id=${id}`;
    },

    /**
     * Initialize SEO for home page
     */
    initHomeSEO() {
        this.setMetaTags({
            title: 'DUYดูDEE PREMIUM | ที่สุดแห่งประสบการณ์ความบันเทิงระดับ 4K HDR',
            description: 'สัมผัสประสบการณ์การรับชมภาพยนตร์และซีรีส์แนวตั้งคุณภาพสูงระดับ 4K HDR ที่ดีที่สุดบน DUYดูDEE PREMIUM ออกแบบมาเพื่อความหรูหราและรสนิยมที่เหนือระดับ',
            image: 'https://duydodeesport.web.app/assets/logo/DUYDODEE.png',
            keywords: ['ดูหนังออนไลน์', 'ซีรีส์แนวตั้ง', 'ซีรีส์จีน', '4K HDR', 'streaming', 'DUYดูDEE', 'ดูหนังฟรี', 'ซีรีส์ฟรี']
        });

        this.setStructuredData(this.generateWebSiteSchema());
    },

    /**
     * Initialize SEO for category page
     */
    initCategorySEO(category) {
        const categoryNames = {
            'vertical': 'ซีรีส์แนวตั้ง',
            'chinese': 'ซีรีส์จีนพากย์ไทย',
            'action': 'หนังแอคชั่น',
            'drama': 'ซีรีส์ดราม่า',
            'comedy': 'หนังตลก',
            'horror': 'หนังสยองขวั',
            'romance': 'หนังโรแมนติก'
        };

        const displayName = categoryNames[category] || category;

        this.setMetaTags({
            title: `ดู${displayName} | DUYดูDEE PREMIUM`,
            description: `คอลเล็กชั้นนำของ${displayName}คุณภาพสูงระดับ 4K HDR รับชมฟรีบน DUYดูDEE PREMIUM ออกแบบมาเพื่อความหรูหราและรสนิยมที่เหนือระดับ`,
            image: 'https://duydodeesport.web.app/assets/logo/DUYDODEE.png',
            keywords: [`${displayName}`, 'ดูหนังออนไลน์', 'DUYดูDEE', '4K HDR', 'streaming'],
            type: 'website'
        });
    }
};

// Auto-initialize on import
if (typeof window !== 'undefined') {
    // Initialize home page SEO by default
    if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
        SEOService.initHomeSEO();
    }
}
