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
- [ ] อ่าน README.md
- [ ] อ่าน AGENTS.md (ถ้าจะเขียนโค้ด)

---

## 🧹 CLEANUP (Optional)

- [ ] ลบ `SECURITY-URGENT.md`
- [ ] ลบ `SECURITY-SUMMARY.md`
- [ ] ลบ `BRANCH-PROTECTION.md`
- [ ] Commit แล push

---

**Status:**
- 🔴 Critical: 0/5 เสร็จ
- 🛡️ Recommended: 0/5 เสร็จ
- 📋 After: 0/5 เสร็จ
