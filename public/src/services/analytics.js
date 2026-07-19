/**
 * Analytics Service
 * Google Analytics 4 integration and custom event tracking
 */

class AnalyticsService {
  constructor() {
    this.isEnabled = import.meta.env.VITE_ENABLE_ANALYTICS === 'true';
    this.trackingId = import.meta.env.VITE_GA_TRACKING_ID;
    this.init();
  }

  init() {
    if (!this.isEnabled || !this.trackingId) {
      return;
    }

    // Load Google Analytics
    this.loadGoogleAnalytics();

    // Setup page tracking
    this.setupPageTracking();

    // Setup error tracking
    this.setupErrorTracking();
  }

  loadGoogleAnalytics() {
    try {
      // Create Google Analytics script
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${this.trackingId}`;
      document.head.appendChild(script);

      // Initialize gtag
      window.dataLayer = window.dataLayer || [];
      const dataLayer = window.dataLayer;
      window.gtag = function() {
        dataLayer.push(arguments);
      };

      window.gtag('js', new Date());
      window.gtag('config', this.trackingId, {
        send_page_view: false, // We'll handle page views manually
        anonymize_ip: true,
        cookie_flags: 'samesite=none;secure'
      });

    } catch (error) {
      console.error('Failed to load Google Analytics:', error);
    }
  }

  setupPageTracking() {
    // Track initial page view
    this.trackPageView(window.location.pathname, window.location.title);

    // Track page changes for SPA
    this.trackNavigation();
  }

  trackNavigation() {
    // Override pushState and replaceState to track navigation
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function(...args) {
      originalPushState.apply(this, args);
      analytics.trackPageView(window.location.pathname, document.title);
    };

    history.replaceState = function(...args) {
      originalReplaceState.apply(this, args);
      analytics.trackPageView(window.location.pathname, document.title);
    };

    // Track popstate (back/forward buttons)
    window.addEventListener('popstate', () => {
      this.trackPageView(window.location.pathname, document.title);
    });
  }

  trackPageView(path, title) {
    if (!this.isEnabled) {
      return;
    }

    try {
      window.gtag('event', 'page_view', {
        page_title: title || document.title,
        page_location: window.location.href,
        page_path: path || window.location.pathname
      });
    } catch (error) {
      console.error('Failed to track page view:', error);
    }
  }

  setupErrorTracking() {
    // Track JavaScript errors
    window.addEventListener('error', (event) => {
      this.trackError('javascript_error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });

    // Track unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError('promise_rejection', {
        reason: event.reason
      });
    });
  }

  trackError(errorName, errorDetails = {}) {
    if (!this.isEnabled) {
      return;
    }

    try {
      window.gtag('event', 'exception', {
        description: errorName,
        fatal: false,
        ...errorDetails
      });
    } catch (error) {
      console.error('Failed to track error:', error);
    }
  }

  // Custom Event Tracking
  trackEvent(eventName, eventParameters = {}) {
    if (!this.isEnabled) {
      return;
    }

    try {
      window.gtag('event', eventName, eventParameters);
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  }

  // User Engagement Events
  trackVideoPlay(videoId, videoTitle) {
    this.trackEvent('video_play', {
      video_id: videoId,
      video_title: videoTitle,
      content_type: 'video'
    });
  }

  trackVideoPause(videoId, watchTime) {
    this.trackEvent('video_pause', {
      video_id: videoId,
      watch_time: watchTime,
      content_type: 'video'
    });
  }

  trackVideoComplete(videoId, totalWatchTime) {
    this.trackEvent('video_complete', {
      video_id: videoId,
      total_watch_time: totalWatchTime,
      content_type: 'video'
    });
  }

  trackSearch(query, resultCount) {
    this.trackEvent('search', {
      search_term: query,
      results_count: resultCount
    });
  }

  trackLogin(method) {
    this.trackEvent('login', {
      method: method
    });
  }

  trackSignUp(method) {
    this.trackEvent('sign_up', {
      method: method
    });
  }

  trackLogout() {
    this.trackEvent('logout', {});
  }

  trackPurchase(itemId, itemName, price, currency = 'THB') {
    this.trackEvent('purchase', {
      transaction_id: itemId,
      item_name: itemName,
      price: price,
      currency: currency
    });
  }

  trackAddToCart(itemId, itemName, price) {
    this.trackEvent('add_to_cart', {
      item_id: itemId,
      item_name: itemName,
      price: price
    });
  }

  trackRemoveFromCart(itemId, itemName) {
    this.trackEvent('remove_from_cart', {
      item_id: itemId,
      item_name: itemName
    });
  }

  // Content Interaction Events
  trackContentLike(contentId, contentType) {
    this.trackEvent('like', {
      content_id: contentId,
      content_type: contentType
    });
  }

  trackContentShare(contentId, contentType, shareMethod) {
    this.trackEvent('share', {
      content_id: contentId,
      content_type: contentType,
      method: shareMethod
    });
  }

  trackContentComment(contentId, contentType) {
    this.trackEvent('comment', {
      content_id: contentId,
      content_type: contentType
    });
  }

  trackContentFavorite(contentId, contentType) {
    this.trackEvent('add_to_favorites', {
      content_id: contentId,
      content_type: contentType
    });
  }

  // Admin Events
  trackAdminAction(action, details = {}) {
    this.trackEvent('admin_action', {
      action: action,
      ...details
    });
  }

  trackContentUpload(contentType, status) {
    this.trackEvent('content_upload', {
      content_type: contentType,
      status: status
    });
  }

  trackUserManagement(action, userRole) {
    this.trackEvent('user_management', {
      action: action,
      user_role: userRole
    });
  }

  // Performance Events
  trackPerformanceMetric(metricName, value) {
    this.trackEvent('performance_metric', {
      metric_name: metricName,
      value: value
    });
  }

  // Custom Dimensions
  setUserProperties(properties) {
    if (!this.isEnabled) {
      return;
    }

    try {
      window.gtag('set', 'user_properties', properties);
    } catch (error) {
      console.error('Failed to set user properties:', error);
    }
  }

  setUserId(userId) {
    if (!this.isEnabled) {
      return;
    }

    try {
      window.gtag('config', this.trackingId, {
        user_id: userId
      });
    } catch (error) {
      console.error('Failed to set user ID:', error);
    }
  }

  // E-commerce Events
  trackBeginCheckout(items, totalValue) {
    this.trackEvent('begin_checkout', {
      items: items,
      value: totalValue,
      currency: 'THB'
    });
  }

  trackCheckoutOption(step, option) {
    this.trackEvent('checkout_option', {
      checkout_step: step,
      checkout_option: option
    });
  }

  // A/B Testing
  trackExperiment(experimentId, variantId) {
    this.trackEvent('experiment_view', {
      experiment_id: experimentId,
      variant_id: variantId
    });
  }

  trackConversion(experimentId, variantId) {
    this.trackEvent('experiment_conversion', {
      experiment_id: experimentId,
      variant_id: variantId
    });
  }

  // Social Media Events
  trackSocialShare(network, contentId, contentType) {
    this.trackEvent('share', {
      method: network,
      content_id: contentId,
      content_type: contentType
    });
  }

  trackSocialFollow(network) {
    this.trackEvent('social_follow', {
      social_network: network
    });
  }

  // Campaign Tracking
  trackCampaignClick(campaignId, campaignSource) {
    this.trackEvent('campaign_click', {
      campaign_id: campaignId,
      campaign_source: campaignSource
    });
  }

  // Custom Events
  trackCustomEvent(eventName, parameters = {}) {
    this.trackEvent(eventName, parameters);
  }

  // Disable tracking (for privacy)
  disableTracking() {
    if (!this.isEnabled) {
      return;
    }

    try {
      window.gtag('config', this.trackingId, {
        send_page_view: false,
        analytics_storage: 'none'
      });
      this.isEnabled = false;
    } catch (error) {
      console.error('Failed to disable tracking:', error);
    }
  }

  // Enable tracking
  enableTracking() {
    if (this.isEnabled) {
      return;
    }

    try {
      window.gtag('config', this.trackingId, {
        send_page_view: true,
        analytics_storage: 'granted'
      });
      this.isEnabled = true;
    } catch (error) {
      console.error('Failed to enable tracking:', error);
    }
  }

  // Consent Management
  grantConsent() {
    if (!this.isEnabled) {
      return;
    }

    try {
      window.gtag('consent', 'update', {
        analytics_storage: 'granted'
      });
    } catch (error) {
      console.error('Failed to grant consent:', error);
    }
  }

  denyConsent() {
    if (!this.isEnabled) {
      return;
    }

    try {
      window.gtag('consent', 'update', {
        analytics_storage: 'denied'
      });
    } catch (error) {
      console.error('Failed to deny consent:', error);
    }
  }
}

// Create singleton instance
const analytics = new AnalyticsService();

export default analytics;
