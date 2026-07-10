/**
 * Accessibility Utilities
 * Web accessibility enhancement tools and ARIA management
 */

class AccessibilityManager {
  constructor() {
    this.init();
  }

  init() {
    this.setupKeyboardNavigation();
    this.setupARIALiveRegions();
    this.setupFocusManagement();
    this.setupScreenReaderSupport();
    this.setupColorContrast();
  }

  // Keyboard Navigation
  setupKeyboardNavigation() {
    // Handle Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.handleEscapeKey();
      }
    });

    // Handle Tab key for modal focus trapping
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        this.handleTabKey(e);
      }
    });

    // Add keyboard indicators to interactive elements
    this.addKeyboardIndicators();
  }

  handleEscapeKey() {
    // Close modals
    const modals = document.querySelectorAll('.modal.active');
    modals.forEach(modal => {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
    });

    // Close dropdowns
    const dropdowns = document.querySelectorAll('.dropdown.active');
    dropdowns.forEach(dropdown => {
      dropdown.classList.remove('active');
    });
  }

  handleTabKey(e) {
    const modal = document.querySelector('.modal.active');
    if (!modal) return;

    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault();
      lastElement.focus();
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault();
      firstElement.focus();
    }
  }

  addKeyboardIndicators() {
    // Add focus indicators to all interactive elements
    const interactiveElements = document.querySelectorAll(
      'button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    interactiveElements.forEach(element => {
      element.style.outline = 'none';
      element.addEventListener('focus', () => {
        element.style.outline = '2px solid #4F46E5';
        element.style.outlineOffset = '2px';
      });
      element.addEventListener('blur', () => {
        element.style.outline = 'none';
      });
    });
  }

  // ARIA Live Regions
  setupARIALiveRegions() {
    // Create live region for dynamic content announcements
    if (!document.getElementById('aria-live-region')) {
      const liveRegion = document.createElement('div');
      liveRegion.id = 'aria-live-region';
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.className = 'sr-only';
      document.body.appendChild(liveRegion);
    }

    // Create live region for alerts
    if (!document.getElementById('aria-alert-region')) {
      const alertRegion = document.createElement('div');
      alertRegion.id = 'aria-alert-region';
      alertRegion.setAttribute('aria-live', 'assertive');
      alertRegion.setAttribute('aria-atomic', 'true');
      alertRegion.className = 'sr-only';
      document.body.appendChild(alertRegion);
    }
  }

  announce(message, priority = 'polite') {
    const regionId = priority === 'assertive' ? 'aria-alert-region' : 'aria-live-region';
    const region = document.getElementById(regionId);
    
    if (region) {
      region.textContent = message;
      // Clear after announcement
      setTimeout(() => {
        region.textContent = '';
      }, 1000);
    }
  }

  // Focus Management
  setupFocusManagement() {
    // Skip to main content link
    this.addSkipToContentLink();

    // Track last focused element for modal restoration
    this.lastFocusedElement = null;
  }

  addSkipToContentLink() {
    if (document.getElementById('skip-to-content')) return;

    const skipLink = document.createElement('a');
    skipLink.id = 'skip-to-content';
    skipLink.href = '#main-content';
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'skip-to-content';
    
    // Add styles
    skipLink.style.cssText = `
      position: absolute;
      top: -40px;
      left: 0;
      background: #4F46E5;
      color: white;
      padding: 8px 16px;
      z-index: 100;
      transition: top 0.3s;
    `;
    
    skipLink.addEventListener('focus', () => {
      skipLink.style.top = '0';
    });
    
    skipLink.addEventListener('blur', () => {
      skipLink.style.top = '-40px';
    });

    document.body.insertBefore(skipLink, document.body.firstChild);

    // Add main content ID if it doesn't exist
    const mainContent = document.querySelector('main') || document.querySelector('#main-content');
    if (mainContent && !mainContent.id) {
      mainContent.id = 'main-content';
    }
  }

  saveFocus() {
    this.lastFocusedElement = document.activeElement;
  }

  restoreFocus() {
    if (this.lastFocusedElement) {
      this.lastFocusedElement.focus();
      this.lastFocusedElement = null;
    }
  }

  trapFocus(element) {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
  }

  // Screen Reader Support
  setupScreenReaderSupport() {
    // Add screen reader only class
    const style = document.createElement('style');
    style.textContent = `
      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border-width: 0;
      }
    `;
    document.head.appendChild(style);
  }

  addScreenReaderOnlyText(element, text) {
    const srText = document.createElement('span');
    srText.className = 'sr-only';
    srText.textContent = text;
    element.appendChild(srText);
  }

  // Color Contrast
  setupColorContrast() {
    // Check color contrast on load
    this.checkColorContrast();
  }

  checkColorContrast() {
    // Get all text elements
    const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, a, button');

    textElements.forEach(element => {
      const styles = window.getComputedStyle(element);
      const color = styles.color;
      const backgroundColor = styles.backgroundColor;

      // Convert RGB to hex
      const colorHex = this.rgbToHex(color);
      const bgHex = this.rgbToHex(backgroundColor);

      // Calculate contrast ratio
      const contrastRatio = this.calculateContrastRatio(colorHex, bgHex);

      // Log warnings for low contrast
      if (contrastRatio < 4.5) {
        console.warn(`Low contrast ratio (${contrastRatio.toFixed(2)}) on element:`, element);
      }
    });
  }

  rgbToHex(rgb) {
    if (rgb.startsWith('#')) return rgb;
    
    const rgbValues = rgb.match(/\d+/g);
    if (!rgbValues) return '#000000';
    
    return '#' + rgbValues.slice(0, 3).map(x => {
      const hex = parseInt(x).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  }

  calculateContrastRatio(color1, color2) {
    const luminance1 = this.calculateLuminance(color1);
    const luminance2 = this.calculateLuminance(color2);
    
    const lighter = Math.max(luminance1, luminance2);
    const darker = Math.min(luminance1, luminance2);
    
    return (lighter + 0.05) / (darker + 0.05);
  }

  calculateLuminance(hex) {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const a = [r, g, b].map(value => {
      return value <= 0.03928
        ? value / 12.92
        : Math.pow((value + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
  }

  // ARIA Attribute Management
  setARIAAttribute(element, attribute, value) {
    element.setAttribute(`aria-${attribute}`, value);
  }

  removeARIAAttribute(element, attribute) {
    element.removeAttribute(`aria-${attribute}`);
  }

  // Modal Accessibility
  openModal(modal) {
    this.saveFocus();
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    this.trapFocus(modal);
    this.announce('Modal opened');
  }

  closeModal(modal) {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    modal.removeAttribute('role');
    modal.removeAttribute('aria-modal');
    this.restoreFocus();
    this.announce('Modal closed');
  }

  // Form Accessibility
  enhanceFormAccessibility(form) {
    const inputs = form.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
      // Ensure labels are associated
      const id = input.id;
      const label = form.querySelector(`label[for="${id}"]`);
      
      if (!label && input.placeholder) {
        // Create label if missing
        const newLabel = document.createElement('label');
        newLabel.setAttribute('for', id);
        newLabel.className = 'sr-only';
        newLabel.textContent = input.placeholder;
        input.parentNode.insertBefore(newLabel, input);
      }

      // Add required indicator
      if (input.required) {
        this.setARIAAttribute(input, 'required', 'true');
        const requiredIndicator = document.createElement('span');
        requiredIndicator.setAttribute('aria-hidden', 'true');
        requiredIndicator.textContent = ' *';
        requiredIndicator.style.color = 'red';
        input.parentNode.appendChild(requiredIndicator);
      }

      // Add error message container
      const errorContainer = document.createElement('div');
      errorContainer.id = `${id}-error`;
      errorContainer.className = 'error-message sr-only';
      errorContainer.setAttribute('role', 'alert');
      input.parentNode.appendChild(errorContainer);

      this.setARIAAttribute(input, 'describedby', `${id}-error`);
    });
  }

  showFormError(input, message) {
    const errorId = `${input.id}-error`;
    const errorContainer = document.getElementById(errorId);
    
    if (errorContainer) {
      errorContainer.textContent = message;
      errorContainer.classList.remove('sr-only');
      this.setARIAAttribute(input, 'invalid', 'true');
      this.announce(`Form error: ${message}`, 'assertive');
    }
  }

  clearFormError(input) {
    const errorId = `${input.id}-error`;
    const errorContainer = document.getElementById(errorId);
    
    if (errorContainer) {
      errorContainer.textContent = '';
      errorContainer.classList.add('sr-only');
      this.setARIAAttribute(input, 'invalid', 'false');
    }
  }

  // Image Accessibility
  enhanceImageAccessibility(img) {
    // Add alt text if missing
    if (!img.alt) {
      img.alt = 'Image';
    }

    // Add role for decorative images
    if (img.hasAttribute('data-decorative')) {
      img.setAttribute('role', 'presentation');
      img.alt = '';
    }

    // Add longdesc for complex images
    if (img.hasAttribute('data-longdesc')) {
      const longdesc = img.getAttribute('data-longdesc');
      img.setAttribute('aria-describedby', longdesc);
    }
  }

  // Video Accessibility
  enhanceVideoAccessibility(video) {
    // Add captions track if missing
    if (!video.querySelector('track[kind="captions"]')) {
      const track = document.createElement('track');
      track.kind = 'captions';
      track.label = 'Thai Captions';
      track.srclang = 'th';
      track.src = 'captions.vtt';
      video.appendChild(track);
    }

    // Add audio description
    if (!video.querySelector('track[kind="descriptions"]')) {
      const track = document.createElement('track');
      track.kind = 'descriptions';
      track.label = 'Thai Descriptions';
      track.srclang = 'th';
      track.src = 'descriptions.vtt';
      video.appendChild(track);
    }
  }

  // Table Accessibility
  enhanceTableAccessibility(table) {
    // Add caption if missing
    if (!table.querySelector('caption')) {
      const caption = document.createElement('caption');
      caption.textContent = 'Data Table';
      table.insertBefore(caption, table.firstChild);
    }

    // Add scope to headers
    const headers = table.querySelectorAll('th');
    headers.forEach(header => {
      if (!header.hasAttribute('scope')) {
        header.setAttribute('scope', 'col');
      }
    });
  }

  // Link Accessibility
  enhanceLinkAccessibility(link) {
    // Add aria-label for icon-only links
    if (link.textContent.trim() === '' && link.querySelector('svg, img')) {
      const iconText = link.querySelector('svg, img').getAttribute('alt') || 'Link';
      this.setARIAAttribute(link, 'label', iconText);
    }

    // Add external link indicator
    if (link.hostname !== window.location.hostname) {
      this.setARIAAttribute(link, 'label', `${link.textContent} (opens in new tab)`);
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
    }
  }

  // Button Accessibility
  enhanceButtonAccessibility(button) {
    // Add aria-label for icon-only buttons
    if (button.textContent.trim() === '' && button.querySelector('svg, img')) {
      const iconText = button.querySelector('svg, img').getAttribute('alt') || 'Button';
      this.setARIAAttribute(button, 'label', iconText);
    }

    // Add pressed state for toggle buttons
    if (button.hasAttribute('aria-pressed')) {
      button.addEventListener('click', () => {
        const isPressed = button.getAttribute('aria-pressed') === 'true';
        this.setARIAAttribute(button, 'pressed', !isPressed);
      });
    }
  }

  // Navigation Accessibility
  enhanceNavigationAccessibility(nav) {
    // Add nav role
    nav.setAttribute('role', 'navigation');
    
    // Add aria-label
    if (!nav.hasAttribute('aria-label')) {
      nav.setAttribute('aria-label', 'Main navigation');
    }

    // Add current page indicator
    const links = nav.querySelectorAll('a');
    links.forEach(link => {
      if (link.href === window.location.href) {
        this.setARIAAttribute(link, 'current', 'page');
      }
    });
  }

  // Loading State Accessibility
  showLoadingState(element, message = 'Loading...') {
    const loadingId = 'loading-indicator';
    let loadingIndicator = document.getElementById(loadingId);
    
    if (!loadingIndicator) {
      loadingIndicator = document.createElement('div');
      loadingIndicator.id = loadingId;
      loadingIndicator.setAttribute('role', 'status');
      loadingIndicator.setAttribute('aria-live', 'polite');
      loadingIndicator.className = 'sr-only';
      document.body.appendChild(loadingIndicator);
    }
    
    loadingIndicator.textContent = message;
    this.setARIAAttribute(element, 'busy', 'true');
  }

  hideLoadingState(element) {
    const loadingIndicator = document.getElementById('loading-indicator');
    
    if (loadingIndicator) {
      loadingIndicator.textContent = '';
    }
    
    this.setARIAAttribute(element, 'busy', 'false');
  }

  // Progress Bar Accessibility
  updateProgressBar(progressBar, value, max = 100) {
    this.setARIAAttribute(progressBar, 'valuemin', '0');
    this.setARIAAttribute(progressBar, 'valuemax', max);
    this.setARIAAttribute(progressBar, 'valuenow', value);
    this.setARIAAttribute(progressBar, 'valuetext', `${value}% complete`);
  }

  // Tooltip Accessibility
  enhanceTooltipAccessibility(tooltip, trigger) {
    this.setARIAAttribute(trigger, 'describedby', tooltip.id);
    tooltip.setAttribute('role', 'tooltip');
    tooltip.setAttribute('id', tooltip.id || `tooltip-${Date.now()}`);
  }

  // Reduce Motion Support
  setupReducedMotion() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    if (prefersReducedMotion.matches) {
      document.documentElement.classList.add('reduced-motion');
    }

    prefersReducedMotion.addEventListener('change', () => {
      if (prefersReducedMotion.matches) {
        document.documentElement.classList.add('reduced-motion');
      } else {
        document.documentElement.classList.remove('reduced-motion');
      }
    });
  }
}

// Create singleton instance
const accessibilityManager = new AccessibilityManager();

export default accessibilityManager;
