/**
 * SEO Utilities
 * Search Engine Optimization tools and meta tag management
 */

class SEOManager {
  constructor() {
    this.siteName = import.meta.env.VITE_SITE_NAME || 'DUYDODEE PREMIUM';
    this.siteUrl = import.meta.env.VITE_SITE_URL || 'https://duydodee.web.app';
    this.defaultDescription = 'แพลตฟอร์มบริหารจัดการทรัพยากรกราฟิกฟุตบอลระดับพรีเมียม (Cinematic Sport Edition)';
    this.init();
  }

  init() {
    this.updateMetaTags();
    this.setupStructuredData();
    this.updateCanonicalURL();
  }

  // Update basic meta tags
  updateMetaTags(config = {}) {
    const title = config.title || this.siteName;
    const description = config.description || this.defaultDescription;
    const keywords = config.keywords || 'streaming, football, sports, premium, cinematic';
    const image = config.image || `${this.siteUrl}/assets/logo/DUYDODEE.png`;

    // Update title
    document.title = config.title ? `${config.title} | ${this.siteName}` : this.siteName;

    // Update or create meta tags
    this.setMetaTag('description', description);
    this.setMetaTag('keywords', keywords);
    this.setMetaTag('og:title', title, 'property');
    this.setMetaTag('og:description', description, 'property');
    this.setMetaTag('og:image', image, 'property');
    this.setMetaTag('og:url', window.location.href, 'property');
    this.setMetaTag('og:type', 'website', 'property');
    this.setMetaTag('og:site_name', this.siteName, 'property');
    
    // Twitter Card
    this.setMetaTag('twitter:card', 'summary_large_image');
    this.setMetaTag('twitter:title', title);
    this.setMetaTag('twitter:description', description);
    this.setMetaTag('twitter:image', image);
  }

  setMetaTag(name, content, attribute = 'name') {
    let meta = document.querySelector(`meta[${attribute}="${name}"]`);
    
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute(attribute, name);
      document.head.appendChild(meta);
    }
    
    meta.setAttribute('content', content);
  }

  // Update canonical URL
  updateCanonicalURL(url = window.location.href) {
    let canonical = document.querySelector('link[rel="canonical"]');
    
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    
    canonical.setAttribute('href', url);
  }

  // Setup structured data (JSON-LD)
  setupStructuredData(config = {}) {
    const defaultData = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: this.siteName,
      url: this.siteUrl,
      description: this.defaultDescription,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${this.siteUrl}/search?q={search_term_string}`,
        'query-input': 'required name=search_term_string'
      }
    };

    const structuredData = { ...defaultData, ...config };
    this.injectStructuredData(structuredData);
  }

  injectStructuredData(data) {
    let script = document.querySelector('script[type="application/ld+json"]');
    
    if (!script) {
      script = document.createElement('script');
      script.setAttribute('type', 'application/ld+json');
      document.head.appendChild(script);
    }
    
    script.textContent = JSON.stringify(data);
  }

  // Movie structured data
  addMovieStructuredData(movieData) {
    const data = {
      '@context': 'https://schema.org',
      '@type': 'Movie',
      name: movieData.title,
      description: movieData.description,
      image: movieData.thumbnail,
      datePublished: movieData.createdAt,
      genre: movieData.category,
      offers: {
        '@type': 'Offer',
        price: movieData.price || '0',
        priceCurrency: 'THB',
        availability: 'https://schema.org/InStock'
      }
    };

    this.injectStructuredData(data);
  }

  // TV Series structured data
  addSeriesStructuredData(seriesData) {
    const data = {
      '@context': 'https://schema.org',
      '@type': 'TVSeries',
      name: seriesData.title,
      description: seriesData.description,
      image: seriesData.thumbnail,
      numberOfEpisodes: seriesData.episodes?.length || 0,
      genre: seriesData.category
    };

    this.injectStructuredData(data);
  }

  // Organization structured data
  addOrganizationStructuredData() {
    const data = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: this.siteName,
      url: this.siteUrl,
      logo: `${this.siteUrl}/assets/logo/DUYDODEE.png`,
      description: this.defaultDescription,
      sameAs: [
        'https://www.facebook.com/duydodee',
        'https://www.twitter.com/duydodee',
        'https://www.instagram.com/duydodee'
      ]
    };

    this.injectStructuredData(data);
  }

  // Breadcrumb structured data
  addBreadcrumbStructuredData(breadcrumbs) {
    const data = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((crumb, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: crumb.name,
        item: crumb.url
      }))
    };

    this.injectStructuredData(data);
  }

  // Video structured data
  addVideoStructuredData(videoData) {
    const data = {
      '@context': 'https://schema.org',
      '@type': 'VideoObject',
      name: videoData.title,
      description: videoData.description,
      thumbnailUrl: videoData.thumbnail,
      uploadDate: videoData.createdAt,
      duration: videoData.duration,
      contentUrl: videoData.videoUrl
    };

    this.injectStructuredData(data);
  }

  // Update robots meta tag
  updateRobotsMeta(index = true, follow = true) {
    const content = `${index ? 'index' : 'noindex'}, ${follow ? 'follow' : 'nofollow'}`;
    this.setMetaTag('robots', content);
  }

  // Add Open Graph tags for social sharing
  addOpenGraphTags(config) {
    this.setMetaTag('og:title', config.title, 'property');
    this.setMetaTag('og:description', config.description, 'property');
    this.setMetaTag('og:image', config.image, 'property');
    this.setMetaTag('og:url', config.url, 'property');
    this.setMetaTag('og:type', config.type || 'website', 'property');
  }

  // Add Twitter Card tags
  addTwitterCardTags(config) {
    this.setMetaTag('twitter:card', config.card || 'summary_large_image');
    this.setMetaTag('twitter:title', config.title);
    this.setMetaTag('twitter:description', config.description);
    this.setMetaTag('twitter:image', config.image);
  }

  // Handle page transitions for SPA
  handlePageChange(pageConfig) {
    // Scroll to top
    window.scrollTo(0, 0);

    // Update meta tags
    this.updateMetaTags(pageConfig);

    // Update canonical URL
    this.updateCanonicalURL(pageConfig.url);

    // Update structured data
    if (pageConfig.structuredData) {
      this.setupStructuredData(pageConfig.structuredData);
    }

    // Update robots meta
    if (pageConfig.robots) {
      this.updateRobotsMeta(pageConfig.robots.index, pageConfig.robots.follow);
    }
  }

  // Generate sitemap (for dynamic sitemaps)
  generateSitemapURLs(urls) {
    return urls.map(url => {
      return `
        <url>
          <loc>${this.siteUrl}${url.loc}</loc>
          <lastmod>${url.lastmod || new Date().toISOString()}</lastmod>
          <changefreq>${url.changefreq || 'weekly'}</changefreq>
          <priority>${url.priority || '0.5'}</priority>
        </url>
      `;
    }).join('');
  }

  // Generate robots.txt content
  generateRobotsTxt(disallowPaths = []) {
    let content = `User-agent: *\n`;
    
    disallowPaths.forEach(path => {
      content += `Disallow: ${path}\n`;
    });
    
    content += `\nSitemap: ${this.siteUrl}/sitemap.xml`;
    
    return content;
  }

  // Add hreflang tags for multilingual support
  addHreflangTags(languages) {
    languages.forEach(lang => {
      const link = document.createElement('link');
      link.setAttribute('rel', 'alternate');
      link.setAttribute('hreflang', lang.code);
      link.setAttribute('href', `${this.siteUrl}${lang.url}`);
      document.head.appendChild(link);
    });
  }

  // Preconnect to external domains
  addPreconnectDomains(domains) {
    domains.forEach(domain => {
      const link = document.createElement('link');
      link.setAttribute('rel', 'preconnect');
      link.setAttribute('href', domain);
      document.head.appendChild(link);
    });
  }

  // Add DNS prefetch
  addDNSPrefetch(domains) {
    domains.forEach(domain => {
      const link = document.createElement('link');
      link.setAttribute('rel', 'dns-prefetch');
      link.setAttribute('href', domain);
      document.head.appendChild(link);
    });
  }
}

// Create singleton instance
const seoManager = new SEOManager();

export default seoManager;
