# DUYDODEE Design System Reference

## 🎨 Colors
- **Brand Black:** `#050507` (Background)
- **Brand Obsidian:** `#0d0d12` (Cards/Secondary background)
- **Brand Gold (Primary):** `#fbbf24` (Buttons, Highlights, Badges)
- **Brand Accent:** `#a78bfa` (Special elements)
- **Brand Surface:** `#121218` (Sections)

## 🔤 Typography
- **Primary Font:** 'Prompt', 'Inter', sans-serif (Thai & English)
- **Classes:**
  - `.Thai-font`: Standard Prompt font usage.
  - `font-black`: Used for heavy cinematic headings.
  - `tracking-[0.1em]` or `tracking-[0.3em]`: Used for cinematic wide-spaced labels.

## 🧊 UI Elements (Tailwind & Custom)
- **Glassmorphism:** `.glass-premium` (`bg-[#0f0f13]/80 backdrop-blur-3xl border border-white/5 shadow-2xl rounded-2xl`)
- **Buttons:**
  - `.btn-primary`: Gold background, black text, uppercase.
  - `.btn-secondary`: Dark transparent background, white border.
- **Aspect Ratios:**
  - Movie Posters: `aspect-[2/3]`
  - Banners/Hero: `aspect-video` (16:9)

## ✨ Animations
- `animate-fade-in`: Smooth entrance.
- `animate-slide-up`: Upward slide on load.
- `hover:scale-105`: Standard hover effect for cards.
