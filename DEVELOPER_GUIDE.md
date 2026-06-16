# 📚 DUYดูDEE PREMIUM - Developer Guide

## 🎯 Project Overview

DUYดูDEE PREMIUM เป็นแพลตฟอร์มสตรีมมิ่งความบันเทิงระดับพรีเมียม 4K HDR สำหรับภาพยนตร์และซีรีส์แนวตั้ง ที่พัฒนาด้วย Vanilla JavaScript, Firebase, และ TailwindCSS

---

## 🏗️ Architecture

### Technology Stack
- **Frontend**: Vanilla JavaScript (ES6+)
- **Backend**: Firebase (Firestore, Authentication, Storage, Functions)
- **Styling**: TailwindCSS
- **Build Tool**: Vite
- **Testing**: Jest
- **Type Safety**: TypeScript (partial migration)

### Project Structure
```
public/
├── admin/                    # Admin HTML fragments (Critical Rule)
│   ├── components/
│   │   └── sidebar.html    # HTML fragment
│   └── [admin-pages].html   # Admin pages
├── src/
│   ├── admin/               # Admin logic
│   ├── components/          # UI components
│   │   ├── cards/
│   │   ├── layout/
│   │   ├── modals/
│   │   ├── player/
│   │   └── ui.js
│   ├── pages/               # Page logic
│   │   ├── auth/
│   │   ├── movie/
│   │   └── series/
│   ├── services/            # Firebase services
│   │   ├── auth-service.js
│   │   ├── content-service.js
│   │   ├── firebase-config.js
│   │   └── firebase.js
│   ├── middleware/          # Auth guards
│   ├── utils/               # Utilities
│   │   ├── ui-utils.js
│   │   ├── error-handler.js
│   │   ├── validation-utils.js
│   │   ├── accessibility-utils.js
│   │   ├── uix-enhancements.js
│   │   └── performance-optimizations.js
│   └── constants.js        # Schema constants
├── css/                    # Stylesheets
├── assets/                 # Static assets
└── [user-pages].html       # User pages
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn
- Firebase account

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build:prod
```

### Development Workflow
```bash
# 1. Start dev server
npm run dev

# 2. Make changes

# 3. Run tests
npm test

# 4. Lint and fix
npm run lint:fix

# 5. Build production
npm run build:prod

# 6. Test production build locally
# (Open dist/index.html in browser)

# 7. Deploy (see deployment section)
```

---

## 🧪 Testing

### Test Structure
```
public/src/
├── services/
│   ├── auth-service.test.js      (9 tests)
│   └── ...
├── utils/
│   ├── validation-utils.test.js   (37 tests)
│   ├── error-handler.test.js      (13 tests)
│   ├── ui-utils.test.js          (54 tests)
│   └── ui-utils.test.ts          (12 tests)
└── components/
    ├── cards/
    │   └── MovieCards.test.js     (21 tests)
    └── player/
        └── VideoPlayer.test.js   (skipped)
```

### Running Tests
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run tests for specific file
npm test -- path/to/file.test.js
```

### Test Coverage
- **Total Tests**: 156 (100% passing)
- **Coverage**: Utilities and core services fully tested

---

## 🔒 Critical Rules (from AGENTS.md)

### 1. Google Admin Login (CRITICAL)
- ✅ NEVER remove `isGoogleUser()` checks
- ✅ Admin Dashboard accessible via Google login only
- **Location**: `src/middleware/auth-guard.js`, `src/services/auth-service.js`

### 2. Service Worker Copy Plugin (CRITICAL)
- ✅ NEVER remove `copy-static-files` plugin
- ✅ Files must be copied: `sw.js`, `manifest.json`, `robots.txt`, `sitemap.xml`, `favicon.ico`
- **Location**: `vite.config.js` lines 114-131

### 3. Fallback Strategy (CRITICAL)
- ✅ NEVER remove local fallback implementations
- ✅ System must work without Cloud Functions
- **Location**: `src/services/content-service.js`

### 4. Sidebar Fragment Location (CRITICAL)
- ✅ Sidebar.html MUST be in `public/admin/components/`
- ✅ NOT in `src/admin/` (it's an HTML fragment)
- **Location**: `public/admin/components/sidebar.html`

---

## 📦 Key Components

### AuthService
**Location**: `src/services/auth-service.js`

**Key Functions:**
- `loginWithGoogle()` - Google OAuth login
- `loginWithEmail()` - Email/password login
- `registerWithEmail()` - User registration
- `checkIsAdmin()` - Admin verification (Google-only)
- `isGoogleUser()` - Google provider check
- `saveWatchHistory()` - Track viewing progress
- `getWatchHistory()` - Retrieve watch history

### ContentService
**Location**: `src/services/content-service.js`

**Key Functions:**
- `searchItems()` - Search with Cloud Functions + local fallback
- `incrementViewCount()` - View count with fallback
- `getContentById()` - Get content by ID
- `getTrendingItems()` - Get trending content
- `addContentItem()` - Add new content
- `updateContentItem()` - Update existing content

### ValidationUtils
**Location**: `src/utils/validation-utils.js`

**Key Functions:**
- `isValidEmail()` - Email format validation
- `isValidPassword()` - Password strength validation
- `getPasswordStrength()` - Password strength details
- `isValidYouTubeURL()` - YouTube URL validation
- `sanitizeString()` - XSS prevention
- `validateField()` - Generic field validation
- `validateForm()` - Form validation

### AccessibilityUtils
**Location**: `src/utils/accessibility-utils.js`

**Key Functions:**
- `createSkipLink()` - Skip to main content
- `addARIALabels()` - ARIA labels management
- `improveKeyboardNavigation()` - Keyboard navigation
- `addFocusManagement()` - Focus management
- `addLiveRegions()` - Screen reader announcements

### PerformanceOptimizations
**Location**: `src/utils/performance-optimizations.js`

**Key Functions:**
- `fetchWithCache()` - Cached API requests
- `batchFirestoreOperations()` - Batch Firestore operations
- `createDebouncedFn()` - Debounce with memory leak prevention
- `optimizeImage()` - Image optimization
- `lazyLoadImages()` - Lazy loading with Intersection Observer

---

## 🎨 Adding New Features

### Adding a New Page

1. **Create HTML file** in `public/`
2. **Create JavaScript file** in `public/src/pages/`
3. **Add to vite.config.js** input
4. **Import in HTML** with `<script type="module">`

### Adding a New Component

1. **Create component file** in `public/src/components/`
2. **Export functions** from component
3. **Import in page** that needs it
4. **Use existing patterns** from existing components

### Adding Validation

1. **Use ValidationUtils** functions
2. **Add to form submission** before processing
3. **Show user-friendly errors** with UI.showToast
4. **Announce to screen readers** with announceToScreenReader

---

## 🔧 Common Tasks

### Debugging Firebase Issues

**Firestore Rules Issues:**
```bash
# Test Firestore rules in Firebase Console
firebase firestore:test

# Deploy Firestore rules
firebase deploy --only firestore:rules
```

**Authentication Issues:**
- Check `src/services/firebase-config.js` configuration
- Verify Firebase Console authentication settings
- Check browser console for Firebase errors

### Performance Debugging

**Slow Loading:**
- Check PerformanceOptimizations cache
- Verify image optimization
- Check bundle size in build output

**Memory Leaks:**
- Check event listeners cleanup
- Verify interval/timeout cleanup
- Check cache size

### Testing Issues

**Mock Firebase Functions:**
```javascript
// Use jest.mock() in test setup
jest.mock('../services/firebase-config.js');
```

**Testing Async Code:**
```javascript
// Use async/await in tests
it('should load data', async () => {
    const data = await Service.loadData();
    expect(data).toBeDefined();
});
```

---

## 🚀 Deployment

### Local Testing
```bash
# Build for production
npm run build:prod

# Test locally
# Open dist/index.html in browser
```

### Firebase Deployment
```bash
# Login to Firebase
firebase login

# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy hosting
firebase deploy --only hosting

# Full deployment (all services)
firebase deploy
```

### Build Verification Checklist
- [x] ✅ Copied sw.js
- [x] ✅ Copied manifest.json
- [x] ✅ Copied robots.txt
- [x] ✅ Copied sitemap.xml
- [x] ✅ Copied favicon.ico
- [x] Tests passing (156/156)
- [x] No console errors in build output

---

## 📚 Documentation Files

- **AGENTS.md** - Critical rules and guidelines
- **TYPESCRIPT_MIGRATION.md** - TypeScript migration guide
- **ACCESSIBILITY_REPORT.md** - Accessibility compliance report
- **BUG_FIXES.md** - Bug fixes and known issues
- **DEVELOPER_GUIDE.md** - This file (developer documentation)

---

## 🆘 Troubleshooting

### Common Issues

**Build Fails:**
```bash
# Clear cache and reinstall
rm -rf node_modules dist
npm install
npm run build:prod
```

**Tests Fail:**
```bash
# Run tests with verbose output
npm test -- --verbose

# Check jest configuration
cat jest.config.js
```

**Static Files Not Copied:**
- Check `vite.config.js` copy-static-files plugin
- Verify STATIC_ROOT_FILES configuration
- Rebuild: `npm run build:prod`

**Service Worker 404:**
- Ensure sw.js is in STATIC_ROOT_FILES
- Check build output shows "✅ Copied sw.js"
- Clear browser cache

---

## 🎯 Best Practices

### Code Style
- Follow existing code patterns
- Use existing utilities (ValidationUtils, AccessibilityUtils, etc.)
- Keep functions small and focused
- Use descriptive variable names
- Comment complex logic

### File Organization
- Keep components in `src/components/`
- Keep pages in `src/pages/`
- Keep services in `src/services/`
- Don't mix concerns

### Security
- Always validate user input
- Sanitize strings before rendering
- Never trust client-side data blindly
- Maintain Google-only admin access
- Keep fallback strategies intact

### Performance
- Lazy load images
- Use caching strategies
- Avoid unnecessary re-renders
- Debounce/throttle event handlers

---

## 📞 Support

**When to Ask for Help:**
- Uncertain about security implications
- Unsure about build configuration
- Need to modify critical authentication logic
- Planning major refactoring

**Do NOT Ask for Help For:**
- Simple UI tweaks
- Adding new pages (follow patterns)
- Fixing typos
- Standard CSS changes

---

**Last Updated:** 2026-06-16  
**Test Coverage:** 156 tests (100% passing)  
**Build Status:** ✅ Production ready