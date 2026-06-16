# ✅ CHECKLIST - สิ่งที่ต้องทำ

> Checklist สั้นๆ เพื่อให้แน่ใจว่าทุกอย่างเสร็จ

---

## 🔴 CRITICAL - ต้องทำทันที

- [ ] **Revoke Firebase API Key**
  - [ ] เปิด Firebase Console
  - [ ] Regenerate API key
  - [ ] Copy API key ใหม่
  - [ ] Update `.env.local`
  - [ ] Test `npm run dev`

---

## 🛡️ RECOMMENDED - แนะนำ

- [ ] **Enable GitHub Branch Protection**
  - [ ] เปิด GitHub Settings → Branches
  - [ ] Add protection rule for `main`
  - [ ] Require PR and review
  - [ ] Restrict pushes to maintainers
  - [ ] Disable force push

---

## 📋 AFTER COMPLETION

- [ ] ทดสอบ login ได้
- [ ] ทดสอบ Firebase operations ได้
- [ ] Branch protection ทดสอบแล้ว
- [x] อ่าน README.md
- [x] อ่าน AGENTS.md (ถ้าจะเขียนโค้ด)

---

## 🧹 CLEANUP (Optional)

- [x] ลบ `SECURITY-URGENT.md`
- [x] ลบ `SECURITY-SUMMARY.md`
- [x] ลบ `BRANCH-PROTECTION.md`
- [x] Commit แล push

---

**Status (Updated: 2026-06-14):**
- 🔴 Critical: 0/5 เสร็จ (รอ Manual Action)
- 🛡️ Recommended: 0/5 เสร็จ (รอ Manual Action)
- 📋 After: 2/5 เสร็จ
- 🧹 Cleanup: 4/4 เสร็จ ✅
