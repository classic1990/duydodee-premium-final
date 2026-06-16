/**
 * ♿ DUYดูDEE Accessibility Utilities
 * Functions to improve accessibility compliance
 */

export const AccessibilityUtils = {
    /**
     * Create skip to main content link
     */
    createSkipLink: () => {
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.textContent = 'ไปยังเนื้อหาหลัก';
        skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:bg-brand-primary focus:text-white focus:px-4 focus:py-2 focus:rounded-lg';
        skipLink.setAttribute('aria-label', 'ไปยังเนื้อหาหลัก');

        // Add to beginning of body
        document.body.insertBefore(skipLink, document.body.firstChild);

        // Add id to main content
        const main = document.querySelector('main');
        if (main) {
            main.id = 'main-content';
            main.setAttribute('tabindex', '-1');
        }
    },

    /**
     * Add ARIA labels to interactive elements
     */
    addARIALabels: () => {
        // Add ARIA labels to buttons without text
        const buttonsWithoutText = document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])');
        buttonsWithoutText.forEach(button => {
            if (!button.textContent.trim()) {
                const icon = button.querySelector('i[data-lucide]');
                if (icon) {
                    const iconName = icon.getAttribute('data-lucide');
                    button.setAttribute('aria-label', iconName);
                }
            } else {
                // Add aria-label to buttons with text but missing label
                button.setAttribute('aria-label', button.textContent.trim());
            }
        });

        // Add ARIA labels to inputs without labels
        const inputsWithoutLabels = document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])');
        inputsWithoutLabels.forEach(input => {
            const placeholder = input.getAttribute('placeholder');
            if (placeholder && !input.id) {
                input.id = `input-${Math.random().toString(36).substr(2, 9)}`;
                const label = document.createElement('label');
                label.textContent = placeholder;
                label.setAttribute('for', input.id);
                label.className = 'sr-only';
                input.parentNode.insertBefore(label, input);
            }
            if (placeholder) {
                input.setAttribute('aria-label', placeholder);
            }
        });

        // Add ARIA labels to links
        const linksWithoutText = document.querySelectorAll('a:not([aria-label]):not([aria-labelledby])');
        linksWithoutText.forEach(link => {
            if (!link.textContent.trim()) {
                const img = link.querySelector('img');
                if (img) {
                    const altText = img.getAttribute('alt') || 'Link';
                    link.setAttribute('aria-label', altText);
                }
            } else {
                link.setAttribute('aria-label', link.textContent.trim());
            }
        });

        // Add ARIA labels to cards/posters
        const movieCards = document.querySelectorAll('.movie-card, .trending-card');
        movieCards.forEach(card => {
            const title = card.querySelector('h3, h4')?.textContent || 'Movie Card';
            if (!card.getAttribute('aria-label')) {
                card.setAttribute('aria-label', `คลิกเพื่อดู ${title}`);
            }
        });
    },

    /**
     * Improve keyboard navigation
     */
    improveKeyboardNavigation: () => {
        // Add keyboard event listeners for interactive elements
        document.addEventListener('keydown', (e) => {
            // Escape key to close modals
            if (e.key === 'Escape') {
                const modals = document.querySelectorAll('[role="dialog"][aria-hidden="false"]');
                modals.forEach(modal => {
                    const closeEvent = new CustomEvent('closemodal');
                    modal.dispatchEvent(closeEvent);
                });
            }

            // Tab trap in modals
            if (e.key === 'Tab') {
                const activeModal = document.querySelector('[role="dialog"][aria-hidden="false"]');
                if (activeModal) {
                    const focusableElements = activeModal.querySelectorAll(
                        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                    );
                    const firstFocusable = focusableElements[0];
                    const lastFocusable = focusableElements[focusableElements.length - 1];

                    if (e.shiftKey && document.activeElement === firstFocusable) {
                        e.preventDefault();
                        lastFocusable.focus();
                    } else if (!e.shiftKey && document.activeElement === lastFocusable) {
                        e.preventDefault();
                        firstFocusable.focus();
                    }
                }
            }
        });
    },

    /**
     * Add focus management
     */
    addFocusManagement: () => {
        // Add focus styles to all interactive elements
        const style = document.createElement('style');
        style.textContent = `
            *:focus {
                outline: 2px solid #f59e0b !important;
                outline-offset: 2px !important;
            }
            *:focus:not(:focus-visible) {
                outline: none !important;
            }
            *:focus-visible {
                outline: 2px solid #f59e0b !important;
                outline-offset: 2px !important;
            }
        `;
        document.head.appendChild(style);
    },

    /**
     * Add landmark roles
     */
    addLandmarkRoles: () => {
        // Ensure main content has main role
        const main = document.querySelector('main');
        if (main && !main.hasAttribute('role')) {
            main.setAttribute('role', 'main');
        }

        // Ensure navigation has nav role
        const navs = document.querySelectorAll('nav:not([role])');
        navs.forEach(nav => nav.setAttribute('role', 'navigation'));

        // Ensure footer has contentinfo role
        const footer = document.querySelector('footer:not([role])');
        if (footer) {
            footer.setAttribute('role', 'contentinfo');
        }
    },

    /**
     * Check and improve heading hierarchy
     */
    improveHeadingHierarchy: () => {
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        let lastLevel = 0;

        headings.forEach(heading => {
            const currentLevel = parseInt(heading.tagName[1]);

            // Skip heading levels (should increment by 1)
            if (currentLevel > lastLevel + 1) {
                console.warn('Heading hierarchy skip:', heading.tagName, heading.textContent);
            }

            lastLevel = currentLevel;
        });
    },

    /**
     * Add live regions for dynamic content
     */
    addLiveRegions: () => {
        // Create live region for announcements
        const liveRegion = document.createElement('div');
        liveRegion.id = 'accessibility-live-region';
        liveRegion.setAttribute('role', 'status');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'sr-only';
        document.body.appendChild(liveRegion);

        // Function to announce messages to screen readers
        window.announceToScreenReader = (message) => {
            const region = document.getElementById('accessibility-live-region');
            if (region) {
                region.textContent = message;
                setTimeout(() => region.textContent = '', 1000);
            }
        };
    },

    /**
     * Improve form accessibility
     */
    improveFormAccessibility: () => {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            // Ensure form has accessible name
            if (!form.hasAttribute('aria-label') && !form.hasAttribute('aria-labelledby')) {
                const heading = form.querySelector('h1, h2, h3, h4, h5, h6, legend');
                if (heading) {
                    const headingId = heading.id || `heading-${Math.random().toString(36).substr(2, 9)}`;
                    if (!heading.id) {
                        heading.id = headingId;
                    }
                    form.setAttribute('aria-labelledby', headingId);
                }
            }

            // Ensure form has submit handler or prevents default
            form.addEventListener('submit', (_e) => {
                if (!form.hasAttribute('novalidate')) {
                    // Add client-side validation
                }
            });
        });
    },

    /**
     * Add alt text suggestions for images
     */
    suggestAltText: () => {
        const imagesWithoutAlt = document.querySelectorAll('img:not([alt]), img[alt=""]');
        imagesWithoutAlt.forEach(img => {
            // Log missing alt text for manual review
            console.warn('Image missing alt text:', img.src);

            // Try to generate meaningful alt text from context
            const parentText = img.closest('a, button, div')?.textContent.trim();
            if (parentText) {
                img.setAttribute('alt', parentText.substring(0, 100));
            } else {
                img.setAttribute('alt', 'รูปภาพประกอบเนื้อหา');
            }
        });
    },

    /**
     * Check color contrast (basic check)
     */
    checkColorContrast: () => {
        const elements = document.querySelectorAll('*');
        const warnings = [];

        elements.forEach(element => {
            const styles = window.getComputedStyle(element);
            const _color = styles.color;
            const backgroundColor = styles.backgroundColor;

            // Basic contrast check (should be at least 4.5:1 for normal text)
            // This is a simplified check - proper implementation would use WCAG contrast formulas
            if (backgroundColor !== 'rgba(0, 0, 0, 0)' && backgroundColor !== 'transparent') {
                // Check if colors are too similar
                // This is a placeholder for actual contrast calculation
            }
        });

        if (warnings.length > 0) {
            console.warn('Color contrast warnings:', warnings);
        }
    },

    /**
     * Initialize all accessibility improvements
     */
    init: () => {
        AccessibilityUtils.createSkipLink();
        AccessibilityUtils.addARIALabels();
        AccessibilityUtils.improveKeyboardNavigation();
        AccessibilityUtils.addFocusManagement();
        AccessibilityUtils.addLandmarkRoles();
        AccessibilityUtils.improveHeadingHierarchy();
        AccessibilityUtils.addLiveRegions();
        AccessibilityUtils.improveFormAccessibility();
        AccessibilityUtils.suggestAltText();
        AccessibilityUtils.checkColorContrast();

        // eslint-disable-next-line no-console
        console.log('♿ Accessibility improvements initialized');
    }
};

export default AccessibilityUtils;
