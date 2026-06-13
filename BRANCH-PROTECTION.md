# 🛡️ GitHub Branch Protection Guide

> ไกด์การตั้งค่า GitHub Branch Protection สำหรับโปรเจค DUYดูDEE PREMIUM

---

## 📋 Overview

Branch Protection ช่วยป้องกัน:
- ❌ Direct push ไป main branch
- ✅ บังคับใช้ Pull Request
- ✅ บังคับ Code Review
- ✅ บังคับให้ tests/lint ผ่าน
- ✅ ป้องกัน history rewrite

---

## 🚀 Step-by-Step Setup

### 1. เข้า Repository Settings

1. เข้า GitHub Repository: https://github.com/classic1990/duydodee-premium-final
2. คลิก **Settings** ⚙️ (ด้านบน)
3. เลือก **Branches** ในเมนูด้านซ้าย

### 2. Add Branch Protection Rule

1. คลิก **Add branch protection rule** หรือ **Edit** ถ้ามีอยู่แล้ว
2. ในช่อง **Branch name pattern** ใส่: `main`
3. คลิก **Create** หรือ **Update**

### 3. เปิดการใช้งาน Protection Rules

ตั้งค่าดังนี้:

#### ✅ Require pull request before merging

- ☑️ Require at least one approving review
  - ตั้ง Reviewers: **1** (หรือมากขึ้นถ้ามีทีม)
- ☑️ Dismiss stale PR approvals when new commits are pushed
- ☑️ Require review from CODEOWNERS (ถ้ามี CODEOWNERS)
- ❌ Require approvals from code owners

#### ✅ Require status checks to pass before merging

- ☑️ Require branches to be up to date before merging

#### ✅ Require branches to be up to date before merging

- ☑️ Require branches to be up to date before merging

#### ❌ Do not allow bypassing the above settings

- ☑️ ตั้งให้ Admins ก็ต้องทำตาม rules เหมือนกัน

#### 🛡️ Restrict who can push to matching branches

- ☑️ **Restrict who can push to this branch**
- เพิ่ม maintainers/main developers เท่านั้น:
  - classic1990 (owner)
  - เพิ่ม developers อื่นๆ ถ้ามี

#### ❌ Allow force pushes

- ❌ **ไม่เปิด** - ห้าม force push เพื่อป้องกัน history rewrite
- ☑️ Allow force pushes for maintainers (แต่ไม่แนะนำ)

#### ❌ Allow deletions

- ❌ **ไม่เปิด** - ห้ามลบ main branch

---

## 📊 Branch Protection Configuration Summary

```
✅ Require pull request before merging
   ✅ Require at least one approving review (1 reviewer)
   ✅ Dismiss stale PR approvals
   ✅ Require branches to be up to date before merging

✅ Require status checks to pass before merging
   ✅ Require branches to be up to date before merging

❌ Do not allow bypassing the above settings
   ✅ Restrict who can push (maintainers only)

❌ Allow force pushes (DISABLED)
❌ Allow deletions (DISABLED)
```

---

## 🔄 Workflow หลังตั้งค่า

### สำหรับ Developer:

1. **Create Feature Branch:**
   ```bash
   git checkout -b feature/new-feature
   ```

2. **Work on Feature:**
   - เขียนโค้ด
   - Commit changes
   - Push to feature branch

3. **Create Pull Request:**
   - Push ไป remote
   - สร้าง PR บน GitHub
   - Request review

4. **Code Review:**
   - Reviewer ตรวจโค้ด
   - Approve หรือ request changes

5. **Resolve Checks:**
   - Lint checks ผ่าน
   - Build checks ผ่าน
   - Update branch ถ้า outdated

6. **Merge:**
   - ผู้ review approve
   - Merge to main
   - Delete feature branch

### สำหรง Maintainer (ผู้มีสิทธิเขียน main):

1. **Same as developer** - ต้องสร้าง PR เช่นกัน
2. **Can bypass** - ถ้าตั้งให้ allow bypassing (ไม่แนะนำ)

---

## 🛑 สิ่งที่ Branch Protection ป้องกัน

### ❌ ถ้าพยายาม Push Direct ไป Main:

```bash
git checkout main
git add .
git commit -m "Update"
git push origin main
```

**Result:**
```
remote: error: GH006: Protected branch update failed for refs/heads/main.
remote: error: At least 1 approving review is required by reviewers with write access.
To https://github.com/classic1990/duydodee-premium-final.git
 ! [rejected] main -> main (protected branch hook declined)
```

### ❌ ถ้าพยายาม Force Push:

```bash
git push origin main --force
```

**Result:**
```
remote: error: GH003: Protected branch update failed for refs/heads/main.
remote: error: Force pushing to protected branches is not allowed.
To https://github.com/classic1990/duydodee-premium-final.git
 ! [rejected] main -> main (protected branch force push declined)
```

### ❌ ถ้าพยายามลบ Branch:

```bash
git branch -D main
git push origin --delete main
```

**Result:**
```
remote: error: GH006: Protected branch update failed for refs/heads/main.
remote: error: Cannot delete protected branch 'main'.
To https://github.com/classic1990/duydodee-premium-final.git
 ! [rejected] main -> main (protected branch hook declined)
```

---

## ✅ ทดสอบ Branch Protection

หลังจากตั้งค่า ให้ทดสอบ:

### Test 1: Direct Push (ควรถูกบล็อค)

```bash
# สร้าง branch อื่นก่อน
git checkout -b test-push
git commit --allow-empty -m "Test"
git push origin test-push

# พยายาม push direct ไป main (ควร fail)
git checkout main
git merge test-push
git push origin main
```

**Expected:** ❌ ถูกบล็อค - "Protected branch update failed"

### Test 2: Force Push (ควรถูกบล็อค)

```bash
git push origin test-push --force
```

**Expected:** ❌ ถูกบล็อค - "Force pushing to protected branches is not allowed"

### Test 3: Create PR (ควรทำได้)

```bash
# สร้าง PR บน GitHub
# Request review
# Merge เมื่อได้ approval
```

**Expected:** ✅ ทำได้ - เมื่อมี approval แล checks ผ่าน

---

## 📝 Additional Recommendations

### 1. CODEOWNERS (Optional)

สร้างไฟล `.github/CODEOWNERS`:

```
# Default code owner
* @classic1990

# Admin code owner
admin/* @classic1990

# Security code owner
*.{md,js} @classic1990
```

### 2. Require Status Checks (Optional)

ถ้ามี CI/CD:
- เพิ่ม status checks ที่จำเป็น:
  - lint
  - build
  - test (ถ้ามี)
- Branch protection จะรอให้ checks เหล่านี้ผ่านก่อน merge

### 3. Require Conversation Resolution (Optional)

- ☑️ Require conversation resolution before merging
- บังคับให้ resolve ทุก comments/discussions ก่อน merge

---

## 🔍 Troubleshooting

### Issue: ไม่เห็น Branch Protection Settings

**Solution:**
- เช็คว่าคุณเป็น repository owner หรือมี admin permission
- Contact repository owner ถ้าไม่มี permission

### Issue: Rules ไม่ทำงาน

**Solution:**
- เช็คว่า pattern `main` ตรงกับ branch name
- เช็คว่า enabled เท่านั้น (ไม่ใช่ disabled)

### Issue: ไม่สามารถสร้าง PR

**Solution:**
- ตรวจสอบว่า branch ไม่ได้ถูก protected ไว้
- เช็คว่าคุณมี write permission

---

## 📚 Best Practices

✅ **DO:**
- เปิด branch protection สำหรับ main branch
- บังคับใช้ PR แล review
- จำกัดผู้ที่สามารถ push ได้
- ปิด force push แล deletions
- ตั้งค่า status checks ถ้ามี CI/CD

❌ **DON'T:**
- ปิด branch protection
- อนุญาตให้ bypass rules
- เปิด force push
- อนุญาตให้ลบ main branch
- อนุญาตให้ทุกคน push ไป main

---

## 🎯 Quick Reference

**Repository:** https://github.com/classic1990/duydodee-premium-final
**Settings:** Settings → Branches → main
**Required:** Pull request, 1 reviewer, up-to-date
**Restricted:** Maintainers only
**Force push:** Disabled
**Deletion:** Disabled

---

**Last Updated:** 2026-01-XX
