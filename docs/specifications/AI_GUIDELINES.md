# 🤖 DUYดูDEE AI Development Guidelines

คู่มือสำหรับ AI ในการช่วยเขียนโค้ดและปรับปรุงระบบให้คงมาตรฐาน "Master Edition"

## 1. Architectural Patterns
- **Firebase Bridge:** ห้าม Import Firebase SDK ลงในหน้า Page โดยตรง ให้ใช้ผ่าน `src/services/firebase.js` เท่านั้น เพื่อรักษา Compatibility
- **Service Layer:** Logic เกี่ยวกับข้อมูลให้เก็บไว้ใน `content-service.js` หรือ `auth-service.js`
- **UI Consistency:** ใช้ Object `UI` จาก `src/components/ui.js` ในการแสดงผล Toast, Loading และการสร้าง Card

## 2. UI/UX Standards (Cinematic Edition)
- **Color Palette:** พื้นหลัง `#050507`, สีหลัก `#fbbf24`.
- **Effects:** เน้นการใช้ `backdrop-blur`, `animate-pulse`, และ `glass-premium`.
- **Icons:** ใช้ Lucide Icons (`data-lucide`) และต้องเรียก `UI.refreshIcons()` ทุกครั้งหลัง Render HTML แบบ Dynamic.
- **Responsiveness:** ต้องรองรับ Mobile (Portrait) สำหรับซีรีส์แนวตั้งเสมอ.

## 3. Data Integrity
- **View Counts:** ทุกการเพิ่มยอดวิวต้องบันทึกลงทั้ง Document ของหนัง และ `daily_stats`.
- **Security:** ตรวจสอบสิทธิ์ `isAdmin` ในหน้า Admin เสมอ และใช้ Firestore Rules ที่กำหนดไว้.

## 4. Deployment
- ทุกครั้งก่อนแนะนำให้ Deploy ต้องเตือนผู้ใช้ให้รัน `Ship.bat` เพื่อตรวจสอบความปลอดภัยและ Linting.

## 5. File Naming & Conventions
- ใช้ `kebab-case` สำหรับชื่อไฟล์ (เช่น `admin-stats.js`).
- ห้ามใช้ Inline Script ในไฟล์ HTML ให้ใช้ `type="module"` และดึงจากไฟล์แยกเสมอ.