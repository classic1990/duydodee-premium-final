/**
 * ✨ DUYดูDEE UI/UX Enhancements
 * Micro-interactions and visual improvements
 */

export const UIUXEnhancements = {
    /**
     * Add smooth scroll behavior
     */
    initSmoothScroll: () => {
        document.documentElement.style.scrollBehavior = 'smooth';
    },

    /**
     * Add ripple effect to buttons
     */
    initRippleEffect: () => {
        const buttons = document.querySelectorAll('.btn-primary, .btn-secondary, button:not([aria-label])');
        buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                const ripple = document.createElement('span');
                ripple.className = 'ripple';

                const rect = button.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;

                ripple.style.width = ripple.style.height = `${size}px`;
                ripple.style.left = `${x}px`;
                ripple.style.top = `${y}px`;

                button.appendChild(ripple);

                setTimeout(() => ripple.remove(), 600);
            });
        });
    },

    /**
     * Add parallax effect to hero sections
     */
    initParallaxEffect: () => {
        const heroSection = document.querySelector('.hero-section, #master-hero');
        if (!heroSection) {
            return;
        }

        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const parallaxBg = heroSection.querySelector('img, .bg-image');

            if (parallaxBg) {
                parallaxBg.style.transform = `translateY(${scrolled * 0.5}px)`;
            }
        });
    },

    /**
     * Add hover effects to cards
     */
    initCardHoverEffects: () => {
        const cards = document.querySelectorAll('.movie-card, .trending-card');
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-4px)';
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
            });
        });
    },

    /**
     * Add skeleton loading improvements
     */
    improveSkeletonLoading: () => {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes shimmer {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
            }
            
            .skeleton-shimmer {
                background: linear-gradient(90deg, #1a1a1a 25%, #2a2a2a 50%, #1a1a1a 75%);
                background-size: 200% 100%;
                animation: shimmer 1.5s infinite;
            }
            
            .skeleton-item {
                animation: fadeIn 0.3s ease-in;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            .loading-state {
                position: relative;
                overflow: hidden;
            }
            
            .loading-state::after {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
                animation: shimmer 1.5s infinite;
            }
        `;
        document.head.appendChild(style);
    },

    /**
     * Add image lazy loading with fade-in effect
     */
    initLazyLoading: () => {
        const images = document.querySelectorAll('img[data-src], img[loading="lazy"]');

        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;

                    img.classList.add('opacity-0', 'transition-opacity', 'duration-300');

                    img.onload = () => {
                        img.classList.remove('opacity-0');
                        img.classList.add('opacity-100');
                    };

                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                    }

                    imageObserver.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px',
            threshold: 0.1
        });

        images.forEach(img => imageObserver.observe(img));
    },

    /**
     * Add progress bar improvements
     */
    improveProgressBars: () => {
        const progressBars = document.querySelectorAll('.progress-bar, .loading-progress');
        progressBars.forEach(bar => {
            const container = bar.parentElement;

            // Add percentage label
            const percentage = Math.round(parseFloat(bar.style.width));
            if (percentage > 0 && percentage < 100) {
                const label = document.createElement('span');
                label.className = 'text-xs text-gray-400 absolute right-2 top-1/2 -translate-y-1/2';
                label.textContent = `${percentage}%`;
                container.appendChild(label);
            }
        });
    },

    /**
     * Add touch feedback for mobile
     */
    initTouchFeedback: () => {
        const interactiveElements = document.querySelectorAll('button, a, .movie-card, .trending-card');

        interactiveElements.forEach(element => {
            element.addEventListener('touchstart', () => {
                element.classList.add('scale-95', 'opacity-80', 'transition-transform');
            });

            element.addEventListener('touchend', () => {
                element.classList.remove('scale-95', 'opacity-80');
                element.classList.add('scale-100');

                setTimeout(() => {
                    element.classList.remove('scale-100', 'transition-transform');
                }, 150);
            });
        });
    },

    /**
     * Add smooth transitions for theme changes
     */
    improveThemeTransitions: () => {
        const style = document.createElement('style');
        style.textContent = `
            * {
                transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
            }
            
            [data-theme="light"] {
                --bg-primary: #ffffff;
                --text-primary: #1a1a1a;
            }
            
            [data-theme="dark"] {
                --bg-primary: #050507;
                --text-primary: #f3f4f6;
            }
        `;
        document.head.appendChild(style);
    },

    /**
     * Add focus ring improvements
     */
    improveFocusRings: () => {
        const style = document.createElement('style');
        style.textContent = `
            *:focus-visible {
                outline: 2px solid #f59e0b !important;
                outline-offset: 2px !important;
                border-radius: 4px;
            }
            
            button:focus-visible,
            a:focus-visible,
            input:focus-visible {
                outline: 2px solid #f59e0b !important;
                outline-offset: 2px !important;
            }
        `;
        document.head.appendChild(style);
    },

    /**
     * Add tooltip improvements
     */
    improveTooltips: () => {
        const tooltipElements = document.querySelectorAll('[title]:not([aria-label])');

        tooltipElements.forEach(element => {
            const title = element.getAttribute('title');
            if (!title) {
                return;
            }

            element.removeAttribute('title');
            element.setAttribute('data-tooltip', title);

            element.addEventListener('mouseenter', () => {
                const tooltip = document.createElement('div');
                tooltip.className = 'tooltip absolute bg-black text-white text-xs px-2 py-1 rounded shadow-lg z-50';
                tooltip.textContent = title;
                tooltip.style.bottom = '100%';
                tooltip.style.left = '50%';
                tooltip.style.transform = 'translateX(-50%)';
                tooltip.style.marginTop = '8px';

                element.appendChild(tooltip);
            });

            element.addEventListener('mouseleave', () => {
                const tooltip = element.querySelector('.tooltip');
                if (tooltip) {
                    tooltip.remove();
                }
            });
        });
    },

    /**
     * Initialize all UI/UX enhancements
     */
    init: () => {
        UIUXEnhancements.initSmoothScroll();
        UIUXEnhancements.initRippleEffect();
        UIUXEnhancements.initParallaxEffect();
        UIUXEnhancements.initCardHoverEffects();
        UIUXEnhancements.improveSkeletonLoading();
        UIUXEnhancements.initLazyLoading();
        UIUXEnhancements.improveProgressBars();
        UIUXEnhancements.initTouchFeedback();
        UIUXEnhancements.improveThemeTransitions();
        UIUXEnhancements.improveFocusRings();
        UIUXEnhancements.improveTooltips();

        // eslint-disable-next-line no-console
        console.log('✨ UI/UX enhancements initialized');
    }
};

export default UIUXEnhancements;
