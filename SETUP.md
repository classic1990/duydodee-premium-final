# 🚀 SETUP.md - Installation & Configuration

> ไกด์การติดตั้งและตั้งค่าโปรเจค DUYดูDEE PREMIUM สำหรับการพัฒนา

---

## 📋 Prerequisites

ต้องการ software ต่อไปนี้ก่อนเริ่ม:

### Required

- **Node.js** v20.0.0 หรือสูงกว่า
  - Download: https://nodejs.org/
  - Check version: `node --version`

- **npm** (มากับ Node.js)
  - Check version: `npm --version`

- **Git**
  - Download: https://git-scm.com/
  - Check version: `git --version`

- **Firebase CLI**
  - Install: `npm install -g firebase-tools`
  - Check version: `firebase --version`

### Optional but Recommended

- **VS Code** หรือ code editor อื่นๆ
- **Chrome DevTools** สำหรับ debugging

---

## 📦 Installation Steps

### 1. Clone Repository

```bash
# Clone repository
git clone https://github.com/classic1990/duydodee-premium-final.git
cd duydodee-premium-final-main
```

### 2. Install Dependencies

```bash
# Install all npm packages
npm install
```

**Expected Output:**
```
added 150+ packages, and audited 150+ packages
```

### 3. Firebase Setup

#### 3.1 Login to Firebase

```bash
firebase login
```

This will open browser for authentication.

#### 3.2 Select Firebase Project

```bash
# List available projects
firebase projects:list

# Use existing project (if already linked)
firebase use duydodeesport
```

**Note:** If project is already configured in `firebase.json`, skip this step.

### 4. Environment Variables

สร้างไฟล์ `.env` ใน root directory (ถ้าจำเป็น):

```env
# Firebase Project Config (ถ้าไม่มีใน firebase.js)
FIREBASE_PROJECT_ID=duydodeesport
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=duydodeesport.firebaseapp.com
FIREBASE_DATABASE_URL=https://duydodeesport-default-rtdb.firebaseio.com
FIREBASE_STORAGE_BUCKET=duydodeesport.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id

# Admin Emails (comma separated)
ADMIN_EMAILS=admin1@gmail.com,admin2@gmail.com
```

**Note:** Firebase config อยู่ใน `public/src/services/firebase-config.js` แล้ว

---

## 🔧 Verification

### 1. Verify Node.js Version

```bash
node --version
# Should be v20.0.0 or higher
```

### 2. Verify npm Installation

```bash
npm list --depth=0
# Should show all packages
```

### 3. Verify Firebase CLI

```bash
firebase --version
# Should show version number
firebase projects:list
# Should list available projects
```

### 4. Verify Build

```bash
# Build production
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
```

**Critical Checks:**
- ✅ Build succeeds
- ✅ `sw.js` is copied (Service Worker)
- ✅ `manifest.json` is copied (PWA)
- ✅ `sitemap.xml` is copied (SEO)

### 5. Verify Dev Server

```bash
# Start dev server
npm run dev
```

Open browser to: `http://localhost:5173`

**Expected:**
- Home page loads
- No console errors
- Service Worker registers successfully
- Icons render correctly

---

## ⚙️ Configuration Files

### vite.config.js

สำคัญมากสำหรับ build แล copying static files

**Critical Sections:**
- `STATIC_ROOT_FILES` (lines 10-16) - Files to copy to dist
- `copy-static-files` plugin (lines 114-131) - Copies sw.js, manifest.json, etc.

**Do NOT modify:**
- `STATIC_ROOT_FILES` array
- `copy-static-files` plugin

### tailwind.config.cjs

Tailwind CSS configuration

**Common modifications:**
- Add new colors in `theme.extend.colors`
- Add new fonts in `theme.extend.fontFamily`
- Add new animations in `theme.extend.keyframes`

### firebase.json

Firebase project configuration

**Common modifications:**
- Add new rewrites rules
- Change hosting settings
- Add headers configuration

### firestore.rules

Firestore security rules

**⚠️ CRITICAL:**
- Admin access rules
- VIP payments restrictions
- User data protection

**Review before deploying:**
```bash
firebase deploy --only firestore:rules
```

---

## 🌐 Firebase Console Setup

### 1. Enable Authentication

1. Go to Firebase Console: https://console.firebase.google.com
2. Select project: `duydodeesport`
3. Navigate to: Authentication → Sign-in method
4. Enable:
   - ✅ Google
   - ✅ Email/Password

### 2. Enable Firestore

1. Navigate to: Firestore Database → Create Database
2. Choose production mode
3. Set default rules (or use existing `firestore.rules`)

### 3. Enable Storage (Optional)

1. Navigate to: Storage → Get Started
2. Choose rules for production

### 4. Set Admin Emails

Set environment variable or update in Firebase Functions:

```javascript
// functions/index.js
const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(',') || ['admin1@gmail.com'];
```

---

## 🎨 Local Development Setup

### 1. Start Dev Server

```bash
npm run dev
```

Open: `http://localhost:5173`

### 2. Enable Hot Module Replacement (HMR)

Vite has HMR enabled by default. Changes to JS/CSS/HTML files auto-reload.

### 3. Enable Browser DevTools

1. Open Chrome DevTools (F12)
2. Check Console for errors
3. Use Network tab to debug API calls
4. Use Application tab to check:
   - Local Storage
   - Service Worker
   - Cache

### 4. Test Authentication

**Test Google Login:**
1. Go to: http://localhost:5173/login.html
2. Click Google login button
3. Verify login succeeds
4. Check user data in Firebase Console

**Test Email/Password Login:**
1. Go to: http://localhost:5173/register.html
2. Register new account
3. Login with email/password
4. Verify login succeeds

**Test Admin Access:**
1. Login with Google account (in ADMIN_EMAILS)
2. Go to: http://localhost:5173/admin/admin-manage.html
3. Verify admin dashboard loads
4. Login with non-Google account
5. Go to: http://localhost:5173/admin/admin-manage.html
6. Verify access is denied with alert

---

## 🐛 Common Setup Issues

### Issue: Node.js Version Too Low

**Error:**
```
Error: Node.js version is too low. Requires v20 or higher.
```

**Solution:**
```bash
# Install nvm (Node Version Manager)
# Download from: https://github.com/nvm-sh/nvm

# Install Node.js 20
nvm install 20
nvm use 20
```

### Issue: npm Install Fails

**Error:**
```
npm ERR! code EINTEGRITY
```

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Issue: Firebase Login Fails

**Error:**
```
Error: Authentication failed
```

**Solution:**
```bash
# Logout
firebase logout

# Login again
firebase login
```

### Issue: Build Fails - sw.js Not Copied

**Error:**
```
✅ Copied manifest.json
✅ Copied robots.txt
# Missing sw.js
```

**Solution:**
1. Check `vite.config.js` has `copy-static-files` plugin
2. Verify `sw.js` exists in `public/`
3. Verify `sw.js` is in `STATIC_ROOT_FILES`
4. Rebuild: `npm run build:prod`

### Issue: Port 5173 Already in Use

**Error:**
```
Port 5173 is already in use
```

**Solution:**
```bash
# Kill process on port 5173
# Windows:
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:5173 | xargs kill

# Or use different port
npm run dev -- --port 3000
```

---

## 📱 PWA Setup Verification

### 1. Check Service Worker

1. Open DevTools (F12)
2. Go to Application → Service Workers
3. Verify Service Worker is registered
4. Check status: "Activated" or "Redundant"

### 2. Check Manifest

1. Open DevTools → Application → Manifest
2. Verify manifest loads
3. Check:
   - Name
   - Icons
   - Start URL
   - Display mode

### 3. Test Offline

1. Open DevTools → Network
2. Check "Offline" box
3. Reload page
4. Verify offline page shows

---

## 🔐 Security Setup

### 1. Admin Access Configuration

Set admin emails in one of these ways:

**Option 1: Environment Variable**
```bash
# .env file
ADMIN_EMAILS=admin1@gmail.com,admin2@gmail.com
```

**Option 2: Firebase Functions Config**
```javascript
// functions/index.js
const ADMIN_EMAILS = ['admin1@gmail.com', 'admin2@gmail.com'];
```

### 2. Firestore Security Rules

Deploy rules:
```bash
firebase deploy --only firestore:rules
```

Verify rules in Firebase Console:
1. Go to Firestore → Rules
2. Verify admin access rules
3. Test with simulation

### 3. Authentication Methods

Enable required methods in Firebase Console:
- Google (for admin)
- Email/Password (for users)

---

## 📦 Post-Installation Checklist

### Required

- [ ] Node.js v20+ installed
- [ ] npm dependencies installed
- [ ] Firebase CLI installed
- [ ] Firebase project linked
- [ ] Build succeeds: `npm run build:prod`
- [ ] Service Worker copied to dist
- [ ] Manifest copied to dist
- [ ] Sitemap copied to dist
- [ ] Dev server runs: `npm run dev`
- [ ] Home page loads without errors

### Recommended

- [ ] Google login tested
- [ ] Email/Password login tested
- [ ] Admin access tested (Google-only)
- [ ] Service Worker verified
- [ ] PWA manifest verified
- [ ] Offline mode tested
- [ ] Firestore rules deployed
- [ ] Admin emails configured

---

## 🎯 Quick Start (After Setup)

```bash
# Start development
npm run dev

# Build production
npm run build:prod

# Deploy hosting
firebase deploy --only hosting

# Deploy Firestore rules
firebase deploy --only firestore:rules
```

---

## 📞 Troubleshooting Help

If setup fails:

1. Check this guide's Common Issues section
2. Check console for specific error messages
3. Verify all prerequisites are installed
4. Clear caches and reinstall
5. Check AGENTS.md for critical rules

---

## 🔄 Update & Maintenance

### Update Dependencies

```bash
# Check for outdated packages
npm outdated

# Update all packages
npm update

# Reinstall from scratch
rm -rf node_modules package-lock.json
npm install
```

### Update Firebase CLI

```bash
npm install -g firebase-tools@latest
```

---

**Last Updated:** 2026-01-XX
**Version:** 1.0.0
