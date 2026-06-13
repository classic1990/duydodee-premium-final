# 🚀 DEPLOYMENT.md - Deployment Guide

> ไกด์การ Deploy โปรเจค DUYดูDEE PREMIUM ไป Production

---

## 📋 Table of Contents

- [Deployment Overview](#deployment-overview)
- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [Build Process](#build-process)
- [Firebase Deployment](#firebase-deployment)
- [Deployment Scenarios](#deployment-scenarios)
- [Post-Deployment Verification](#post-deployment-verification)
- [Rollback Procedure](#rollback-procedure)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Deployment Overview

### Deployment Architecture

```
Local Development
  ↓ Build (Vite)
Production Build (dist/)
  ↓ Firebase Deploy
Firebase Hosting (duydodeesport.web.app)
  ↓
Firebase Firestore (Database)
Firebase Functions (Backend)
```

### What Gets Deployed

**Hosting (dist/):**
- All HTML pages
- All JavaScript bundles
- All CSS files
- Static assets (images, fonts)
- Service Worker (sw.js)
- PWA Manifest (manifest.json)
- SEO files (robots.txt, sitemap.xml)

**Firestore:**
- Security rules (firestore.rules)
- Data (manual or via scripts)

**Cloud Functions:**
- Backend logic (functions/)
- Requires billing account

---

## ✅ Pre-Deployment Checklist

### Code Review

- [ ] All changes committed
- [ ] No console errors
- [ ] No console warnings
- [ ] Lint passed: `npm run lint:fix`
- [ ] Build succeeds: `npm run build:prod`

### Critical Checks (AGENTS.md)

- [ ] Google admin login checks preserved
- [ ] Service Worker copy plugin present
- [ ] Fallback implementations intact
- [ ] Sidebar in correct location
- [ ] Firestore rules reviewed

### Security Checks

- [ ] No sensitive data in code
- [ ] No hardcoded credentials
- [ ] Admin access restricted
- [ ] Security rules deployed
- [ ] API keys secure

### Performance Checks

- [ ] Build size acceptable
- [ ] Code splitting working
- [ ] Service Worker registered
- [ ] PWA manifest valid
- [ ] Images optimized

### Testing Checks

- [ ] Tested on localhost
- [ ] Tested on staging (if available)
- [ ] Mobile tested
- [ ] Cross-browser tested
- [ ] Authentication tested

---

## 🔨 Build Process

### Standard Build

```bash
# Build for production
npm run build:prod
```

**Expected Output:**
```
✓ built in ~1s
✅ Copied sw.js
✅ Copied manifest.json
✅ Copied robots.txt
✅ Copied sitemap.xml
✅ Copied favicon.ico

dist/
├── admin/
│   ├── admin-manage.html
│   └── components/
│       └── sidebar.html
├── assets/
│   ├── css/
│   ├── js/
│   └── images/
├── index.html
├── watch-movie.html
├── sw.js
├── manifest.json
├── robots.txt
├── sitemap.xml
└── favicon.ico
```

### Critical Build Verification

**Check 1: Static Files Copied**
```bash
# Verify sw.js exists
ls dist/sw.js

# Verify manifest.json exists
ls dist/manifest.json

# Verify sitemap.xml exists
ls dist/sitemap.xml
```

**Check 2: Build Output**
```bash
# Check build size
du -sh dist/

# Should be reasonable (not too large)
```

**Check 3: Preview Build**
```bash
# Preview production build locally
npm run preview

# Open http://localhost:4173
# Test functionality
```

---

## 🔥 Firebase Deployment

### Full Deployment (All Services)

```bash
# Deploy everything
firebase deploy
```

**Deploys:**
- Hosting
- Firestore rules
- Cloud Functions (if billing enabled)
- Other Firebase services

### Hosting Only (Most Common)

```bash
# Deploy Hosting only
firebase deploy --only hosting
```

**Use when:**
- Only frontend changes
- No Firestore rule changes
- No Cloud Functions changes

### Firestore Rules Only

```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules
```

**Use when:**
- Modified security rules
- Changed admin access
- Updated VIP payment rules

### Cloud Functions Only

```bash
# Deploy Functions
firebase deploy --only functions
```

**Use when:**
- Modified backend logic
- Added new functions
- Updated function dependencies

**Note:** Requires billing account

---

## 📊 Deployment Scenarios

### Scenario 1: UI/UX Changes Only

**Changes:** CSS, HTML, component styling

**Steps:**
```bash
# 1. Build
npm run build:prod

# 2. Deploy hosting
firebase deploy --only hosting

# 3. Test production
# https://duydodeesport.web.app
```

### Scenario 2: New Feature (Frontend)

**Changes:** New page, new component, new functionality

**Steps:**
```bash
# 1. Add to vite.config.js if new page
# (input section)

# 2. Build
npm run build:prod

# 3. Test preview
npm run preview

# 4. Deploy hosting
firebase deploy --only hosting

# 5. Test production
```

### Scenario 3: Security Rule Changes

**Changes:** Firestore rules, admin access

**Steps:**
```bash
# 1. Build
npm run build:prod

# 2. Deploy Firestore rules
firebase deploy --only firestore:rules

# 3. Test rules in Firebase Console
# (use Simulation)

# 4. Deploy hosting (if needed)
firebase deploy --only hosting

# 5. Test admin access
```

### Scenario 4: Backend Logic Changes

**Changes:** Cloud Functions

**Steps:**
```bash
# 1. Ensure billing is enabled
firebase billing:plan START

# 2. Deploy functions
firebase deploy --only functions

# 3. Test functions
# (via Firebase Console or direct call)

# 4. Deploy hosting (if needed)
firebase deploy --only hosting
```

### Scenario 5: Critical Security Update

**Changes:** Google admin login, critical security

**Steps:**
```bash
# 1. Review changes thoroughly
# (AGENTS.md)

# 2. Test locally
npm run dev

# 3. Build
npm run build:prod

# 4. Deploy Firestore rules first
firebase deploy --only firestore:rules

# 5. Deploy hosting
firebase deploy --only hosting

# 6. Immediate verification
# Test admin access
# Test user access
```

---

## 🔍 Post-Deployment Verification

### Automated Checks

**Check 1: Service Worker**

```javascript
// In browser console
navigator.serviceWorker.getRegistration().then(reg => {
  console.log('SW Status:', reg?.active?.state);
  // Should be "activated"
});
```

**Check 2: PWA Manifest**

```javascript
// In browser console
fetch('/manifest.json').then(r => r.json()).then(m => {
  console.log('Manifest:', m);
  // Should show manifest object
});
```

**Check 3: Sitemap**

```bash
# Check sitemap exists
curl https://duydodeesport.web.app/sitemap.xml

# Should return XML
```

### Manual Verification

**Functionality:**
- [ ] Home page loads
- [ ] Navigation works
- [ ] Login works (Google + Email)
- [ ] Admin access (Google-only)
- [ ] Video player works
- [ ] Search works
- [ ] Watchlist works
- [ ] Chat works (if enabled)

**Performance:**
- [ ] Page load time < 3s
- [ ] Service Worker registered
- [ ] No console errors
- [ ] No console warnings

**Mobile:**
- [ ] Works on iOS
- [ ] Works on Android
- [ ] Responsive design
- [ ] Touch interactions

**Security:**
- [ ] Non-Google admin blocked
- [ ] User data protected
- [ ] No sensitive data exposed
- [ ] HTTPS enforced

### Firebase Console Verification

**Firestore:**
- [ ] Rules deployed
- [ ] Data accessible
- [ ] Indexes created

**Authentication:**
- [ ] Sign-in methods enabled
- [ ] Users can login
- [ ] Admin users verified

**Hosting:**
- [ ] Deployed version active
- [ ] URL accessible
- [ ] Custom domain (if configured)

---

## 🔄 Rollback Procedure

### Quick Rollback (Hosting)

```bash
# List recent releases
firebase hosting:releases

# Rollback to previous release
firebase hosting:rollback
```

### Manual Rollback (Full)

**Step 1: Checkout previous commit**
```bash
git log
git checkout <previous-commit-hash>
```

**Step 2: Rebuild**
```bash
npm run build:prod
```

**Step 3: Redeploy**
```bash
firebase deploy
```

**Step 4: Verify**
```bash
# Test production
# https://duydodeesport.web.app
```

### Rollback Firestore Rules

```bash
# Checkout previous rules
git checkout HEAD~1 firestore.rules

# Deploy rules
firebase deploy --only firestore:rules

# Verify rules in Firebase Console
```

---

## 🐛 Troubleshooting Deployment

### Issue: Build Fails

**Error:**
```
Build failed
```

**Solutions:**
```bash
# Clear cache
rm -rf node_modules dist
npm install

# Rebuild
npm run build:prod

# Check for syntax errors
npm run lint:fix
```

### Issue: Deploy Fails - Auth

**Error:**
```
Error: Authentication failed
```

**Solution:**
```bash
# Re-login
firebase logout
firebase login
```

### Issue: Service Worker 404

**Error:**
```
Service Worker registration failed: 404
```

**Solution:**
1. Check `vite.config.js` has copy-static-files plugin
2. Verify `sw.js` in `STATIC_ROOT_FILES`
3. Rebuild: `npm run build:prod`
4. Check dist/sw.js exists
5. Redeploy: `firebase deploy --only hosting`

### Issue: CORS Error on Functions

**Error:**
```
CORS policy blocked
```

**Solution:**
1. System uses local fallback automatically
2. Check `content-service.js` has fallback
3. No action needed for frontend

### Issue: Deployment Slow

**Cause:**
- Large dist folder
- Slow internet
- Firebase server issues

**Solution:**
```bash
# Check dist size
du -sh dist/

# If too large, optimize:
# - Compress images
# - Reduce bundle size
# - Enable compression
```

### Issue: Rules Deployment Fails

**Error:**
```
Firestore rules compilation failed
```

**Solution:**
```bash
# Test rules locally
firebase firestore:rules
```

---

## 📝 Deployment Log

### Template

```
## Deployment Log - [Date]

**Changes:**
- Feature 1
- Feature 2
- Bug fix 1

**Build:**
- Command: npm run build:prod
- Status: Success
- Size: XX MB

**Deployment:**
- Command: firebase deploy --only hosting
- Status: Success
- Release: https://duydodeesport.web.app

**Verification:**
- [ ] Home page loads
- [ ] Login works
- [ ] Admin access tested
- [ ] No console errors

**Issues:**
- None

**Next:**
- Deploy Firestore rules (if needed)
```

---

## 🎯 Best Practices

### DO's

✅ Test locally before deploy
✅ Build and verify before deploy
✅ Deploy incrementally (hosting first)
✅ Monitor deployment console output
✅ Verify after deployment
✅ Keep deployment logs

### DON'Ts

❌ Don't deploy without testing
❌ Don't skip build verification
❌ Don't deploy everything at once unnecessarily
❌ Don't ignore deployment errors
❌ Don't forget to rollback if needed
❌ Don't deploy to production during peak hours

---

## 📞 Emergency Procedures

### Site Down

1. **Check Firebase Console** - Verify hosting status
2. **Check Deployment Logs** - Identify error
3. **Quick Rollback** - `firebase hosting:rollback`
4. **Notify Team** - Alert stakeholders

### Security Breach

1. **Immediate Rollback** - Deploy previous version
2. **Review Changes** - Identify security issue
3. **Update Rules** - Deploy new Firestore rules
4. **Audit Access** - Check Firebase Console
5. **Notify Users** - If password reset needed

### Data Loss

1. **Stop All Operations** - Prevent further damage
2. **Check Firestore** - Verify data status
3. **Restore Backup** - If available
4. **Review Rules** - Ensure rules are correct
5. **Monitor** - Watch for anomalies

---

## 🔐 Security Notes

### Before Deploying

- [ ] No hardcoded secrets
- [ ] No console.log of sensitive data
- [ ] Admin access verified
- [ ] Security rules reviewed
- [ ] API keys secure

### After Deploying

- [ ] Monitor Firebase Console
- [ ] Check for unusual activity
- [ ] Verify user access
- [ ] Test admin access
- [ ] Review logs

---

## 📚 Additional Resources

- [Firebase Deployment Guide](https://firebase.google.com/docs/hosting/deploying)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)
- [Firebase Console](https://console.firebase.google.com)

---

## 🎯 Quick Commands

```bash
# Build
npm run build:prod

# Deploy hosting
firebase deploy --only hosting

# Deploy rules
firebase deploy --only firestore:rules

# Deploy functions
firebase deploy --only functions

# Rollback hosting
firebase hosting:rollback

# Preview build
npm run preview
```

---

**Last Updated:** 2026-01-XX
**Production URL:** https://duydodeesport.web.app
