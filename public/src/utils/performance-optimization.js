/**
 * Performance Optimization Utilities
 * Tools for optimizing application performance
 */

class PerformanceOptimizer {
  constructor() {
    this.imageCache = new Map();
    this.lazyLoadObserver = null;
    this.initLazyLoading();
  }

  // Lazy Loading for Images
  initLazyLoading() {
    if ('IntersectionObserver' in window) {
      this.lazyLoadObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const img = entry.target;
              this.loadImage(img);
              observer.unobserve(img);
            }
          });
        },
        {
          rootMargin: '50px 0px',
          threshold: 0.01
        }
      );
    }
  }

  loadImage(img) {
    const src = img.dataset.src;
    if (src && !this.imageCache.has(src)) {
      const tempImg = new Image();
      tempImg.onload = () => {
        img.src = src;
        img.classList.remove('lazy');
        img.classList.add('loaded');
        this.imageCache.set(src, true);
      };
      tempImg.onerror = () => {
        img.src = img.dataset.fallback || '/assets/placeholder.jpg';
        img.classList.add('error');
      };
      tempImg.src = src;
    } else if (this.imageCache.has(src)) {
      img.src = src;
      img.classList.remove('lazy');
      img.classList.add('loaded');
    }
  }

  observeImage(img) {
    if (this.lazyLoadObserver) {
      this.lazyLoadObserver.observe(img);
    } else {
      // Fallback for browsers without IntersectionObserver
      this.loadImage(img);
    }
  }

  // Image Optimization
  optimizeImageUrl(url, width, height, quality = 80) {
    if (!url) {
      return '';
    }

    // Add Firebase Storage optimization parameters
    if (url.includes('firebasestorage.googleapis.com')) {
      const optimizedUrl = new URL(url);
      optimizedUrl.searchParams.set('size', `${width}x${height}`);
      optimizedUrl.searchParams.set('quality', quality);
      return optimizedUrl.toString();
    }

    return url;
  }

  generateResponsiveSrcset(baseUrl, sizes = [320, 480, 768, 1024, 1200]) {
    return sizes
      .map((size) => {
        const optimizedUrl = this.optimizeImageUrl(baseUrl, size);
        return `${optimizedUrl} ${size}w`;
      })
      .join(', ');
  }

  // Debounce Function
  debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Throttle Function
  throttle(func, limit = 300) {
    let inThrottle;
    return function executedFunction(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  // Request Animation Frame Throttle
  rafThrottle(func) {
    let rafId = null;
    return function executedFunction(...args) {
      if (rafId === null) {
        rafId = requestAnimationFrame(() => {
          func.apply(this, args);
          rafId = null;
        });
      }
    };
  }

  // Performance Monitoring
  measurePerformance(name, fn) {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    const duration = end - start;

    console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);

    // Send to analytics if available
    if (window.errorMonitoring) {
      window.errorMonitoring.trackPerformance(name, duration);
    }

    return result;
  }

  async measureAsyncPerformance(name, asyncFn) {
    const start = performance.now();
    try {
      const result = await asyncFn();
      const end = performance.now();
      const duration = end - start;

      console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);

      if (window.errorMonitoring) {
        window.errorMonitoring.trackPerformance(name, duration);
      }

      return result;
    } catch (error) {
      const end = performance.now();
      const duration = end - start;

      console.error(`[Performance] ${name} failed after ${duration.toFixed(2)}ms`, error);

      if (window.errorMonitoring) {
        window.errorMonitoring.captureError(error, {
          type: 'performance_error',
          operation: name,
          duration: duration
        });
      }

      throw error;
    }
  }

  // Memory Management
  clearCache() {
    this.imageCache.clear();
    if (this.lazyLoadObserver) {
      this.lazyLoadObserver.disconnect();
    }
  }

  // Preload Critical Resources
  preloadResources(urls) {
    urls.forEach((url) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = url;

      if (url.match(/\.(jpg|jpeg|png|webp|gif)$/i)) {
        link.as = 'image';
      } else if (url.match(/\.(css)$/i)) {
        link.as = 'style';
      } else if (url.match(/\.(js)$/i)) {
        link.as = 'script';
      }

      document.head.appendChild(link);
    });
  }

  // Prefetch Resources
  prefetchResources(urls) {
    urls.forEach((url) => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = url;
      document.head.appendChild(link);
    });
  }

  // Critical CSS Inline
  inlineCriticalCSS(css) {
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
  }

  // Font Loading Optimization
  loadFont(fontFamily, fontUrl, weight = '400', style = 'normal') {
    const font = new FontFace(fontFamily, `url(${fontUrl})`, {
      weight: weight,
      style: style
    });

    font
      .load()
      .then((loadedFont) => {
        document.fonts.add(loadedFont);
        document.body.classList.add(`${fontFamily}-loaded`);
      })
      .catch((error) => {
        console.error('Font loading failed:', error);
      });
  }

  // Video Optimization
  optimizeVideoUrl(url, quality = '720') {
    if (!url) {
      return '';
    }

    // Add video optimization parameters
    if (url.includes('firebasestorage.googleapis.com')) {
      const optimizedUrl = new URL(url);
      optimizedUrl.searchParams.set('quality', quality);
      return optimizedUrl.toString();
    }

    return url;
  }

  // Code Splitting Helper
  async loadComponent(modulePath) {
    try {
      const module = await import(modulePath);
      return module.default;
    } catch (error) {
      console.error('Component loading failed:', error);
      if (window.errorMonitoring) {
        window.errorMonitoring.captureError(error, {
          type: 'component_load_error',
          module: modulePath
        });
      }
      return null;
    }
  }

  // Virtual Scrolling for Large Lists
  createVirtualScroller(container, itemHeight, renderItem) {
    const visibleItems = Math.ceil(container.clientHeight / itemHeight) + 2;
    let scrollTop = 0;
    let totalItems = 0;
    let items = [];

    const updateVisibleItems = () => {
      const startIndex = Math.floor(scrollTop / itemHeight);
      const endIndex = Math.min(startIndex + visibleItems, totalItems);

      container.innerHTML = '';

      for (let i = startIndex; i < endIndex; i++) {
        if (items[i]) {
          const item = renderItem(items[i], i);
          item.style.position = 'absolute';
          item.style.top = `${i * itemHeight}px`;
          container.appendChild(item);
        }
      }
    };

    return {
      setItems: (newItems) => {
        items = newItems;
        totalItems = newItems.length;
        container.style.height = `${totalItems * itemHeight}px`;
        updateVisibleItems();
      },
      handleScroll: (e) => {
        scrollTop = e.target.scrollTop;
        requestAnimationFrame(updateVisibleItems);
      }
    };
  }

  // Service Worker Registration
  async registerServiceWorker(swPath = '/sw.js') {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register(swPath);
        console.log('Service Worker registered:', registration);

        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New version available
              console.log('New content is available; please refresh.');
            }
          });
        });

        return registration;
      } catch (error) {
        console.error('Service Worker registration failed:', error);
        if (window.errorMonitoring) {
          window.errorMonitoring.captureError(error, {
            type: 'service_worker_error'
          });
        }
        return null;
      }
    }
    return null;
  }

  // Network Information
  getNetworkInfo() {
    if (navigator.connection) {
      return {
        effectiveType: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink,
        rtt: navigator.connection.rtt,
        saveData: navigator.connection.saveData
      };
    }
    return null;
  }

  // Adaptive Quality based on Network
  getAdaptiveQuality() {
    const networkInfo = this.getNetworkInfo();
    if (!networkInfo) {
      return '720';
    }

    if (networkInfo.saveData) {
      return '480';
    }
    if (networkInfo.effectiveType === '4g') {
      return '1080';
    }
    if (networkInfo.effectiveType === '3g') {
      return '720';
    }
    return '480';
  }
}

// Create singleton instance
const performanceOptimizer = new PerformanceOptimizer();

export default performanceOptimizer;
