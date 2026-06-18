/**
 * 🌓 DUYดูDEE THEME TOGGLE COMPONENT
 * Beautiful animated toggle button for light/dark mode switching
 */

import { ThemeService } from '../services/theme-service.js';

export const ThemeToggle = {
    /**
     * Create theme toggle button with sun/moon icons
     * @returns {string} HTML string for theme toggle button
     */
    createButton() {
        const isDark = ThemeService.isDarkMode();
        const icon = isDark ? 'sun' : 'moon';
        const label = isDark ? 'สว่าง' : 'มืด';

        return `
            <button 
                id="theme-toggle" 
                class="theme-toggle-btn relative p-2 rounded-full bg-brand-surface border border-white/10 
                       hover:border-brand-primary/50 transition-all duration-300
                       hover:scale-110 active:scale-95 group"
                aria-label="${label}โหมด"
                onclick="ThemeToggle.handleClick()"
            >
                <div class="relative w-6 h-6">
                    <!-- Sun Icon (Light Mode) -->
                    <i data-lucide="sun" class="absolute inset-0 w-6 h-6 text-brand-gold 
                                             transition-all duration-300 opacity-0 scale-0
                                             ${!isDark ? 'opacity-100 scale-100' : ''}"></i>
                    
                    <!-- Moon Icon (Dark Mode) -->
                    <i data-lucide="moon" class="absolute inset-0 w-6 h-6 text-brand-primary 
                                             transition-all duration-300 opacity-0 scale-0
                                             ${isDark ? 'opacity-100 scale-100' : ''}"></i>
                </div>
                
                <!-- Glow Effect -->
                <div class="absolute inset-0 rounded-full bg-gradient-to-r 
                              from-brand-primary/20 to-brand-gold/20 
                              opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
        `;
    },

    /**
     * Handle theme toggle click
     */
    handleClick() {
        const newTheme = ThemeService.toggleTheme();
        ThemeToggle.updateButton(newTheme);
    },

    /**
     * Update button appearance based on theme
     * @param {string} theme - 'dark' or 'light'
     */
    updateButton(theme) {
        const button = document.getElementById('theme-toggle');
        if (!button) {
            return;
        }

        const sunIcon = button.querySelector('[data-lucide="sun"]');
        const moonIcon = button.querySelector('[data-lucide="moon"]');
        const label = theme === 'dark' ? 'สว่าง' : 'มืด';

        if (theme === ThemeService.DARK_MODE) {
            moonIcon.classList.remove('opacity-0', 'scale-0');
            moonIcon.classList.add('opacity-100', 'scale-100');
            sunIcon.classList.add('opacity-0', 'scale-0');
            sunIcon.classList.remove('opacity-100', 'scale-100');
        } else {
            sunIcon.classList.remove('opacity-0', 'scale-0');
            sunIcon.classList.add('opacity-100', 'scale-100');
            moonIcon.classList.add('opacity-0', 'scale-0');
            moonIcon.classList.remove('opacity-100', 'scale-100');
        }

        button.setAttribute('aria-label', `${label}โหมด`);

        // Update mobile theme toggle icons
        this.updateMobileButton(theme);
    },

    /**
     * Update mobile theme toggle button
     * @param {string} theme - 'dark' or 'light'
     */
    updateMobileButton(theme) {
        const mobileButton = document.getElementById('mobile-theme-toggle');
        if (!mobileButton) {
            return;
        }

        const sunIcon = mobileButton.querySelector('.mobile-sun-icon');
        const moonIcon = mobileButton.querySelector('.mobile-moon-icon');

        if (theme === ThemeService.DARK_MODE) {
            sunIcon.classList.add('hidden');
            moonIcon.classList.remove('hidden');
        } else {
            sunIcon.classList.remove('hidden');
            moonIcon.classList.add('hidden');
        }
    },

    /**
     * Initialize theme toggle and listen for theme changes
     */
    init() {
        // Listen for theme changes from other components
        window.addEventListener('theme-changed', (e) => {
            this.updateButton(e.detail.theme);
        });

        // Re-initialize Lucide icons after theme change
        window.addEventListener('theme-changed', () => {
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        });
    }
};

// Auto-initialize on import
if (typeof window !== 'undefined') {
    ThemeToggle.init();
    // Make available globally for inline event handlers
    window.ThemeToggle = ThemeToggle;
}
