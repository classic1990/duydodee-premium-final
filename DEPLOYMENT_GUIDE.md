# 🚀 Deployment Guide for DUYดูDEE PREMIUM

## 📋 Deployment Checklist

### Pre-Deployment Checklist
- [x] ✅ All tests passing (156/156)
- [x] ✅ Production build successful
- [x] ✅ Static files copied (sw.js, manifest.json, robots.txt, sitemap.xml, favicon.ico)
- [x] ✅ Google admin access checks preserved
- [x] ✅ Fallback strategies intact
- [x] ✅ Sidebar in correct location
- [ ] ⚠️ Firestore rules deployed
- [ ] ⚠️ Firebase Functions deployed (if used)
- [ ] ⚠️ Production environment variables configured
- [ ] ⚠️ Database backups verified
- [ ] ⚠️ Performance monitoring setup

---

## 🔥 Quick Deployment (Hosting Only)

### Step 1: Build Production
```bash
npm run build:prod
```

### Step 2: Verify Build Output
```bash
# Check static files copied
# Build output should show:
# ✅ Copied sw.js
# ✅ Copied manifest.json
# ✅ Copied robots.txt
# ✅ Copied sitemap.xml
# ✅ Copied favicon.ico

# Check dist directory
ls dist/
# Should see: HTML files, assets/, admin/, sw.js, manifest.json, etc.
```

### Step 3: Deploy to Firebase Hosting
```bash
# Login to Firebase (if not logged in)
firebase login

# Deploy hosting only
firebase deploy --only hosting
```

### Step 4: Verify Deployment
```bash
# Visit the deployed URL
# Test: https://duydodeesport.web.app

# Test critical paths:
# - Home page loads
# - Authentication works
# - Admin dashboard accessible (Google-only)
# - Video playback works
# - PWA service worker active
```

---

## 🌐 Full Deployment (All Services)

### Step 1: Deploy Firestore Rules
```bash
# Deploy Firestore security rules
firebase deploy --only firestore:rules

# Verify rules in Firebase Console
# Go to Firestore → Rules tab
```

**Critical Rules:**
- VIP payments restricted to admins
- Users can only edit their own data
- Public data (movies/series) readable by all
- Admin-only restrictions enforced

### Step 2: Deploy Cloud Functions (if enabled)
```bash
# Build and deploy Functions
cd functions
npm install
firebase deploy --only functions

# Note: Cloud Functions require billing
# System has local fallbacks in place
```

**Fallback Strategy:**
- `content-service.js` has local fallbacks for:
  - `searchItems()` → `_localSearch()`
  - `incrementViewCount()` → Firestore direct update

### Step 3: Build Production
```bash
# Build for production
npm run build:prod
```

### Step 4: Deploy Hosting
```bash
# Deploy Firebase Hosting
firebase deploy --only hosting
```

### Step 5: Verification
```bash
# Test all critical paths:
# 1. Home page loads
# 2. Authentication works (Google + Email)
# 3. Admin dashboard accessible (Google-only)
# 4. Video playback works
# 5. PWA service worker active
# 6. Search functionality works
# 7. Admin content management works
```

---

## 🔄 Continuous Deployment

### Manual Deployment Workflow
```bash
# 1. Pull latest changes
git pull

# 2. Install dependencies (if needed)
npm install

# 3. Run tests
npm test

# 4. Build production
npm run build:prod

# 5. Verify static files copied
# Check build output

# 6. Deploy Firestore rules (if changed)
firebase deploy --only firestore:rules

# 7. Deploy Functions (if changed)
cd functions
firebase deploy --only functions
cd ..

# 8. Deploy hosting
firebase deploy --only hosting

# 9. Test production URL
```

### Pre-Commit Hooks (Optional)
```bash
# Install husky
npm install husky --save-dev

# Add pre-commit hook
npx husky add .husky/pre-commit "npm test"

# Add pre-push hook
npx husky add .husky/pre-push "npm run build:prod"
```

---

## 🔒 Security Deployment Checklist

### Firebase Security
- [ ] Firestore rules deployed and tested
- [ ] Authentication rules verified
- [ ] API keys secure (no hardcoded secrets)
- [ ] Storage rules configured

### Application Security
- [ ] Google-only admin access verified
- [ ] Input validation active
- [ ] XSS prevention in place
- [ ] HTTPS enforced

### Build Security
- [ ] No sensitive data in client-side code
- [ ] Environment variables secure
- [ ] Dependencies up-to-date
- [ ] No debug code in production

---

## 📊 Monitoring & Analytics

### Firebase Analytics
```bash
# Enable Firebase Analytics
# Go to Firebase Console → Analytics
# Add analytics to project
```

### Application Monitoring
```javascript
// Already implemented in error-handler.js
// Monitor errors via console and Firebase logs
```

### Performance Monitoring
```javascript
// PerformanceOptimizations.monitorPerformance()
// Monitors navigation timing and resource loading
```

---

## 🛠️ Troubleshooting Deployment

### Issue: Static Files Not Copied
**Symptom:**
- Service Worker 404 errors
- PWA not working
- Missing sitemap/robots

**Solution:**
```bash
# Check vite.config.js has copy-static-files plugin
# Verify STATIC_ROOT_FILES includes all required files
# Rebuild: npm run build:prod
```

### Issue: Firestore Rules Not Deploying
**Symptom:**
- Permission denied errors
- Cannot access Firestore data

**Solution:**
```bash
# Check Firebase Console authentication
# Verify firebase login status
# Test rules in Firebase Console → Rules tab
# Deploy again: firebase deploy --only firestore:rules
```

### Issue: Build Fails
**Symptom:**
- Build command errors
- TypeScript compilation errors

**Solution:**
```bash
# Clear cache
rm -rf node_modules dist
npm install
npm run build:prod
```

### Issue: Deployment Fails
**Symptom:**
- firebase deploy fails
- Permission errors

**Solution:**
```bash
# Check Firebase login status
firebase login --list

# Check project settings in firebase.json
# Verify project exists in Firebase Console
# Re-login if needed
firebase login
```

---

## 🌍 Multi-Environment Deployment

### Development Environment
```bash
# Use development build
npm run dev

# Development environment variables
# Set in .env.local (not committed)
```

### Staging Environment
```bash
# Build for staging
npm run build:prod

# Deploy to staging project
firebase use staging
firebase deploy --only hosting
```

### Production Environment
```bash
# Build for production
npm run build:prod

# Deploy to production project
firebase use default
firebase deploy --only hosting

# Also deploy Firestore rules
firebase deploy --only firestore:rules
```

---

## 📝 Post-Deployment Verification

### Critical Path Testing
```bash
# Test Checklist:
□ Home page loads
□ Authentication works (Google + Email)
□ Register new user
□ Login with Google
□ Login with Email/Password
□ Admin dashboard accessible (Google-only)
□ Admin cannot login with Email/Password (security test)
□ Video playback works
□ Search functionality works
□ Add content (admin)
□ Edit content (admin)
□ Delete content (admin)
□ PWA service worker active
□ PWA installable
□ Offline functionality (if applicable)
```

### Performance Testing
```bash
# Check bundle size in build output
# Large bundles may need code splitting

# Test Lighthouse score
# Use Chrome DevTools → Lighthouse
# Target: Performance > 90

# Test Core Web Vitals
# LCP (Largest Contentful Paint)
# FID (First Input Delay)
# CLS (Cumulative Layout Shift)
```

### Accessibility Testing
```bash
# Use axe DevTools
# Install: npm install -D axe-core
# Run: npx axe http://localhost:5173

# Manual checks:
# Keyboard navigation
# Screen reader compatibility
# Color contrast ratios
# Focus indicators
```

---

## 🚨 Rollback Plan

### Quick Rollback
```bash
# If deployment breaks critical functionality

# 1. Rollback Firebase Hosting
firebase deploy --only hosting --mode=clobber

# 2. Or use previous git commit
git revert <commit-hash>
firebase deploy --only hosting
```

### Full Rollback
```bash
# Complete rollback including Firestore rules

# 1. Rollback Firestore rules
firebase deploy --only firestore:rules --mode=clobber

# 2. Rollback Functions
cd functions
firebase deploy --only functions --mode=clobber
cd ..

# 3. Rollback Hosting
firebase deploy --only hosting --mode=clobber
```

---

## 📈 Deployment Metrics

### Build Metrics
- **Build Time:** ~1.58s
- **Bundle Size:** Various (see build output)
- **Modules Transformed:** 84
- **Static Files:** 5 files copied

### Test Metrics
- **Total Tests:** 156
- **Passing:** 156 (100%)
- **Test Suites:** 5
- **Test Time:** ~1.1s

### Quality Metrics
- **Accessibility Score:** 8.5/10
- **Code Coverage:** High (core utilities)
- **Type Safety:** Core TypeScript
- **Performance:** Optimized with caching

---

## 🎯 Success Criteria

Deployment is successful when:
- ✅ All tests passing (156/156)
- ✅ Build completes without errors
- ✅ Static files copied correctly
- ✅ Production URL loads
- ✅ Authentication works
- ✅ Admin dashboard accessible (Google-only)
- ✅ Video playback works
- ✅ PWA service worker active
- ✅ No console errors in production
- ✅ Core features functional

---

## 📞 Deployment Support

### Firebase Issues
- [Firebase Console](https://console.firebase.google.com/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)

### Build Issues
- [Vite Documentation](https://vitejs.dev/)
- [Node.js Documentation](https://nodejs.org/)

### Code Issues
- Consult DEVELOPER_GUIDE.md
- Check AGENTS.md for critical rules
- Review BUG_FIXES.md for known issues

---

**Last Updated:** 2026-06-16  
**Build Status:** ✅ Production Ready  
**Deployment Status:** 🚀 Ready for Deployment