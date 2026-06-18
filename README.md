# DUYดูDEE PREMIUM 🎬 (Master Edition)

> ที่สุดแห่งประสบการณ์ความบันเทิงระดับ 4K HDR Premium - "Cinematic Sport Edition"

DUYดูDEE PREMIUM คือแพลตฟอร์มสตรีมมิ่งวิดีโอที่ออกแบบมาเพื่อมอบประสบการณ์การรับชมภาพยนตร์และซีรีส์คุณภาพสูง ด้วย UI แบบ Cinematic Premium ที่หรูหรา และระบบหลังบ้านที่ทรงพลังแต่ประหยัดทรัพยากร (Free Tier Optimized)

---

## ✨ Features (V6.0 Master)

### 🎨 Premium UI/UX
- **Cinematic Design** - สวยงามระดับโรงภาพยนตร์ด้วยสไตล์หรูหรา
- **Glassmorphism & Gold Accents** - การออกแบบที่ทันสมัยพร้อมลูกเล่นสะท้อนแสงพรีเมียม
- **Responsive & Vertical Support** - รองรับทั้งแนวตั้ง (Series) และแนวนอน (Movies) ทุกอุปกรณ์
- **Premium Player** - เครื่องเล่นวิดีโอ YouTube ในเฟรม iPhone Cinematic สุดหรู

### 🔐 Security & Reliability
- **Google-Only Admin** - บังคับเข้าหน้าแอดมินด้วย Google Account เท่านั้นเพื่อความปลอดภัยสูงสุด
- **Privacy-First Rules** - ระบบ Firestore Rules ที่รัดกุม ปกป้องข้อมูลส่วนตัวของผู้ใช้ (User Privacy Tightened)
- **Advanced Error Handling** - ระบบดักจับข้อผิดพลาดและบันทึก Log ลง Firestore/LocalStorage อัตโนมัติ
- **Hybrid Search** - ค้นหาอัจฉริยะ (Algolia -> Local Search Fallback)

### ⚡ Performance & PWA
- **Free Tier Optimized** - ระบบทำงานได้สมบูรณ์โดยไม่ต้องใช้ Cloud Functions (ลดค่าใช้จ่าย)
- **Vite Build System** - โหลดเร็ว ประสิทธิภาพสูง พร้อม Code Splitting
- **PWA Ready** - รองรับการติดตั้งเป็นแอปบนมือถือและทำงานในโหมด Offline (Service Worker)
- **Lazy Loading** - บีบอัดและโหลดรูปภาพเฉพาะเมื่อใช้งานจริง

---

## 🛠️ Tech Stack

- **Frontend:** Vanilla JavaScript (ES6+), TailwindCSS, Lucide Icons
- **Build Tool:** Vite 8+
- **Database:** Firebase Firestore
- **Authentication:** Firebase Auth (Google + Email/Password)
- **Storage:** Firebase Storage
- **Security:** Firestore Security Rules V2
- **Error Tracking:** Sentry (Optional), Custom Firestore Logger

---

## 🏗️ Architecture

```
duydodee-premium-final-main/
├── public/                 # Frontend Source (Vite Root)
│   ├── admin/              # ระบบจัดการหลังบ้าน
│   ├── src/
│   │   ├── components/     # UI Modules (Player, Cards, Modals)
│   │   ├── services/       # Firebase & Business Logic
│   │   ├── middleware/     # Auth Guards
│   │   ├── config/         # Environment Config
│   │   └── utils/          # UI Helpers & Error Handlers
│   ├── sw.js               # Service Worker (PWA)
│   └── index.html          # Entry Point
├── firestore.rules         # กฎความปลอดภัย (Tightened Edition)
├── DEPLOY_PRO.bat          # สคริปต์ Deploy รุ่นโปร (พร้อมระบบ Audit)
├── DEPLOY_RULES.bat        # สคริปต์ Deploy เฉพาะ Security Rules (รวดเร็ว)
└── vite.config.js          # ระบบ Build & Optimization
```

---

## 🚀 Getting Started

### 1. Installation
```bash
# ติดตั้ง dependencies
npm install
```

### 2. Environment Setup
สร้างไฟล์ `.env` ใน root directory:
```env
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_PROJECT_ID=your_id
VITE_ADMIN_EMAILS=admin@example.com
```

### 3. Development
```bash
# เริ่มระบบพัฒนา
npm run dev
```

---

## 🚢 Deployment (Automation)

เราเตรียมสคริปต์เพื่อให้การ Deploy เป็นเรื่องง่ายและปลอดภัย:

- **`DEPLOY_PRO.bat`** 🚀: ใช้สำหรับขึ้นโปรดักชัน (ตรวจสอบ Git, Lint, Test, Audit และ Build ครบวงจร)
- **`DEPLOY_QUICK.bat`** ⚡: สำหรับการแก้ไขเล็กน้อยที่ต้องการความเร็ว
- **`DEPLOY_RULES.bat`** 🛡️: สำหรับอัปเดตเฉพาะกฎความปลอดภัย (Firestore Rules) โดยไม่ต้อง Build เว็บใหม่

---

## 🛡️ Security Model

ระบบใช้กฎความปลอดภัยแบบ **Ownership-Based Access**:
- **Users:** อ่านและแก้ไขได้เฉพาะข้อมูลของตัวเองเท่านั้น
- **Payments:** ผู้ใช้ส่งข้อมูลแจ้งโอนเงินได้ แต่ไม่มีสิทธิ์อนุมัติเอง (เฉพาะ Admin)
- **Content:** บุคคลทั่วไปอ่านได้ แต่แก้ไขไม่ได้
- **Admin:** มีสิทธิ์จัดการข้อมูลสมาชิก การชำระเงิน และสถิติทั้งหมด

---

## 📝 License

Copyright © 2026 DUYดูDEE Entertainment. All Rights Reserved.
**Built with ❤️ for Cinematic Experience**
