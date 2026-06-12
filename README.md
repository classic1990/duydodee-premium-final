# DUYดูDEE PREMIUM

แพลตฟอร์มสตรีมมิ่งวิดีโอระดับพรีเมียมสำหรับดูหนังและซีรีส์คุณภาพสูงระดับ 4K HDR โดยใช้ Firebase เป็น Backend และ Vanilla JavaScript สำหรับ Frontend

## 🌟 คุณสมบัติหลัก

### ผู้ใช้ทั่วไป
- 📺 **ระบบสตรีมมิ่ง**: รับชมหนังและซีรีส์คุณภาพสูง
- 🔍 **ระบบค้นหา**: ค้นหาเนื้อหาที่ต้องการได้อย่างรวดเร็ว
- 📝 **ประวัติการรับชม**: ดูประวัติการรับชมย้อนหลัง
- ❤️ **รายการโปรด**: บันทึกเนื้อหาที่ชอบไว้ดู
- 💎 **ระบบ VIP**: สมัครสมาชิก VIP เพื่อรับสิทธิพิเศษ
- 🎯 **Hero Slider**: แสดงเนื้อหาแนะนำโดยอัตโนมัติจากฐานข้อมูล

### ผู้ดูแลระบบ (Admin)
- 🎬 **จัดการหนัง**: เพิ่ม/แก้ไข/ลบหนังและซีรีส์
- 🖼️ **จัดการ Hero Slider**: ปรับเปลี่ยนสไลด์หน้าแรกได้ง่ายๆ
- 👥 **จัดการผู้ใช้**: ดูและจัดการสมาชิกทั้งหมด
- 💳 **จัดการ VIP**: อนุมัติการสมัครสมาชิก VIP
- 🎫 **ระบบ Support Ticket**: รับแจ้งปัญหาและตอบกลับผู้ใช้
- 📊 **สถิติระบบ**: ดูสถิติการใช้งานและยอดรับชม

## 🏗️ สถาปัตยกรรม

### Frontend
- **Framework**: Vanilla JavaScript (ES6+)
- **Styling**: TailwindCSS
- **Icons**: Lucide Icons
- **Build Tool**: Vite
- **PWA**: Service Worker สำหรับ Offline Support

### Backend
- **Database**: Firebase Firestore
- **Authentication**: Firebase Authentication
- **Storage**: Firebase Storage
- **Functions**: Firebase Cloud Functions (Node.js 20)
- **Hosting**: Firebase Hosting

## 🚀 การติดตั้งและตั้งค่า

### ข้อกำหนดเบื้องต้น
- Node.js 20.x หรือสูงกว่า
- npm หรือ yarn
- Firebase CLI (`npm install -g firebase-tools`)
- Firebase Project

### ขั้นตอนการติดตั้ง

1. **Clone Repository**
```bash
git clone <repository-url>
cd duydodee-premium-final-main
```

2. **ติดตั้ง Dependencies**
```bash
# Frontend dependencies
npm install

# Firebase Functions dependencies
cd functions
npm install
cd ..
```

3. **ตั้งค่า Environment Variables**
```bash
# Copy env template
cp .env.example .env.local

# แก้ไข .env.local ด้วยค่าจริงจาก Firebase Console
nano .env.local
```

**ตัวแปรที่จำเป็นต้องระบุ:**
- `VITE_FIREBASE_API_KEY`: จาก Firebase Console -> Project Settings -> General
- `VITE_FIREBASE_AUTH_DOMAIN`: project.firebaseapp.com
- `VITE_FIREBASE_PROJECT_ID`: project ID
- `VITE_FIREBASE_STORAGE_BUCKET`: project.firebasestorage.app
- `VITE_FIREBASE_MESSAGING_SENDER_ID`: Sender ID
- `VITE_FIREBASE_APP_ID`: App ID
- `VITE_FIREBASE_MEASUREMENT_ID`: Measurement ID
- `VITE_ADMIN_EMAILS`: รายชื่ออีเมลแอดมิน (คั่นด้วย comma)
- `VITE_SITE_URL`: URL ของเว็บไซต์
- `VITE_SITE_NAME`: ชื่อเว็บไซต์

4. **ติดตั้ง Firebase CLI และเชื่อมต่อ Project**
```bash
# Login ด้วย Firebase
firebase login

# Initialize Firebase (ถ้ายังไม่ได้ทำ)
firebase init

# หรือเชื่อมต่อกับ project ที่มีอยู่แล้ว
firebase use <your-project-id>
```

5. **ตั้งค่า Firestore Rules และ Indexes**
```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Firestore indexes
firebase deploy --only firestore:indexes
```

6. **รัน Development Server**
```bash
# Development mode
npm run dev

# Production build
npm run build
```

## 📦 Scripts ที่มีให้

```bash
# Development
npm run dev              # เริ่ม development server
npm run build            # Production build
npm run build:prod       # Production build (mode)
npm run build:css        # Build CSS เท่านั้น

# Testing
npm run test             # Run tests
npm run test:watch       # Watch mode
npm run test:coverage    # Test coverage

# Quality Assurance
npm run lint             # ESLint check
npm run lint:fix         # ESLint auto-fix
npm run format           # Prettier format

# Deployment
npm run deploy           # Deploy ทั้งหมด
npm run deploy:hosting   # Deploy hosting เท่านั้น
npm run deploy:functions # Deploy functions เท่านั้น

# Utilities
npm run generate:sitemap # Generate sitemap
npm run validate:env     # Validate environment variables
npm run clean            # Clean build artifacts
```

## 🔥 คุณสมบัติพิเศษที่เพิ่มใหม่

### 🎭 Hero Slider แบบ Dynamic
หน้าหลักโหลด Hero Slides จาก Firestore โดยตรง:
- **เชื่อมต่อกับฐานข้อมูลเดียวกับหน้าแอดมิน**
- **แอดมินสามารถเพิ่ม/แก้ไข/ลบสไลด์ได้** และหน้าหลักจะแสดงผลทันที
- **รองรับ Auto-slide** เปลี่ยนสไลด์อัตโนมัติทุก 5 วินาที
- **Navigation** มีปุ่มเลื่อนซ้าย/ขวาและ dots indicator
- **Fallback** แสดงรูปพื้นหลังเดิมเมื่อไม่มีสไลด์

### 🔐 Security Improvements
- **ไม่มี Hardcoded Credentials** Firebase config ถูกลบออกจาก code
- **Environment Variables** ใช้ .env.local สำหรับ development
- **Firestore Security Rules** มีการกำหนด permissions ชัดเจน
- **Admin Authentication** ตรวจสอบสิทธิ์ก่อนเข้าถึงหน้าแอดมิน

## 📂 โครงสร้างโปรเจค

```
duydodee-premium-final-main/
├── public/                    # Frontend files
│   ├── admin/                # Admin panel pages
│   ├── assets/               # Static assets (images, logos)
│   ├── css/                  # Stylesheets
│   ├── src/                  # Source JavaScript
│   │   ├── admin/           # Admin panel scripts
│   │   ├── components/      # UI components
│   │   ├── config/          # Configuration
│   │   ├── constants.js     # System constants
│   │   ├── middleware/      # Auth middleware
│   │   ├── pages/           # Page-specific scripts
│   │   ├── services/        # Firebase services
│   │   └── utils/           # Utility functions
│   ├── sw.js                # Service Worker
│   └── index.html           # Main HTML file
├── functions/                # Firebase Cloud Functions
│   ├── index.js             # Main functions file
│   └── package.json         # Functions dependencies
├── scripts/                  # Build & utility scripts
├── .env.example             # Environment template
├── firebase.json            # Firebase configuration
├── firestore.rules           # Firestore security rules
├── firestore.indexes.json    # Firestore indexes
├── package.json             # Main dependencies
└── README.md                # This file
```

## 🔧 การตั้งค่า Firebase

### 1. สร้าง Firebase Project
1. ไปที่ [Firebase Console](https://console.firebase.google.com/)
2. สร้าง project ใหม่
3. เปิดใช้งาน services:
   - Authentication (Email/Password, Google)
   - Firestore Database
   - Storage
   - Hosting

### 2. ตั้งค่า Authentication
- เปิด Email/Password sign-in
- เปิด Google sign-in
- เพิ่ม admin email ใน `VITE_ADMIN_EMAILS`

### 3. ตั้งค่า Firestore
- เลือก Production mode
- Deploy security rules จาก `firestore.rules`
- Deploy indexes จาก `firestore.indexes.json`

### 4. ตั้งค่า Storage
- เปิดใช้งาน Storage
- ตั้งค่า rules สำหรับการเข้าถึงไฟล์

### 5. ตั้งค่า Hosting
- เชื่อมต่อกับ Firebase project
- ตั้งค่า build directory เป็น `dist`

## 🎯 การใช้งาน Hero Slider

### สำหรับผู้ดูแลระบบ (Admin)
1. เข้าสู่ระบบด้วย admin account
2. ไปที่หน้า "จัดการสไลด์หน้าแรก"
3. เพิ่ม/แก้ไข/ลบสไลด์ได้ตามต้องการ:
   - **หัวข้อเด่น**: ชื่อเรื่องหรือหัวข้อที่ต้องการแสดง
   - **คำอธิบายโปรโมท**: รายละเอียดเพิ่มเติม
   - **รูปพื้นหลัง**: URL ของรูปภาพ
   - **ลิงก์ปลายทาง**: ลิงก์ไปยังหน้ารับชม
   - **ลำดับการแสดงผล**: กำหนดลำดับสไลด์

### สำหรับผู้ใช้ทั่วไป
- Hero Slides จะแสดงผลอัตโนมัติบนหน้าแรก
- คลิกที่ปุ่ม "รับชมเลย" เพื่อไปยังหน้ารับชม
- ใช้ปุ่มซ้าย/ขวาหรือ dots เพื่อเลื่อนดูสไลด์อื่น

## 🔒 Security Considerations

### ⚠️ สิ่งที่ต้องทำ
1. **ตั้งค่า Environment Variables**: อย่าลืมตั้งค่า `.env.local` ก่อนรัน
2. **Firestore Rules**: ตรวจสอบและปรับ rules ให้เหมาะกับการใช้งาน
3. **Admin Access**: ใช้ email ที่เชื่อถือได้เท่านั้นใน `VITE_ADMIN_EMAILS`
4. **Firebase Config**: ไม่ commit firebase credentials ลงใน Git

### 🛡️ Security Features
- Admin-only access สำหรับหน้าจัดการ
- Firestore security rules แยก permissions ชัดเจน
- Input validation และ XSS protection
- No hardcoded credentials in production code

## 📝 Environment Variables อ้างอิง

ดูตัวอย่างที่ `.env.example` - **อย่า commit ไฟล์ที่มี credentials จริง!**

```bash
# สำคัญ: อย่า commit .env.local ลงใน Git
echo ".env.local" >> .gitignore
```

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production
```bash
# Build
npm run build

# Deploy to Firebase
npm run deploy
```

### Deploy เฉพาะส่วน
```bash
# Deploy hosting เท่านั้น
npm run deploy:hosting

# Deploy functions เท่านั้น
npm run deploy:functions
```

## 🐛 Troubleshooting

### ไม่สามารถโหลด Hero Slides ได้
1. ตรวจสอบว่า Firestore rules อนุญาตให้อ่าน `hero_slides` collection
2. ตรวจสอบว่ามี data ใน `hero_slides` collection
3. ตรวจสอบ browser console สำหรับ errors

### Authentication ไม่ทำงาน
1. ตรวจสอบว่า Firebase config ถูกต้อง
2. ตรวจสอบว่า Authentication service เปิดใช้งานใน Firebase Console
3. ตรวจสอบว่า admin email ถูกต้องใน `VITE_ADMIN_EMAILS`

### Build หรือ Deploy ล้มเหลว
1. ตรวจสอบว่า dependencies ติดตั้งครบ (`npm install`)
2. ตรวจสอบ environment variables
3. ตรวจสอบ Firebase CLI version (`firebase --version`)

## 📄 License

โปรเจคนี้เป็นส่วนตัว กรุณาขออนุญาตก่อนนำไปใช้งาน

## 👨‍💻 ผู้พัฒนา

DUYดูDEE Entertainment

## 🙏 Acknowledgments

- Firebase สำหรับ Backend services
- TailwindCSS สำหรับ Styling
- Lucide สำหรับ Icons
- Vite สำหรับ Build tool