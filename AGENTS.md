# 🤖 AGENTS.md - Devin Agent Guidelines

> ไกด์สำคัญสำหรับ Devin AI Agent ในการพัฒนาและดูแลรักษาโปรเจค DUYดูDEE PREMIUM

---

## 📋 Table of Contents

- [Critical Rules](#critical-rules)
- [Project Structure](#project-structure)
- [Key Files & Locations](#key-files--locations)
- [Common Tasks](#common-tasks)
- [Security Guidelines](#security-guidelines)
- [Build & Deploy Workflow](#build--deploy-workflow)
- [Troubleshooting](#troubleshooting)

---

## 🚨 CRITICAL RULES

### 1. Google Admin Login (CRITICAL)

⚠️ **NEVER REMOVE OR MODIFY** Google-only admin access checks:

**Files to Check:**
- `public/src/middleware/auth-guard.js` - Lines 30-32
- `public/src/services/auth-service.js` - `isGoogleUser()` function
- `public/src/services/firebase.js` - Google login verification

**What to Do:**
- ✅ Always preserve `isGoogleUser()` checks
- ✅ Keep alert messages for non-Google login attempts
- ✅ Maintain admin access restrictions
- ❌ NEVER remove Google-only requirement
- ❌ NEVER allow Email/Password login for Admin Dashboard

**Impact of Violation:**
- Admin security will be compromised
- Non-authorized users could access Admin Dashboard
- VIP payment data could be exposed

---

### 2. Service Worker Copy Plugin

⚠️ **NEVER REMOVE** the `copy-static-files` plugin from vite.config.js:

**Location:** `vite.config.js` - Lines 114-131

**Files that MUST be copied:**
- `sw.js` - Service Worker (PWA)
- `manifest.json` - PWA Manifest
- `robots.txt` - SEO robots
- `sitemap.xml` - SEO sitemap
- `favicon.ico` - Favicon

**What to Do:**
- ✅ Keep `copy-static-files` plugin
- ✅ Keep all files in `STATIC_ROOT_FILES`
- ✅ Build must show "✅ Copied sw.js" etc.
- ❌ NEVER remove the plugin
- ❌ NEVER remove files from STATIC_ROOT_FILES

**Impact of Violation:**
- Service Worker 404 errors
- PWA will not work
- SEO issues (missing sitemap)
- Cached old content persists

---

### 3. Fallback Strategy

⚠️ **NEVER REMOVE** local fallback implementations:

**Files with Fallbacks:**
- `public/src/services/content-service.js`
  - `searchItems()` → `_localSearch()` (lines 58-64)
  - `incrementViewCount()` → Firestore direct update (lines 26-42)

**What to Do:**
- ✅ Keep `_localSearch()` function
- ✅ Keep try-catch with local fallback
- ✅ System must work without Cloud Functions
- ❌ NEVER remove fallback logic
- ❌ NEVER rely solely on Cloud Functions

**Impact of Violation:**
- Search breaks if Functions fail
- View count breaks if Functions fail
- System becomes dependent on billing

---

### 4. Sidebar Fragment Location

⚠️ **Sidebar.html MUST be in `public/admin/components/`**

**Current Location:** `public/admin/components/sidebar.html`

**What to Do:**
- ✅ Keep sidebar in `admin/components/`
- ✅ Vite plugin copies it to `dist/admin/components/`
- ✅ Use as HTML fragment in admin pages
- ❌ NEVER move to `src/admin/`
- ❌ NEVER use as module import

**Why:**
- It's an HTML fragment, not JS module
- Vite copies it as static file
- Used by admin pages via include

---

## 📁 Project Structure

### Key Directories

```
public/
├── admin/                    # Admin pages & fragments
│   ├── components/           # HTML fragments (sidebar.html)
│   └── [admin-pages].html    # Admin HTML files
├── src/
│   ├── admin/               # Admin logic (JS)
│   ├── components/          # Reusable components
│   │   ├── cards/          # Movie/Series cards
│   │   ├── layout/         # Navbar, Hero Slider
│   │   ├── modals/         # VIP, Ticket modals
│   │   ├── player/         # Video Player
│   │   └── ui.js           # Main UI component
│   ├── pages/              # Page logic
│   │   ├── auth/          # Login, Register, Profile
│   │   ├── movie/         # Movie watch page
│   │   └── series/        # Series watch page
│   ├── services/           # Firebase services
│   ├── middleware/         # Auth guards
│   ├── utils/              # Utilities
│   └── constants.js        # Schema constants
├── css/                    # Stylesheets
├── assets/                 # Static assets
└── [user-pages].html       # User HTML files
```

### Important: Admin Components Folder

```
public/admin/components/
└── sidebar.html           # Sidebar fragment (HTML)
```

**Note:** This folder is copied by Vite to `dist/admin/components/`

---

## 🔑 Key Files & Locations

### Authentication & Security

| File | Purpose | Critical? |
|------|---------|-----------|
| `src/middleware/auth-guard.js` | Admin auth guard | 🔴 CRITICAL |
| `src/services/auth-service.js` | Auth logic, isGoogleUser() | 🔴 CRITICAL |
| `src/services/firebase.js` | Firebase config | 🔴 CRITICAL |
| `firestore.rules` | Firestore security | 🔴 CRITICAL |

### Core UI Components

| File | Purpose | Notes |
|------|---------|-------|
| `src/components/ui.js` | Main UI component | Toast, error handling |
| `src/components/player/VideoPlayer.js` | Video player | YouTube iframe |
| `src/components/cards/MovieCards.js` | Movie cards | Poster quality |
| `src/components/layout/Layout.js` | Navbar, layout | Responsive |

### Page Logic

| File | Purpose | Notes |
|------|---------|-------|
| `src/pages/home.js` | Home page | Hero slider |
| `src/pages/search.js` | Search | Has fallback |
| `src/pages/movie/watch.js` | Movie watch | Progress tracking |
| `src/pages/series/watch.js` | Series watch | Episode selector |

### Services

| File | Purpose | Fallback? |
|------|---------|-----------|
| `src/services/content-service.js` | Content CRUD | ✅ Yes |
| `src/services/firebase-config.js` | Firebase SDK | No |

### Build & Config

| File | Purpose | Critical? |
|------|---------|-----------|
| `vite.config.js` | Vite config | 🔴 CRITICAL (copy plugin) |
| `tailwind.config.cjs` | Tailwind config | No |
| `package.json` | Dependencies | No |
| `firebase.json` | Firebase config | No |

---

## 🛠️ Common Tasks

### Adding a New Page

1. **Create HTML File:**
   ```bash
   public/new-page.html
   ```

2. **Create JS File:**
   ```bash
   public/src/pages/new-page.js
   ```

3. **Add to vite.config.js:**
   ```javascript
   input: {
     // ... other pages
     'new-page': resolve('public/new-page.html')
   }
   ```

4. **Import in HTML:**
   ```html
   <script type="module" src="/src/pages/new-page.js"></script>
   ```

### Adding a New Component

1. **Create Component File:**
   ```bash
   public/src/components/NewComponent.js
   ```

2. **Export Function:**
   ```javascript
   export const NewComponent = { ... }
   ```

3. **Import in Page:**
   ```javascript
   import { NewComponent } from '../components/NewComponent.js';
   ```

### Modifying Admin Pages

1. **HTML:** Edit `public/admin/admin-[name].html`
2. **Logic:** Edit `public/src/admin/admin-[name].js`
3. **Sidebar:** Edit `public/admin/components/sidebar.html` (if needed)

### Adding Icon (Lucide)

```html
<i data-lucide="icon-name" class="w-4 h-4"></i>
```

After adding icons, run:
```javascript
UI.refreshIcons(); // lucide.createIcons()
```

---

## 🔒 Security Guidelines

### When Modifying Authentication

✅ **DO:**
- Keep `isGoogleUser()` checks intact
- Preserve auth guards on admin pages
- Alert users for non-Google login attempts
- Verify admin role before access

❌ **DON'T:**
- Remove Google-only requirement
- Allow Email/Password for Admin
- Bypass auth checks
- Remove security rules

### When Modifying Firestore Rules

✅ **DO:**
- Keep VIP payments restricted to admins
- Protect user data (user can only edit own data)
- Keep public data (movies/series) readable by all
- Test rules in Firebase Console

❌ **DON'T:**
- Open write access to public collections
- Remove admin-only restrictions
- Allow unauthenticated writes

### When Working with User Data

✅ **DO:**
- Check authentication before reading/writing
- Verify user owns data before modification
- Use Firestore security rules
- Sanitize user input

❌ **DON'T:**
- Expose user data to unauthorized users
- Allow cross-user data modification
- Store sensitive data in plain text
- Trust client-side data blindly

---

## 🚀 Build & Deploy Workflow

### Standard Development Workflow

```bash
# 1. Start dev server
npm run dev

# 2. Make changes (auto-reload via Vite HMR)

# 3. Test locally
# Open http://localhost:5173

# 4. Lint code
npm run lint:fix

# 5. Build production
npm run build:prod

# 6. Check static files are copied
# Should see: ✅ Copied sw.js, manifest.json, robots.txt, sitemap.xml

# 7. Deploy Firestore rules (if changed)
firebase deploy --only firestore:rules

# 8. Deploy hosting
firebase deploy --only hosting

# 9. Test production URL
# https://duydodeesport.web.app
```

### Quick Deploy (Hosting Only)

```bash
npm run build:prod
firebase deploy --only hosting
```

### Full Deploy (All Services)

```bash
npm run build:prod
firebase deploy
```

**Note:** Cloud Functions require billing - if not enabled, use local fallbacks

---

## 🔧 Troubleshooting

### Service Worker 404 Error

**Symptom:**
```
Service Worker registration failed: TypeError: Failed to register a ServiceWorker
```

**Solution:**
1. Check `vite.config.js` has `copy-static-files` plugin
2. Verify `sw.js` is in `STATIC_ROOT_FILES`
3. Rebuild: `npm run build:prod`
4. Check output shows: `✅ Copied sw.js`

### CORS Error on View Count

**Symptom:**
```
Access to fetch at Cloud Functions blocked by CORS policy
```

**Solution:**
1. System uses local fallback automatically
2. Check `content-service.js` incrementViewCount has fallback
3. Fallback uses Firestore direct update
4. No manual action needed

### Google Admin Login Not Working

**Symptom:**
User with Email/Password cannot access Admin Dashboard

**Solution:**
1. This is EXPECTED BEHAVIOR (security feature)
2. Admin must login with Google
3. Check `auth-guard.js` lines 30-32
4. Check `auth-service.js` `isGoogleUser()` function

### Build Fails

**Symptom:**
Build command fails with errors

**Solution:**
```bash
# Clear cache
rm -rf node_modules dist
npm install
npm run build:prod
```

### Icons Not Showing

**Symptom:**
Lucide icons not rendering

**Solution:**
1. Ensure icons have `data-lucide` attribute
2. Call `UI.refreshIcons()` or `lucide.createIcons()`
3. Check script tag: `<script src="https://unpkg.com/lucide@0.410.0"></script>`

### Sidebar Not Loading

**Symptom:**
Admin sidebar not showing

**Solution:**
1. Check `public/admin/components/sidebar.html` exists
2. Verify Vite plugin copies to `dist/admin/components/`
3. Check admin HTML includes sidebar correctly

---

## 📝 Common Pitfalls

### ❌ Pitfall 1: Removing Google-Only Check

**Problem:**
Removing `isGoogleUser()` check to "simplify" code

**Impact:**
- Security breach
- Non-admin users access Admin Dashboard

**Solution:**
NEVER remove Google-only requirement

---

### ❌ Pitfall 2: Removing Fallback

**Problem:**
Removing `_localSearch()` fallback to "clean up" code

**Impact:**
- Search breaks when Functions fail
- System becomes billing-dependent

**Solution:**
ALWAYS keep fallback implementations

---

### ❌ Pitfall 3: Moving Sidebar to src

**Problem:**
Moving `sidebar.html` to `src/admin/` for "better organization"

**Impact:**
- Sidebar not copied to dist
- Admin pages missing sidebar

**Solution:**
Keep sidebar in `public/admin/components/` (HTML fragment)

---

### ❌ Pitfall 4: Removing Copy Plugin

**Problem:**
Removing `copy-static-files` plugin from vite.config.js

**Impact:**
- Service Worker 404
- PWA breaks
- Missing sitemap

**Solution:**
NEVER remove copy-static-files plugin

---

## ✅ Pre-Commit Checklist

Before committing changes, verify:

- [ ] Google admin login checks preserved
- [ ] Service Worker copy plugin present
- [ ] Fallback implementations intact
- [ ] Sidebar in correct location
- [ ] Build successful (`npm run build:prod`)
- [ ] Static files copied (sw.js, manifest.json, etc.)
- [ ] Lint passed (`npm run lint:fix`)
- [ ] No console errors
- [ ] Tested locally
- [ ] Security rules reviewed (if changed)

---

## 🎯 Best Practices

### Code Style

- Follow existing code patterns
- Use existing utilities (`UIUtils`, `AuthService`)
- Keep functions small and focused
- Comment complex logic
- Use descriptive variable names

### File Organization

- Keep components in `src/components/`
- Keep pages in `src/pages/`
- Keep services in `src/services/`
- Don't mix concerns (e.g., no UI logic in services)

### Error Handling

- Use try-catch for async operations
- Show user-friendly error messages
- Log errors to console for debugging
- Use error-handler.js utilities

### Performance

- Lazy load images
- Use existing UIUtils helpers (throttle, debounce)
- Avoid unnecessary re-renders
- Use code splitting (already configured)

---

## 📞 When to Ask for Help

**Ask for help if:**
- Uncertain about security implications
- Unsure about build configuration
- Need to modify critical authentication logic
- Planning major refactoring
- Performance issues not resolvable

**Do NOT ask for help for:**
- Simple UI tweaks
- Adding new pages/components (follow patterns)
- Fixing typos
- Standard CSS changes

---

**Last Updated:** 2026-01-XX
**Maintained by:** Devin AI Agent
