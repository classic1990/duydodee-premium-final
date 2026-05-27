# DUYดูDEE (Cinematic Sport Edition)

แพลตฟอร์มบริหารจัดการทรัพยากรกราฟิกและสตรีมมิ่งกีฬาพรีเมียม ออกแบบมาเพื่อประสบการณ์การรับชมที่เหนือระดับ คมชัดทุกอณูบนทุกอุปกรณ์

## 🚀 Overview
DUYดูDEE เป็นโปรเจค Web Application ที่เน้นประสิทธิภาพสูงและการจัดการเนื้อหาที่ซับซ้อน โดยใช้ Firebase เป็นแกนหลักในการจัดการฐานข้อมูล Authentication และ Hosting มาพร้อมกับระบบหลังบ้าน (Admin Dashboard) ที่แข็งแกร่งสำหรับการจัดการคอนเทนต์แบบมืออาชีพ

## 🛠️ Technology Stack
*   **Frontend:** Vanilla JavaScript (ES6+), Tailwind CSS
*   **Backend:** Firebase (Firestore, Authentication, Hosting)
*   **Icons:** Lucide Icons
*   **Testing:** Jest (Infrastructure Setup)
*   **Build/Workflow:** PostCSS, Imagemin, Custom Deployment Protocol (Ship.bat)

## 📋 Key Features
### User Features
*   **Premium Content Delivery:** รองรับการสตรีมความคมชัดสูง
*   **Responsive Experience:** ระบบหน้าตาเว็บที่ปรับให้เหมาะสมกับอุปกรณ์ทุกขนาด
*   **Watch History & Trending:** ระบบติดตามประวัติการรับชมและคอนเทนต์มาแรง
*   **Real-time Interaction:** ระบบแชร์เนื้อหาและรายการโปรด

### Admin Features (Executive Control)
*   **Mobile-First Admin Panel:** รองรับการจัดการผ่านมือถือด้วย Desktop-like viewport
*   **Analytics Dashboard:** กราฟสถิติยอดการเข้าชม (Chart.js)
*   **Content Management:** ระบบจัดการ หนัง/ซีรีส์ (เพิ่ม, แก้ไข, ลบ) พร้อมระบบตรวจสอบลิงก์ซ้ำอัตโนมัติ
*   **System Safety:** ระบบล้างข้อมูลสำรองฉุกเฉิน (Purge Data) พร้อมการยืนยันตัวตน

## ⚙️ Getting Started
### 1. Prerequisites
*   Node.js (LTS version)
*   Firebase CLI (installed globally: `npm install -g firebase-tools`)

### 2. Setup
```bash
# Install dependencies
npm install

# Build CSS
npm run build:css
```

## 🚢 Deployment Protocol (Master Ship)
เรามีโปรโตคอลการ Deploy ที่ปลอดภัยและเป็นระบบผ่าน `Ship.bat`:
1.  รันสคริปต์: `.\Ship.bat`
2.  สคริปต์จะทำการ:
    *   Validate ระบบ
    *   Install Dependencies (หากจำเป็น)
    *   Lint Code (ESLint)
    *   Build Assets (CSS/Images)
    *   Deploy ขึ้น Firebase Hosting & Firestore

## 🧪 Testing
โปรเจคนี้รองรับระบบ Unit Testing ด้วย Jest
```bash
# Run tests
npm test
```
*Test Files:* `tests/services/` และ `tests/utils/`

## 📂 Project Structure
```text
D:\DUYDODEE-HD
├── public/           # Source Code (Frontend)
│   ├── admin/        # Admin Panel Pages
│   ├── assets/       # Media Assets
│   ├── css/          # Tailwind Output & Fonts
│   └── js/           # Main Logic
│       ├── admin/    # Admin Logic
│       ├── services/ # API/Firebase Services
│       └── utils/    # Utilities
├── tests/            # Jest Unit Tests
├── Ship.bat          # Deployment Script
└── package.json      # Dependencies & Scripts
```

## 🛡️ Best Practices & Guidelines
*   **Strict Logic Preservation:** ห้ามแก้ไข Business Logic เดิมโดยไม่ผ่านการ Review
*   **Consistency:** ใช้มาตรฐานฟังก์ชัน `formData` และ `UI.showToast` ในการจัดการ Admin
*   **Safety:** ข้อมูลสำคัญ (เช่น การ Purge ข้อมูล) ต้องมีขั้นตอนการยืนยันตัวตนเสมอ

---
*Maintained by DUYดูDEE Development Team*
