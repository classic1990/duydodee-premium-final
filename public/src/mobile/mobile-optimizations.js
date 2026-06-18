/**
 * 📱 DUYดูDEE Mobile Optimizations
 * การปรับปรุงสำหรับอุปกรณ์มือถือและ responsive design
 */

/**
 * Mobile Detection and Optimization
 */
export class MobileOptimizer {
    /**
     * Detect if device is mobile
     */
    static isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               (window.innerWidth <= 768);
    }

    /**
     * Detect if device is tablet
     */
    static isTablet() {
        return /iPad|Android/i.test(navigator.userAgent) && window.innerWidth > 768 && window.innerWidth <= 1024;
    }

    /**
     * Detect device type
     */
    static getDeviceType() {
        if (this.isMobile()) return 'mobile';
        if (this.isTablet()) return 'tablet';
        return 'desktop';
    }

    /**
     * Get device orientation
     */
    static getOrientation() {
        return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
    }

    /**
     * Apply mobile-specific optimizations
     */
    static applyMobileOptimizations() {
        if (!this.isMobile()) return;

        // Disable certain animations on mobile for performance
        document.body.classList.add('mobile-optimized');

        // Optimize touch targets
        this.optimizeTouchTargets();

        // Enable pull-to-refresh
        this.enablePullToRefresh();

        // Optimize images for mobile
        this.optimizeImagesForMobile();
    }

    /**
     * Optimize touch targets for mobile
     */
    static optimizeTouchTargets() {
        const minTouchTarget = 44; // iOS recommendation

        document.querySelectorAll('button, a, input').forEach(element => {
            const styles = window.getComputedStyle(element);
            const width = parseInt(styles.width) || element.offsetWidth;
            const height = parseInt(styles.height) || element.offsetHeight;

            if (width < minTouchTarget || height < minTouchTarget) {
                element.style.minWidth = `${minTouchTarget}px`;
                element.style.minHeight = `${minTouchTarget}px`;
            }
        });
    }

    /**
     * Enable pull-to-refresh on mobile
     */
    static enablePullToRefresh() {
        let startY = 0;
        let isPulling = false;

        document.addEventListener('touchstart', (e) => {
            if (window.scrollY === 0) {
                startY = e.touches[0].pageY;
                isPulling = true;
            }
        });

        document.addEventListener('touchmove', (e) => {
            if (!isPulling || window.scrollY > 0) {
                isPulling = false;
                return;
            }

            const currentY = e.touches[0].pageY;
            const diff = currentY - startY;

            if (diff > 100) {
                // Trigger refresh
                window.location.reload();
            }
        });

        document.addEventListener('touchend', () => {
            isPulling = false;
        });
    }

    /**
     * Optimize images for mobile
     */
    static optimizeImagesForMobile() {
        const images = document.querySelectorAll('img[data-src]');

        images.forEach(img => {
            if (window.innerWidth < 768) {
                // Use smaller images on mobile
                const originalSrc = img.dataset.src;
                const mobileSrc = originalSrc.replace(/w=\d+/, 'w=400');
                img.dataset.src = mobileSrc;
            }
        });
    }

    /**
     * Safe area handling for notched devices
     */
    static applySafeAreaInsets() {
        const style = document.createElement('style');
        style.textContent = `
            @supports (padding: max(0px)) {
                .mobile-optimized {
                    padding-left: max(env(safe-area-inset-left), 1rem);
                    padding-right: max(env(safe-area-inset-right), 1rem);
                    padding-top: max(env(safe-area-inset-top), 1rem);
                    padding-bottom: max(env(safe-area-inset-bottom), 1rem);
                }
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Initialize mobile optimizations
     */
    static initialize() {
        if (this.isMobile()) {
            this.applyMobileOptimizations();
            this.applySafeAreaInsets();
        }

        // Listen for orientation changes
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.applyMobileOptimizations();
            }, 100);
        });
    }
}

/**
 * Responsive Font Sizing
 */
export class ResponsiveFonts {
    /**
     * Apply responsive font sizes
     */
    static applyResponsiveFonts() {
        const root = document.documentElement;
        const screenWidth = window.innerWidth;

        // Base font size based on screen width
        let baseFontSize = 16;
        if (screenWidth < 480) baseFontSize = 14;
        else if (screenWidth < 768) baseFontSize = 15;
        else if (screenWidth < 1024) baseFontSize = 16;
        else baseFontSize = 18;

        root.style.fontSize = `${baseFontSize}px`;

        // Apply font scaling
        document.querySelectorAll('.responsive-text').forEach(element => {
            const scale = screenWidth < 768 ? 0.9 : 1;
            element.style.fontSize = `${parseFloat(getComputedStyle(element).fontSize) * scale}px`;
        });
    }
}

/**
 * Touch Gesture Support
 */
export class TouchGestures {
    /**
     * Add swipe detection to element
     */
    static addSwipeDetection(element, callbacks) {
        let startX, startY;
        const threshold = 50; // pixels

        element.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });

        element.addEventListener('touchend', (e) => {
            if (!startX || !startY) return;

            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            const diffX = endX - startX;
            const diffY = endY - startY;

            if (Math.abs(diffX) > Math.abs(diffY)) {
                // Horizontal swipe
                if (Math.abs(diffX) > threshold) {
                    if (diffX > 0 && callbacks.onSwipeRight) {
                        callbacks.onSwipeRight();
                    } else if (diffX < 0 && callbacks.onSwipeLeft) {
                        callbacks.onSwipeLeft();
                    }
                }
            } else {
                // Vertical swipe
                if (Math.abs(diffY) > threshold) {
                    if (diffY > 0 && callbacks.onSwipeDown) {
                        callbacks.onSwipeDown();
                    } else if (diffY < 0 && callbacks.onSwipeUp) {
                        callbacks.onSwipeUp();
                    }
                }
            }
        });
    }

    /**
     * Add pinch-to-zoom detection
     */
    static addPinchZoom(element, callbacks) {
        let initialDistance = 0;

        element.addEventListener('touchstart', (e) => {
            if (e.touches.length === 2) {
                initialDistance = this.getDistance(e.touches[0], e.touches[1]);
            }
        });

        element.addEventListener('touchmove', (e) => {
            if (e.touches.length === 2) {
                const currentDistance = this.getDistance(e.touches[0], e.touches[1]);
                const scale = currentDistance / initialDistance;

                if (callbacks.onZoom) {
                    callbacks.onZoom(scale);
                }
            }
        });
    }

    /**
     * Calculate distance between two touch points
     */
    static getDistance(touch1, touch2) {
        const dx = touch1.clientX - touch2.clientX;
        const dy = touch1.clientY - touch2.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }
}

/**
 * Initialize mobile optimizations on load
 */
export function initializeMobileOptimizations() {
    MobileOptimizer.initialize();
    ResponsiveFonts.applyResponsiveFonts();

    // Listen for resize events
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            ResponsiveFonts.applyResponsiveFonts();
        }, 250);
    });
}

export default {
    MobileOptimizer,
    ResponsiveFonts,
    TouchGestures,
    initializeMobileOptimizations
};