---
name: security-auditor
description: ตรวจสอบความปลอดภัยของโปรเจกต์ DUYDODEE-HD ครอบคลุม Firestore Rules, CORS settings และการสแกนหา Secret/API Keys ที่อาจรั่วไหลในโค้ด
---

# Security Auditor (DUYDODEE-HD Edition)

Skill นี้ใช้สำหรับตรวจสอบความปลอดภัยก่อนการ Deploy หรือเมื่อมีการแก้ไขไฟล์ตั้งค่าระบบ

## Core Workflow
1. **Firestore Rules Audit:** ตรวจสอบ `firestore.rules` เพื่อป้องกันการเปิดสิทธิ์ write: if true หรือกฎที่หลวมเกินไป
2. **CORS Validation:** ตรวจสอบ `cors.json` ให้จำกัดเฉพาะ Domain ที่อนุญาตเท่านั้น
3. **Secret Scanning:** สแกนไฟล์ `.js`, `.html`, `.env` เพื่อหา API Keys หรือ Credentials ที่ไม่ได้ใช้ Environment Variables
4. **Firebase Config Check:** ตรวจสอบความถูกต้องของ Firebase configuration

## Security Checklist
อ้างอิงไฟล์ [references/security_checklist.md](references/security_checklist.md) สำหรับรายการตรวจสอบมาตรฐาน

## Automated Checks
เรียกใช้สคริปต์สแกนอัตโนมัติ:
- `python .skills/security-auditor/scripts/scan_secrets.py` (ถ้ามี)

## How to Trigger
- เมื่อผู้ใช้ถามว่า "ระบบปลอดภัยไหม?" หรือ "ตรวจช่องโหว่ให้หน่อย"
- ทำงานอัตโนมัติเป็นขั้นตอนแรกในกระบวนการตรวจสอบก่อน Ship
