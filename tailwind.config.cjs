/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Enable class-based dark mode
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
          // Premium Black Palette (Dark Mode)
          black: '#050505',     // Deep Matte Black
          'black-light': '#0a0a0a',
          obsidian: '#0d0d0f',  // Premium Dark Surface
          charcoal: '#121214',   // Lighter Dark Surface
          surface: '#1a1a1d',   // Elevated Surface
          'surface-light': '#252529',
          
          // Light Mode Palette
          white: '#ffffff',     // Pure White
          'white-dark': '#f5f5f5',  // Light Grey Surface
          'white-surface': '#f9fafb',  // Light Surface
          'white-charcoal': '#e5e7eb',  // Light Grey
          'white-obsidian': '#d1d5db',  // Medium Grey
          
          // Premium Red Palette - Enhanced
          primary: '#E50914',   // Netflix-style Vibrant Red
          'primary-dark': '#b20710',
          'primary-light': '#f40612',
          accent: '#8B0000',    // Deep Crimson
          'accent-dark': '#680000',
          crimson: '#DC143C',   // Cinematic Red
          
          // Premium Gold Palette - Enhanced
          gold: '#D4AF37',      // Classic Gold
          'gold-light': '#F4D03F',
          'gold-dark': '#B8860B',
          bronze: '#CD7F32',
          copper: '#B87333',
          
          // Supporting Colors
          muted: '#6b6b6b',     // Neutral Grey
          'muted-light': '#8a8a8a',
          silver: '#C0C0C0',
          platinum: '#E5E4E2',
          
          // Status Colors
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
          info: '#3b82f6',
        },
        text: {
          // Dark Mode Text
          main: '#ffffff',      // Pure White
          'main-dim': '#f0f0f0',
          muted: '#b3b3b3',     // Light Grey
          'muted-dark': '#808080',
          
          // Light Mode Text
          'dark-main': '#111827',  // Dark Grey
          'dark-dim': '#1f2937',   // Medium Grey
          'dark-muted': '#6b7280', // Light Grey
          'dark-muted-dim': '#9ca3af', // Very Light Grey
        }
      },
      fontSize: {
        'xxs': '0.65rem',
        'xs': '0.75rem',
        'sm': '0.875rem',
        'base': '1rem',
        'lg': '1.125rem',
        'xl': '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
        '6xl': '3.75rem',
        '7xl': '4.5rem',
      },
      borderRadius: {
        '4xl': '2.5rem',
        '5xl': '3rem',
      },
      boxShadow: {
        'glow-red': '0 0 30px rgba(229, 9, 20, 0.5)',
        'glow-red-strong': '0 0 50px rgba(229, 9, 20, 0.7)',
        'glow-gold': '0 0 30px rgba(212, 175, 55, 0.4)',
        'glow-gold-strong': '0 0 50px rgba(212, 175, 55, 0.6)',
        'inner-premium': 'inset 0 2px 4px rgba(0, 0, 0, 0.3)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.37)',
      },
      backdropBlur: {
        'xs': '2px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'fade-in-down': 'fadeInDown 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.6s ease-out forwards',
        'slide-down': 'slideDown 0.6s ease-out forwards',
        'slide-left': 'slideLeft 0.6s ease-out forwards',
        'slide-right': 'slideRight 0.6s ease-out forwards',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'glow-gold': 'glowGold 3s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'spin-slow': 'spin 3s linear infinite',
        'bounce-slow': 'bounce 2s infinite',
        'scale-in': 'scaleIn 0.3s ease-out forwards',
        'scale-out': 'scaleOut 0.3s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideLeft: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideRight: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(229, 9, 20, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(229, 9, 20, 0.6)' },
        },
        glowGold: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(212, 175, 55, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(212, 175, 55, 0.5)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        scaleOut: {
          '0%': { opacity: '1', transform: 'scale(1)' },
          '100%': { opacity: '0', transform: 'scale(0.9)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'premium-gradient': 'linear-gradient(135deg, #050505 0%, #0d0d0f 50%, #121214 100%)',
        'gold-gradient': 'linear-gradient(135deg, #D4AF37 0%, #F4D03F 50%, #D4AF37 100%)',
        'red-gradient': 'linear-gradient(135deg, #E50914 0%, #B20710 100%)',
      },
    },
  },
  plugins: [],
}
