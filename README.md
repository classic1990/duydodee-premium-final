# DUYดูDEE PREMIUM

แพลตฟอร์มบริหารจัดการทรัพยากรกราฟิกฟุตบอลระดับพรีเมียม (Cinematic Sport Edition)

## Features
- ระบบจัดการสตรีมมิ่ง 4K HDR
- ระบบ Admin Dashboard สำหรับจัดการเนื้อหา
- ระบบประวัติการรับชมและ VIP Membership

## Quick Start
1. ติดตั้ง Dependencies:
   ```bash
   npm install
   ```
2. ตั้งค่าไฟล์ `.env` (คัดลอกจาก `.env.example`)
3. รันโปรเจกต์:
   ```bash
   npm run dev
   ```
4. Deployment:
   ```bash
   .\deploy.bat
   ```

## Security
- ระบบสิทธิ์ Admin ผ่าน Firebase Rules
- ข้อมูลสำคัญถูกเก็บไว้ใน Environment Variables (ไม่ถูก Commit ลง Git)
