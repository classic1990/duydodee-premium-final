# 📑 Project Specification: DUYดูDEE (Movie & Series Streaming Platform)

**Version:** 3.0.0 (Entertainment Edition)

**Tech Stack:** HTML5, Tailwind CSS, Vanilla JavaScript (ES6 Modules), Firebase v10+, YouTube Iframe API

---

## 1. การตั้งค่าระบบฐานข้อมูล (Backend & Database)

โปรเจคนี้ใช้ **Firebase** เป็นหัวใจหลักในการจัดการข้อมูลและ **YouTube** สำหรับการจัดเก็บวิดีโอ

### 🔑 1.1 การเชื่อมต่อ (Firebase Configuration)

ไฟล์: `public/js/firebase-config.js`

เชื่อมต่อกับโปรเจค `duydodeesport` บน Firebase:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyBZz2QI4hb2FAVjhhNCP8rARVo_zlv7_KA",
  authDomain: "duydodeesport.firebaseapp.com",
  projectId: "duydodeesport",
  storageBucket: "duydodeesport.firebasestorage.app",
  messagingSenderId: "435929814225",
  appId: "1:435929814225:web:81e149cfb597513040e1f0",
  measurementId: "G-7EC2RQZH22"
};
```

### 🗄️ 1.2 โครงสร้างคอลเลกชัน (Firestore Collections)

- **`movies`**: สำหรับภาพยนตร์ตอนเดียวจบ
  - `title` (String): ชื่อภาพยนตร์
  - `category` (String): หมวดหมู่ (Action, Drama, etc.)
  - `description` (String): เรื่องย่อ
  - `poster` (String): URL รูปหน้าปก (ดึงจาก YouTube Thumbnail)
  - `videoUrl` (String): URL สำหรับ Embed (YouTube)
  - `badge` (String): ป้ายกำกับ (New, 4K, HD)
  - `views` (Number): จำนวนการเข้าชม
  - `createdAt`, `updatedAt` (Timestamp)

- **`series`**: สำหรับซีรีส์หลายตอน
  - `title`, `category`, `description`, `poster`, `badge`, `views`, `createdAt`, `updatedAt` (เหมือน Movies)
  - `episodes` (Array of Objects):
    - `title` (String): ชื่อตอน (เช่น EP 1)
    - `videoUrl` (String): URL สำหรับ Embed (YouTube)

- **`users`**: ข้อมูลสมาชิกและระดับสิทธิ์
  - `uid`, `email`, `displayName`, `role` (super-admin, admin, member)

---

## 2. ระบบความปลอดภัย (Security Rules)

ไฟล์: `firestore.rules`

- **Master Admin:** UID `fpjTWGXIFCYZNWIubqhUGuSFvZk1` มีสิทธิ์สูงสุด
- **Public Read:** อนุญาตให้ทุกคนอ่านข้อมูล `movies` และ `series` ได้
- **Admin Write:** เฉพาะ Master หรือ Admin เท่านั้นที่เขียนข้อมูลได้

---

## 3. งานออกแบบและ UI (UI/UX Design Specs)

### 🎨 3.1 สีและฟอนต์ (Theming)

*   **Style:** Dark Mode (Netflix Style)
*   **Background:** Deep Obsidian (#0b0b0d)
*   **Primary Accent:** Electric Blue / Azure Gradient
*   **Typography:** Montserrat (Headings), Kanit (Thai Body)

### 📱 3.2 องค์ประกอบ (Components)

*   **Hero Slider:** แสดงเนื้อหาแนะนำขนาดใหญ่ที่หน้าแรก
*   **Horizontal Scroll Rows:** แสดงรายการหนัง/ซีรีส์แยกตามหมวดหมู่แบบเลื่อนด้านข้าง
*   **Watch Page:** หน้าเล่นวิดีโอพร้อม Episode Selector สำหรับซีรีส์ และระบบเพิ่มยอดวิวอัตโนมัติ

---

## 4. ระบบการทำงานหลัก (Logic & Functions)

### 🎥 4.1 YouTube Integration

*   ใช้ระบบดึง Video ID จาก URL เพื่อสร้าง Embed URL และ Thumbnail อัตโนมัติ
*   Thumbnail: `https://img.youtube.com/vi/VIDEO_ID/maxresdefault.jpg`
*   Embed: `https://www.youtube.com/embed/VIDEO_ID`

### 🏗️ 4.2 Admin Portal

*   **`admin-add-movie.html`**: ฟอร์มเพิ่มหนังพร้อมระบบตรวจจับลิงก์ YouTube
*   **`admin-add-series.html`**: ระบบสร้างรายการตอน (Episode Builder) แบบ Dynamic
*   **`admin-manage.html`**: แดชบอร์ดคุมยอดวิวและจัดการลบเนื้อหา

---

## 5. วิธีการติดตั้งและรันโปรเจค (Deployment)

*   **Command:** `Ship.bat` สำหรับการ Deploy อัตโนมัติ (Build CSS + Firebase Deploy)
*   **URL:** `https://duydodeesport.web.app`

---
**คำแนะนำ:** "ห้ามใช้ Firebase Storage สำหรับเก็บวิดีโอเพื่อรักษาการใช้งานใน Free Tier ให้เสถียรที่สุด ให้ใช้การฝากวิดีโอผ่าน YouTube 100%"
