# 📘 DUYดูDEE Developer Guide (อ่านก่อนเริ่มงาน!)

นี่คือคู่มือสำหรับการพัฒนาและดูแลรักษาโปรเจค DUYดูDEE เพื่อให้เว็บของคุณคงมาตรฐานมืออาชีพ และป้องกันไม่ให้ระบบพัง!

---

## 🛑 กฎเหล็ก (Golden Rules)
1.  **ห้ามแก้ไข Logic หลักโดยไม่จำเป็น:** หากฟังก์ชันทำงานได้อยู่แล้ว อย่ารื้อ Logic ถ้าไม่มั่นใจ
2.  **ยึดมาตรฐานเดิมเสมอ:** ทุกการเพิ่มโค้ดต้องใช้รูปแบบเดิม (เช่น การใช้ `UI.showToast`, `UI.setLoading`, และการจัดการ `formData`)
3.  **ห้ามทิ้ง Debug Code:** ห้ามมี `console.log` หลงเหลือในโปรดักชัน
4.  **Admin เป็นส่วนสำคัญ:** ทุกหน้าแอดมินต้องมี `admin-overlay` และ `Viewport = 1024` เสมอ เพื่อให้หน้าตาคงที่

---

## 🗺️ แผนที่โครงสร้าง (Directory Map)

### 1. ส่วนการออกแบบ (Styles & UI)
*   **Tailwind CSS:** ใช้ `tailwind.config.js` เป็นหลัก หากต้องการปรับสีหรือ Font ให้ปรับที่นี่
*   **CSS หลัก:** `public/css/styles.css` (สำหรับ Custom CSS ที่ Tailwind ไม่มี)
*   **Fonts:** `public/css/fonts.css`

### 2. ส่วน Logic (Frontend)
*   **หน้าเว็บทั่วไป:** อยู่ใน `public/js/pages/`
*   **บริการหลังบ้าน (Firebase Services):** อยู่ใน `public/js/services/`
*   **ส่วนประกอบ UI:** อยู่ใน `public/js/components/ui.js` (รวมคำสั่ง `Toast`, `Loading`, `Share`)

### 3. ส่วนหลังบ้าน (Admin System)
*   **โครงสร้างหน้า HTML:** `public/admin/` (ทุกไฟล์ต้องมี `<div id="admin-overlay">` และ viewport กว้าง 1024)
*   **โครงสร้าง JS แอดมิน:** `public/js/admin/` (ต้องใช้โครงสร้าง `DOMContentLoaded` และ `UI.initAdminSidebar()` เสมอ)

---

## 🛠️ วิธีแก้ไขจุดต่างๆ แบบมืออาชีพ

### หากต้องการเปลี่ยนดีไซน์ (CSS)
*   แก้ไขผ่านคลาส Tailwind ในไฟล์ HTML ได้เลย
*   ถ้าต้องการ Global Style ให้แก้ที่ `public/css/styles.css` แล้วรัน `npm run build:css`

### หากต้องการเพิ่มฟังก์ชันใหม่ในหน้า Admin
1.  **HTML:** ก๊อปปี้โครงสร้างจากหน้าเดิม (ที่มี viewport 1024 และ admin-overlay)
2.  **JS:** สร้างไฟล์ใหม่ใน `public/js/admin/` โดยก๊อปปี้โครงสร้างจาก `admin-manage-movies.js` (ใช้ `UI.setLoading`, `UI.showToast` ให้เป็นมาตรฐาน)

---

## ✅ Checklist ก่อน Deploy (ผ่าน `Ship.bat`)

ก่อนรัน `Ship.bat` ทุกครั้ง:
1.  [ ] **Linting:** รัน `npm run lint` เพื่อเช็คความสะอาดของโค้ด (ห้ามมี Error/Warning)
2.  [ ] **Unit Testing:** รัน `npm test` เพื่อตรวจสอบ Logic หลักว่ายังทำงานได้ปกติ
3.  [ ] **Console Clean:** ตรวจสอบ Console ว่าไม่มี Error แดงๆ ขึ้นขณะรันเว็บ
4.  [ ] **Mobile View:** ลองเปิดหน้าแอดมินบนมือถือเพื่อดูว่า Layout ยังลอยอยู่เหมือน Desktop หรือไม่

---
*หากมีข้อสงสัยหรือติดขัด ให้ยึดตามโครงสร้างเดิมเป็นหลักเสมอ*
