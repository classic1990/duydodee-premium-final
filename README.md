# DUYดูDEE PREMIUM 🎬

> ที่สุดแห่งประสบการณ์ความบันเทิงระดับ 4K HDR Premium

DUYดูDEE PREMIUM คือแพลตฟอร์มสตรีมมิ่งวิดีโอแนวตั้งที่ออกแบบมาเพื่อมอบประสบการณ์การรับชมภาพยนตร์และซีรีส์คุณภาพสูงระดับมาสเตอร์พีซ ด้วย UI แบบ Cinematic Premium ที่หรูหราและระบบที่ทันสมัย

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Security](#security)
- [Performance](#performance)
- [Getting Started](#getting-started)
- [Development](#development)
- [Deployment](#deployment)
- [Documentation](#documentation)

---

## ✨ Features

### 🎨 Premium UI/UX
- **Cinematic Design** - UI แบบโรงหนังพรีเมียม
- **Glassmorphism Effects** - Glass effects สวยงาม
- **Gold Accents** - สีทองเพิ่มความหรูหรา
- **Responsive Design** - รองรับทุกอุปกรณ์
- **Dark Mode** - โหมดมืดเริ่มต้น

### 🎬 Video Features
- **YouTube Embed Player** - รองรับ YouTube iframe
- **Premium Player Controls** - Control วิดีโอพรีเมียม
- **Quality Badge** - แสดงคุณภาพวิดีโอ
- **Cinematic Glows** - Effects คล้ายโรงหนัง
- **Progress Tracking** - บันทึกความคืบหน้าการรับชม

### 🔐 Security
- **Google-Only Admin** - Admin Dashboard ต้องล็อกอินด้วย Google เท่านั้น
- **Firebase Authentication** - ระบบยืนยันตัวตน Firebase
- **Firestore Security Rules** - Rules ปกป้องข้อมูล
- **Auth Guards** - Guard หน้า Admin อัตโนมัติ

### 🚀 Performance
- **Vite Build** - Build tool ที่เร็ว
- **Code Splitting** - แบ่งโค้ดเป็น chunks
- **Lazy Loading** - โหลดเฉพาะที่จำเป็น
- **Service Worker** - PWA offline support
- **Image Optimization** - Optimize รูปภาพอัตโนมัติ

### 💬 Real-time Features
- **View Count** - นับยอดเข้าชมแบบ real-time
- **Watch History** - ประวัติการรับชม
- **Bookmarks** - บุ๊กมาร์กเนื้อหา

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** Vanilla JavaScript (ES6+)
- **Styling:** TailwindCSS
- **Icons:** Lucide Icons
- **Build Tool:** Vite
- **PWA:** Service Worker + Manifest

### Backend
- **Database:** Firebase Firestore
- **Authentication:** Firebase Auth (Google + Email/Password)
- **Storage:** Firebase Storage
- **Functions:** Firebase Cloud Functions (Node.js 20)
- **Hosting:** Firebase Hosting

### Development Tools
- **Package Manager:** npm
- **Linter:** ESLint
- **CSS:** PostCSS + TailwindCSS
- **Git:** Version Control

---

## 🏗️ Architecture

### Directory Structure

```
duydodee-premium-final-main/
├── public/                      # Frontend source
│   ├── admin/                   # Admin pages
│   │   └── components/          # Admin fragments (sidebar.html)
│   ├── src/
│   │   ├── admin/              # Admin logic
│   │   ├── components/         # Reusable components
│   │   │   ├── cards/         # Movie cards
│   │   │   ├── layout/        # Layout components
│   │   │   ├── modals/        # Modal dialogs
│   │   │   ├── player/        # Video player
│   │   │   └── ui.js          # UI helpers
│   │   ├── pages/             # Page logic
│   │   │   ├── auth/         # Auth pages
│   │   │   ├── movie/        # Movie pages
│   │   │   └── series/       # Series pages
│   │   ├── services/          # Firebase services
│   │   ├── middleware/        # Auth guards
│   │   ├── utils/            # Utilities
│   │   ├── constants.js      # Constants
│   │   └── config/           # Config
│   ├── css/                  # Stylesheets
│   ├── assets/               # Static assets
│   └── [pages].html          # HTML files
├── functions/                # Cloud Functions (Node.js)
├── firestore.rules           # Firestore security rules
├── firebase.json             # Firebase config
├── vite.config.js            # Vite config
├── tailwind.config.cjs       # Tailwind config
└── package.json              # Dependencies
```

### Component Architecture

```
Pages (HTML + JS)
  └─> Components (Reusable)
       ├─> Cards (Movie, Series)
       ├─> Layout (Navbar, Hero Slider)
       ├─> Player (Video Player)
       ├─> Modals (VIP Upgrade, Tickets)
       └─> UI (Toast, Error Handling)
  └─> Services (Firebase)
       ├─> Auth Service
       ├─> Content Service
       └─> Firebase Config
  └─> Middleware
       └─> Auth Guard
```

---

## 🔒 Security

### Admin Access
- **Google-Only Login Required** - Admin Dashboard ต้องล็อกอินด้วย Google Account เท่านั้น
- **Email Verification** - Email ต้องถูกยืนยัน
- **Role-Based Access** - เช็ค admin role จาก Firestore
- **Auth Guards** - Guard หน้า Admin อัตโนมัติ

### Firebase Security Rules
- **VIP Payments Collection** - อ่าน/เขียนเฉพาะ Admin
- **User Data** - User สามารถอ่าน/เขียนข้อมูลตัวเองเท่านั้น
- **Public Data** - Movies/Series อ่านได้ทุกคน
- **Admin Operations** - เฉพาะ Admin เท่านั้นสามารถลบ/แก้ไข

### Important Security Notes

⚠️ **CRITICAL: Google Login for Admin Access**

Admin Dashboard ต้องล็อกอินด้วย Google Account เท่านั้น:
- ตรวจสอบใน: `src/middleware/auth-guard.js`
- Helper function: `src/services/auth-service.js` → `isGoogleUser()`
- Firebase Service: `src/services/firebase.js` → เช็ค Google login

❌ **Non-Google Login** จะไม่สามารถเข้า Admin Dashboard ได้
✅ **User ปกติ** สามารถล็อกอินด้วย Email/Password และใช้งานได้ปกติ

---

## ⚡ Performance

### Build Optimizations
- **Code Splitting** - แบ่งโค้ดเป็น chunks (Firebase, UI, Services)
- **Tree Shaking** - ลบโค้ดที่ไม่ได้ใช้
- **Minification** - Minify JS/CSS
- **Asset Optimization** - Optimize รูปภาพ

### Runtime Optimizations
- **Lazy Loading** - โหลดเฉพาะที่จำเป็น
- **Image Lazy Loading** - โหลดรูปเมื่อเลื่อนมาถึง
- **Throttle/Debounce** - ลดการเรียก function ซ้ำ
- **Fallback Strategy** - มี local fallback ถ้า Functions ไม่ทำงาน

### Service Worker & PWA
- **Offline Support** - ทำงาน offline ได้
- **Caching Strategy** - Cache assets เพื่อโหลดเร็วขึ้น
- **Manifest** - Installable app
- **Update Strategy** - Auto-update content

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- npm
- Firebase CLI
- Git

### Installation

```bash
# Clone repository
git clone https://github.com/classic1990/duydodee-premium-final.git
cd duydodee-premium-final-main

# Install dependencies
npm install

# Setup Firebase
firebase login
npm run firebase:init
```

### Run Development Server

```bash
# Start dev server
npm run dev

# Open browser at http://localhost:5173
```

### Build for Production

```bash
# Build production
npm run build:prod

# Preview production build
npm run preview
```

---

## 👨‍💻 Development

### Available Scripts

```bash
# Development
npm run dev              # Start dev server
npm run preview          # Preview production build

# Building
npm run build:prod       # Build production
npm run build:css        # Build CSS with PostCSS

# Linting
npm run lint            # Check linting
npm run lint:fix        # Fix linting automatically

# Firebase
npm run firebase:deploy  # Deploy Firebase (full)
npm run firebase:rules  # Deploy Firestore rules only
```

### Development Workflow

1. **Start Dev Server**
   ```bash
   npm run dev
   ```

2. **Make Changes**
   - Edit HTML/JS/CSS files in `public/`
   - Changes auto-reload via Vite HMR

3. **Test Locally**
   - Test features in dev server
   - Check console for errors

4. **Build & Deploy**
   ```bash
   npm run build:prod
   npm run firebase:rules
   npm run firebase:deploy
   ```

---

## 🚢 Deployment

### Firebase Deployment

```bash
# Deploy everything (Hosting, Functions, Firestore)
firebase deploy

# Deploy Hosting only
firebase deploy --only hosting

# Deploy Firestore Rules only
firebase deploy --only firestore:rules

# Deploy Functions only
firebase deploy --only functions
```

### Important Deployment Notes

⚠️ **Cloud Functions - Billing Required**

Cloud Functions deployment ต้องการ billing account:
```bash
# If billing is not enabled, use local fallback
# The system will work without Functions via:
# - Local search fallback (Firestore prefix matching)
# - Local view count increment (Firestore direct update)
```

⚠️ **Service Worker Copy**

Vite config มี plugin copy sw.js อัตโนมัติ:
```javascript
// vite.config.js
// sw.js, manifest.json, robots.txt, sitemap.xml
// จะถูก copy ไป dist/ อัตโนมัติ
```

### Deployment Checklist

- [ ] Build production: `npm run build:prod`
- [ ] Check sw.js is copied to dist
- [ ] Deploy Firestore rules: `firebase deploy --only firestore:rules`
- [ ] Deploy Hosting: `firebase deploy --only hosting`
- [ ] (Optional) Deploy Functions: `firebase deploy --only functions`
- [ ] Test on production URL
- [ ] Check Service Worker registration
- [ ] Check PWA manifest
- [ ] Test Google Admin login

---

## 📚 Documentation

### Essential Documentation

- **[SETUP.md](./SETUP.md)** - การติดตั้งและตั้งค่า
- **[DEVELOPMENT.md](./DEVELOPMENT.md)** - ไกด์การพัฒนา
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - ไกด์การ Deploy
- **[AGENTS.md](./AGENTS.md)** - ไกด์สำหรับ Devin/Agents

### Project Configuration

- **[vite.config.js](./vite.config.js)** - Vite configuration
- **[tailwind.config.cjs](./tailwind.config.cjs)** - Tailwind CSS config
- **[firebase.json](./firebase.json)** - Firebase project config
- **[firestore.rules](./firestore.rules)** - Firestore security rules
- **[package.json](./package.json)** - Dependencies and scripts

### Key Files to Understand

**Authentication & Security:**
- `public/src/services/auth-service.js` - Authentication logic
- `public/src/middleware/auth-guard.js` - Auth guards
- `public/src/services/firebase.js` - Firebase config

**Core Components:**
- `public/src/components/ui.js` - Main UI components
- `public/src/components/player/VideoPlayer.js` - Video player
- `public/src/components/cards/MovieCards.js` - Movie cards

**Pages:**
- `public/src/pages/home.js` - Home page logic
- `public/src/pages/search.js` - Search logic
- `public/src/pages/movie/watch.js` - Movie watch page

---

## 🐛 Troubleshooting

### Common Issues

**Issue: Service Worker 404 Error**
- **Solution:** Check vite.config.js for copy-static-files plugin
- sw.js must be in STATIC_ROOT_FILES
- Run `npm run build:prod` again

**Issue: CORS Error on View Count**
- **Solution:** System uses local fallback automatically
- Check content-service.js for incrementViewCount fallback

**Issue: Google Admin Login Not Working**
- **Solution:** Check auth-service.js for isGoogleUser()
- Check auth-guard.js for admin access check
- Ensure user email is in ADMIN_EMAILS env var

**Issue: Build Fails**
- **Solution:** Run `npm install` to update dependencies
- Clear node_modules and reinstall
- Check Node.js version (requires 20+)

---

## 📝 License

Copyright © 2026 DUYดูDEE Entertainment. All Rights Reserved.

---

## 👥 Support

For support and questions:
- Email: support@duydodee.com
- GitHub Issues: https://github.com/classic1990/duydodee-premium-final/issues

---

**Built with ❤️ using Firebase, Vite, and TailwindCSS**
