# ⚡ QUICK-START - ทำทันที

> สิ่งที่ต้องทำทันทีเพื่อให้ความปลอดภัยสมบูรณ์

---

## 🔴 ขั้นตอนที่ 1: Revoke Firebase API Key (5 นาที)

### 1.1 เปิด Firebase Console
```
https://console.firebase.google.com
```

### 1.2 เลือก Project
- เลือก: **duydodeesport**

### 1.3 ไปที่ Settings
- คลิก **Settings** (⚙️) ด้านบน
- เลือก **General** แถบด้านซ้าย

### 1.4 ไปที่ Web App Config
- เลื่อนลงมาที่ **Your apps**
- คลิก Web app ของคุณ
- คลิก **Config** (⚙️ icon)

### 1.5 Regenerate API Key
- คลิก **Regenerate key**
- คอยให้ Firebase สร้าง key ใหม่
- **Copy API key ใหม่**

### 1.6 Update .env.local
1. เปิดไฟล: `.env.local` (ใน project root)
2. แก้บรรทัดนี้:
   ```
   VITE_FIREBASE_API_KEY=<ใส่ API key ใหม่ที่ copy มา>
   ```

### 1.7 Test
```bash
npm run dev
```
แล้วเปิด http://localhost:5173

---

## 🛡️ ขั้นตอนที่ 2: Enable GitHub Branch Protection (3 นาที)

### 2.1 เปิด GitHub Settings
```
https://github.com/classic1990/duydodee-premium-final/settings/branches
```

### 2.2 Add Branch Protection Rule
1. คลิก **Add rule**
2. ใน **Branch name pattern** ใส่: `main`
3. คลิก **Create**

### 2.3 เปิด Protection Rules
ติ๊กเหล่านี้:
- ✅ Require a pull request before merging
  - ☑️ Require at least one approving review: **1**
- ✅ Require branches to be up to date before merging
- ❌ Do not allow bypassing the above settings
- ☑️ Restrict who can push to this branch
  - เพิ่ม: `classic1990` (หรือ maintainer ของคุณ)
- ❌ Allow force pushes
- ❌ Allow deletions

### 2.4 Save
คลิก **Save changes** หรือ **Create**

---

## ✅ Checklist

เช็คหลังทำเสร็จ:

- [ ] API key revoked ใน Firebase Console
- [ ] API key ใหม่ generated
- [ ] .env.local อัพเดทด้วย key ใหม่
- [ ] `npm run dev` ทำงานได้
- [ ] สามารถ login ได้
- [ ] Branch protection เปิดบน GitHub
- [ ] Branch protection ทดสอบแล้ว

---

## 📝 หลังเสร็จแล้ว

### ลบไฟล security docs (Optional)
```bash
git rm SECURITY-URGENT.md SECURITY-SUMMARY.md BRANCH-PROTECTION.md
git commit -m "Remove temporary security documentation"
git push
```

### อ่านเอกสารหลัก
- `README.md` - ภาพรวมโปรเจค
- `AGENTS.md` - กฎ critical สำหรับ developers
- `SECURITY.md` - ไกด์ความปลอดภัยแบบละเอียด

---

## 🆘 ถ้ามีปัญหา

### Firebase Console เข้าไม่ได้
- ตรวจสอบการ login
- ตรวจสอบ project permissions

### API key ใหม่ ไม่ทำงาน
- ตรวจสอบว่า copy ถูกต้อง
- ตรวจสอบว่าไม่มี space เกิน
- ลอง restart dev server

### Branch protection ไม่พบ
- ตรวจสอบ GitHub permission
- ตรวจสอบว่าคุณเป็น owner

---

## 📞 ติดต่อ

ถ้าติดปัญหา:
- ดู: `SECURITY.md` (ไกด์ละเอียด)
- ดู: `BRANCH-PROTECTION.md` (ไกด์ GitHub)
- Email: support@duydodee.com

---

**เวลาที่ใช้:** ประมาณ 8-10 นาที
**ความยากง่าย:** ⭐⭐ (ง่าย)

**เริ่มเลย! 🚀**
