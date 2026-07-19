/**
 * ⚡ DUYDODEE PREMIUM - PERFORMANCE MONITORING
 * Real-time performance tracking and optimization
 */

import { ENV } from '../config/env-config.js';

export class PerformanceMonitor {
  constructor() {
    this.metrics = [];
    this.enabled = ENV.FEATURES.PERFORMANCE_MONITORING;
    this.maxMetrics = 100;
  }

  /**
   * Start performance measurement
   */
  startMeasure(name) {
    if (!this.enabled) {
      return;
    }
    performance.mark(`${name}-start`);
  }

  /**
   * End performance measurement
   */
  endMeasure(name) {
    if (!this.enabled) {
      return;
    }
    try {
      performance.mark(`${name}-end`);
      performance.measure(name, `${name}-start`, `${name}-end`);

      const measure = performance.getEntriesByName(name)[0];
      this.addMetric({
        name,
        duration: measure.duration,
        timestamp: Date.now()
      });

      // Clean up marks
      performance.clearMarks(`${name}-start`);
      performance.clearMarks(`${name}-end`);
      performance.clearMeasures(name);
    } catch (e) {
      console.error('Performance measure error:', e);
    }
  }

  /**
   * Add custom metric
   */
  addMetric(metric) {
    if (!this.enabled) {
      return;
    }

    this.metrics.push(metric);
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }
  }

  /**
   * Get Web Vitals
   */
  async getWebVitals() {
    if (!this.enabled || !performance.getEntriesByType) {
      return null;
    }

    try {
      const navigation = performance.getEntriesByType('navigation')[0];
      const paint = performance.getEntriesByType('paint');

      return {
        // Navigation timing
        domContentLoaded:
          navigation?.domContentLoadedEventEnd - navigation?.domContentLoadedEventStart,
        loadComplete: navigation?.loadEventEnd - navigation?.loadEventStart,
        firstPaint: paint?.find((p) => p.name === 'first-paint')?.startTime,
        firstContentfulPaint: paint?.find((p) => p.name === 'first-contentful-paint')?.startTime,

        // Resource timing
        resourceCount: performance.getEntriesByType('resource').length,

        // Memory (if available)
        memory: performance.memory
          ? {
            usedJSHeapSize: performance.memory.usedJSHeapSize,
            totalJSHeapSize: performance.memory.totalJSHeapSize,
            jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
          }
          : null
      };
    } catch (e) {
      console.error('Web Vitals error:', e);
      return null;
    }
  }

  /**
   * Get performance summary
   */
  getSummary() {
    if (!this.enabled || this.metrics.length === 0) {
      return null;
    }

    const summary = {
      total: this.metrics.length,
      average: 0,
      min: Infinity,
      max: -Infinity,
      byName: {}
    };

    let totalDuration = 0;

    this.metrics.forEach((metric) => {
      totalDuration += metric.duration;
      summary.min = Math.min(summary.min, metric.duration);
      summary.max = Math.max(summary.max, metric.duration);

      if (!summary.byName[metric.name]) {
        summary.byName[metric.name] = {
          count: 0,
          total: 0,
          average: 0
        };
      }

      summary.byName[metric.name].count++;
      summary.byName[metric.name].total += metric.duration;
    });

    summary.average = totalDuration / this.metrics.length;

    // Calculate averages by name
    Object.keys(summary.byName).forEach((name) => {
      const data = summary.byName[name];
      data.average = data.total / data.count;
    });

    return summary;
  }

  /**
   * Log performance report
   */
  logReport() {
    if (!this.enabled) {
      return;
    }

    // Summary available but not logged in production
    this.getSummary();
    this.getWebVitals();
  }

  /**
   * Clear all metrics
   */
  clear() {
    this.metrics = [];
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * Performance decorator for functions
 */
export function measurePerformance(name) {
  return function(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function(...args) {
      performanceMonitor.startMeasure(name);
      try {
        const result = await originalMethod.apply(this, args);
        performanceMonitor.endMeasure(name);
        return result;
      } catch (error) {
        performanceMonitor.endMeasure(name);
        throw error;
      }
    };

    return descriptor;
  };
}

/**
 * Debounce function for performance
 */
export function debounce(func, wait) {
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

/**
 * Throttle function for performance
 */
export function throttle(func, limit) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Lazy load images
 */
export function lazyLoadImages() {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          const src = img.dataset.src;
          if (src) {
            img.src = src;
            img.classList.remove('lazy');
            observer.unobserve(img);
          }
        }
      });
    });

    document.querySelectorAll('img[data-src]').forEach((img) => {
      imageObserver.observe(img);
    });
  }
}

/**
 * Monitor memory usage
 */
export function monitorMemory() {
  if (performance.memory) {
    const _used = performance.memory.usedJSHeapSize / 1048576; // Convert to MB
    const _total = performance.memory.totalJSHeapSize / 1048576;
    const _limit = performance.memory.jsHeapSizeLimit / 1048576;
  }
}

// Initialize performance monitoring
if (typeof window !== 'undefined' && ENV.FEATURES.PERFORMANCE_MONITORING) {
  // Log performance report every 30 seconds
  setInterval(() => {
    performanceMonitor.logReport();
  }, 30000);

  // Monitor memory every 10 seconds
  setInterval(() => {
    monitorMemory();
  }, 10000);

  // Log initial page load performance
  window.addEventListener('load', () => {
    setTimeout(() => {
      performanceMonitor.logReport();
    }, 1000);
  });
}
