/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./public/**/*.{html,js}",
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['Prompt', 'Inter', 'sans-serif'], 
        body: ['Inter', 'Prompt', 'sans-serif'],
        // Explicitly defining Thai-font to be Prompt for specific usage where dual-language is expected
        'Thai-font': ['Prompt', 'sans-serif'],
      },
      colors: {
        brand: {
          black: '#030305',     // Deep Obsidian Black
          obsidian: '#0a0a0e',  // Deep Indigo-Black
          surface: '#111116',   // Studio Gray
          primary: '#eab308',   // Premium Gold
          accent: '#a78bfa',    // Soft Amethyst (Violet)
          muted: '#71717a',     // Stone Muted
        },
        text: {
          main: '#e5e7eb',
          muted: '#6b7280',
        }
      },
      fontSize: {
        'xxs': '0.7rem',
        'xs': '0.75rem',
        'sm': '0.875rem',
        'base': '1rem',
        'lg': '1.125rem',
        'xl': '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.6s ease-out forwards',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
