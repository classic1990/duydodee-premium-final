/**
 * 🌓 DUYดูDEE THEME SERVICE
 * Manages light/dark theme switching with localStorage persistence
 */

export const ThemeService = {
    THEME_KEY: 'duydodee_theme',
    DARK_MODE: 'dark',
    LIGHT_MODE: 'light',

    /**
     * Initialize theme from localStorage or system preference
     */
    init() {
        const savedTheme = localStorage.getItem(this.THEME_KEY);
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (savedTheme) {
            this.setTheme(savedTheme);
        } else if (prefersDark) {
            this.setTheme(this.DARK_MODE);
        } else {
            this.setTheme(this.LIGHT_MODE);
        }

        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem(this.THEME_KEY)) {
                this.setTheme(e.matches ? this.DARK_MODE : this.LIGHT_MODE);
            }
        });
    },

    /**
     * Set theme and update DOM
     * @param {string} theme - 'dark' or 'light'
     */
    setTheme(theme) {
        const html = document.documentElement;

        if (theme === this.LIGHT_MODE) {
            html.classList.add('light');
            html.classList.remove('dark');
        } else {
            html.classList.add('dark');
            html.classList.remove('light');
        }

        localStorage.setItem(this.THEME_KEY, theme);

        // Dispatch custom event for components to listen
        window.dispatchEvent(new CustomEvent('theme-changed', { detail: { theme } }));
    },

    /**
     * Toggle between light and dark mode
     */
    toggleTheme() {
        const currentTheme = this.getCurrentTheme();
        const newTheme = currentTheme === this.DARK_MODE ? this.LIGHT_MODE : this.DARK_MODE;
        this.setTheme(newTheme);
        return newTheme;
    },

    /**
     * Get current theme
     * @returns {string} Current theme ('dark' or 'light')
     */
    getCurrentTheme() {
        const html = document.documentElement;
        if (html.classList.contains('light')) {
            return this.LIGHT_MODE;
        }
        return this.DARK_MODE;
    },

    /**
     * Check if currently in dark mode
     * @returns {boolean}
     */
    isDarkMode() {
        return this.getCurrentTheme() === this.DARK_MODE;
    },

    /**
     * Check if currently in light mode
     * @returns {boolean}
     */
    isLightMode() {
        return this.getCurrentTheme() === this.LIGHT_MODE;
    }
};

// Auto-initialize on import
if (typeof window !== 'undefined') {
    ThemeService.init();
}
