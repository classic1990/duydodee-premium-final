# 👨‍💻 DEVELOPMENT.md - Development Guide

> ไกด์การพัฒนาและการทำงานกับโค้ด DUYดูDEE PREMIUM

---

## 📋 Table of Contents

- [Development Workflow](#development-workflow)
- [Code Architecture](#code-architecture)
- [Component Patterns](#component-patterns)
- [Service Patterns](#service-patterns)
- [Page Patterns](#page-patterns)
- [Styling Guide](#styling-guide)
- [Testing Guide](#testing-guide)
- [Debugging Guide](#debugging-guide)

---

## 🚀 Development Workflow

### Standard Development Loop

```bash
# 1. Start dev server
npm run dev
# Server runs at http://localhost:5173

# 2. Make changes to files
# - HTML files in public/
# - JS files in public/src/
# - CSS files in public/css/

# 3. Changes auto-reload (Vite HMR)

# 4. Test changes in browser

# 5. Lint code
npm run lint:fix

# 6. Build production
npm run build:prod

# 7. Deploy
firebase deploy --only hosting
```

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes
git add .
git commit -m "Add your feature"
git push origin feature/your-feature-name

# Create pull request
# (if using GitHub)
```

---

## 🏗️ Code Architecture

### File Organization Principles

**Component Location:**
- Reusable components → `src/components/`
- Page-specific logic → `src/pages/`
- Admin logic → `src/admin/`
- Services (Firebase) → `src/services/`
- Utilities → `src/utils/`

**Naming Conventions:**
- Files: `kebab-case.js` (e.g., `video-player.js`)
- Classes/Objects: `PascalCase` (e.g., `VideoPlayer`)
- Functions: `camelCase` (e.g., `renderPlayer`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `MAX_ITEMS`)

### Import Patterns

```javascript
// Import from services
import { ContentService } from '../services/content-service.js';
import { AuthService } from '../services/auth-service.js';

// Import from components
import { VideoPlayer } from '../components/player/VideoPlayer.js';
import { UI } from '../components/ui.js';

// Import from utilities
import { UIUtils } from '../utils/ui-utils.js';

// Import from constants
import { SCHEMA } from '../constants.js';
```

---

## 🧩 Component Patterns

### Creating a New Component

**Step 1: Create Component File**
```javascript
// src/components/NewComponent.js

export const NewComponent = {
  // Component methods
  render(data) {
    return `<div class="new-component">${data.title}</div>`;
  },

  init() {
    // Initialization logic
  }
};
```

**Step 2: Import in Page**
```javascript
// src/pages/new-page.js

import { NewComponent } from '../components/NewComponent.js';

document.addEventListener('DOMContentLoaded', () => {
  const component = NewComponent.render({ title: 'Hello' });
  container.innerHTML = component;
});
```

### Using Existing Components

```javascript
// UI Component (main)
import { UI } from '../components/ui.js';

// Show toast
UI.showToast('Success message', 'success');

// Show error
UI.showErrorPage('Error message');

// Refresh icons
UI.refreshIcons();

// Video Player
import { VideoPlayer } from '../components/player/VideoPlayer.js';

const player = await VideoPlayer.renderiPhonePlayer(movie, episodes, 0, false, UI);

// Movie Cards
import { MovieCards } from '../components/cards/MovieCards.js';

const card = MovieCards.createMovieCard(movie, type);
```

---

## 🔧 Service Patterns

### Using ContentService

```javascript
import { ContentService } from '../services/content-service.js';

// Get single item
const movie = await ContentService.getItemById('movie', movieId);

// Get multiple items
const movies = await ContentService.getItems('movie', 10);

// Search items
const results = await ContentService.searchItems('keyword', 12);

// Toggle watchlist
const status = await ContentService.toggleWatchlist(movieId, movie, 'movie');

// Increment view count
await ContentService.incrementViewCount('movie', movieId);
```

### Using AuthService

```javascript
import { AuthService } from '../services/auth-service.js';

// Get current user
const user = AuthService.auth.currentUser;

// Listen to auth changes
AuthService.onStateChanged((user) => {
  console.log('Auth state changed:', user);
});

// Check if admin
const isAdmin = await AuthService.checkIsAdmin(user);

// Check if Google user
const isGoogle = AuthService.isGoogleUser(user);

// Save watch history
await AuthService.saveWatchHistory(user.uid, movie, progress);

// Sign out
await AuthService.signOut();
```

### Using ChatService

```javascript
import { ChatService } from '../services/chat-service.js';

// Send message
await ChatService.sendMessage(user.uid, message);

// Get messages
const messages = await ChatService.getMessages(limit);

// Listen to new messages
ChatService.onNewMessage((message) => {
  console.log('New message:', message);
});
```

---

## 📄 Page Patterns

### Creating a New Page

**Step 1: Create HTML File**
```html
<!-- public/new-page.html -->
<!DOCTYPE html>
<html lang="th">
<head>
  <title>New Page</title>
  <link rel="stylesheet" href="/css/output.css">
  <link rel="stylesheet" href="/css/fonts.css">
  <script src="https://unpkg.com/lucide@0.410.0"></script>
</head>
<body class="bg-brand-black text-white">
  <nav id="navbar"></nav>
  <main>
    <div id="page-container"></div>
  </main>

  <script type="module" src="/src/pages/new-page.js"></script>
  <script>
    lucide.createIcons();
  </script>
</body>
</html>
```

**Step 2: Create JS File**
```javascript
// src/pages/new-page.js

import { ContentService } from '../services/content-service.js';
import { UI } from '../components/ui.js';

document.addEventListener('DOMContentLoaded', async () => {
  UI.initNavbar();

  // Your page logic here
  const container = document.getElementById('page-container');
  container.innerHTML = '<p>New Page Content</p>';
});
```

**Step 3: Add to vite.config.js**
```javascript
input: {
  // ... existing pages
  'new-page': resolve('public/new-page.html')
}
```

### Watch Page Pattern (Movie)

```javascript
// src/pages/movie/watch.js

import { ContentService } from '../services/content-service.js';
import { AuthService } from '../services/auth-service.js';
import { UI } from '../components/ui.js';

let currentUser = null;
let progressInterval = null;

document.addEventListener('DOMContentLoaded', async () => {
  UI.initNavbar();

  // Track auth state
  AuthService.onStateChanged(user => {
    currentUser = user;
  });

  // Get movie ID from URL
  const params = new URLSearchParams(window.location.search);
  const movieId = params.get('id');

  if (!movieId) {
    UI.showErrorPage('ไม่พบรหัสภาพยนตร์');
    return;
  }

  try {
    // Fetch movie
    const movie = await ContentService.getItemById('movie', movieId);

    if (movie) {
      // Render player
      const player = await UI.renderiPhonePlayer(movie, [], 0, false);

      // Setup progress saving
      if (player) {
        setupProgressSaving(player, movie);
      }

      // Increment view count
      if (currentUser) {
        ContentService.incrementViewCount('movie', movieId);
      }

      // Load related movies
      loadRelated(movie.category, movieId);
    }
  } catch (e) {
    console.error('Error:', e);
    UI.showErrorPage('เกิดข้อผิดพลาด');
  }
});

function setupProgressSaving(player, movie) {
  // Progress saving logic
}

function loadRelated(category, currentId) {
  // Related movies logic
}

// Cleanup
function cleanup() {
  if (progressInterval) {
    clearInterval(progressInterval);
  }
}

window.addEventListener('beforeunload', cleanup);
```

---

## 🎨 Styling Guide

### TailwindCSS Usage

**Common Classes:**

```html
<!-- Container -->
<div class="container mx-auto px-4">

<!-- Flexbox -->
<div class="flex items-center justify-center gap-4">

<!-- Grid -->
<div class="grid grid-cols-1 md:grid-cols-3 gap-6">

<!-- Glass Effect -->
<div class="glass-premium p-6 rounded-2xl">

<!-- Button -->
<button class="btn-primary py-4 px-8 rounded-2xl">

<!-- Input -->
<input class="input-premium px-4 py-3 rounded-xl">

<!-- Typography -->
<h1 class="text-2xl font-black text-white">
<p class="text-sm text-gray-400">

<!-- Spacing -->
<div class="mt-4 mb-8 p-6">

<!-- Responsive -->
<div class="hidden md:block">
```

### Custom Tailwind Classes

**In tailwind.config.cjs:**
```javascript
theme: {
  extend: {
    colors: {
      'brand-primary': '#E50914',
      'brand-gold': '#FBF6BA',
    },
    fontFamily: {
      'thai': ['Prompt', 'sans-serif'],
    },
    animation: {
      'fade-in': 'fadeIn 0.5s ease-out',
    },
    keyframes: {
      fadeIn: {
        '0%': { opacity: '0' },
        '100%': { opacity: '1' },
      }
    }
  }
}
```

### CSS Variables

**In styles.css:**
```css
:root {
  --color-brand-primary: #E50914;
  --color-brand-gold: #FBF6BA;
}

.custom-class {
  color: var(--color-brand-primary);
}
```

---

## 🧪 Testing Guide

### Manual Testing Checklist

**Functionality:**
- [ ] Page loads without errors
- [ ] Navigation works
- [ ] Forms submit correctly
- [ ] Authentication works
- [ ] Admin access restricted
- [ ] Video player works
- [ ] Search works
- [ ] Responsive design

**Performance:**
- [ ] Page load time < 3s
- [ ] Images load quickly
- [ ] No console errors
- [ ] Service Worker registers
- [ ] PWA works offline

**Security:**
- [ ] Non-Google users blocked from admin
- [ ] User data protected
- [ ] No sensitive data in console
- [ ] Firestore rules correct

### Browser Testing

Test in:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

### Mobile Testing

Test on:
- iOS (Safari)
- Android (Chrome)
- Tablet devices

---

## 🐛 Debugging Guide

### Console Debugging

```javascript
// Basic logging
console.log('Value:', value);
console.error('Error:', error);
console.warn('Warning:', warning);

// Object inspection
console.table(array);
console.dir(object);

// Performance
console.time('operation');
// ... code
console.timeEnd('operation');
```

### Common Debugging Scenarios

**Issue: Component not rendering**

```javascript
// Check if element exists
const container = document.getElementById('container');
console.log('Container:', container);

// Check if function is called
console.log('Render called');

// Check return value
const html = Component.render();
console.log('HTML:', html);
```

**Issue: Service Worker not registering**

```javascript
// Check if supported
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistration().then(reg => {
    console.log('Registration:', reg);
  }).catch(err => {
    console.error('SW Error:', err);
  });
}
```

**Issue: Auth not working**

```javascript
// Check auth state
AuthService.auth.onAuthStateChanged(user => {
  console.log('User:', user);
});

// Check current user
console.log('Current user:', AuthService.auth.currentUser);
```

### Chrome DevTools

**Network Tab:**
- Check API calls
- Verify status codes
- Check response data
- Monitor performance

**Application Tab:**
- Local Storage
- Session Storage
- Service Workers
- Cache Storage
- Manifest

**Console:**
- Check for errors
- Filter by error type
- Enable preserve log
- Use console commands

---

## 📝 Code Best Practices

### DO's

✅ Use existing utilities
✅ Follow existing patterns
✅ Comment complex logic
✅ Handle errors gracefully
✅ Use async/await properly
✅ Clean up event listeners
✅ Test before committing

### DON'Ts

❌ Don't duplicate code
❌ Don't ignore errors
❌ Don't use eval()
❌ Don't hardcode values
❌ Don't skip error handling
❌ Don't break security rules
❌ Don't remove fallbacks

---

## 🔄 Refactoring Guidelines

### When to Refactor

- Code is hard to understand
- Duplicated code
- Poor performance
- Security concerns
- Outdated patterns

### Refactoring Steps

1. Identify issue
2. Create plan
3. Make small changes
4. Test each change
5. Document changes
6. Commit frequently

---

## 📚 Additional Resources

- [Vite Documentation](https://vitejs.dev/)
- [TailwindCSS Documentation](https://tailwindcss.com/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Lucide Icons](https://lucide.dev/)

---

## 🎯 Quick Reference

### Common Commands

```bash
# Start dev
npm run dev

# Build
npm run build:prod

# Lint
npm run lint:fix

# Deploy
firebase deploy --only hosting

# Firestore rules
firebase deploy --only firestore:rules
```

### Key Files

| File | Purpose |
|------|---------|
| `vite.config.js` | Build config |
| `tailwind.config.cjs` | Tailwind config |
| `src/components/ui.js` | Main UI |
| `src/services/auth-service.js` | Auth logic |
| `src/services/content-service.js` | Content CRUD |

---

**Last Updated:** 2026-01-XX
