/**
 * 🛡️ DUYดูDEE - ADMIN RECOVERY SYSTEM (Final Correction)
 * บัญชีเป้าหมาย: duyclassic191@gmail.com
 * สิทธิ์ที่ถูกต้อง: super-admin (ตาม constants.js)
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'serviceAccountKey.json');

if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
    console.error('\n❌ [ERROR] ไม่พบไฟล์ serviceAccountKey.json');
    console.log('กรุณานำไฟล์กุญแจ Admin มาวางที่: ' + SERVICE_ACCOUNT_PATH + ' แล้วรันใหม่อีกครั้ง');
    process.exit(1);
}

const serviceAccount = require(SERVICE_ACCOUNT_PATH);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const targetEmail = 'duyclassic191@gmail.com';

async function restoreAdmin() {
    console.log(`\n🚀 กำลังปรับปรุงสิทธิ์ให้ถูกต้องสำหรับ: ${targetEmail}...`);

    try {
        const userRecord = await admin.auth().getUserByEmail(targetEmail);
        const uid = userRecord.uid;

        // อัปเดตสิทธิ์เป็น super-admin (เพื่อให้ตรงกับ SCHEMA.ROLES.MASTER ใน constants.js)
        await db.collection('users').doc(uid).set({
            role: 'super-admin', 
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        console.log('✅ อัปเดตบทบาทใน Firestore เป็น "super-admin" เรียบร้อยแล้ว');

        // ตั้ง Custom Claims
        await admin.auth().setCustomUserClaims(uid, { admin: true, master: true });
        console.log('✅ อัปเดตระบบรักษาความปลอดภัย (Custom Claims) เรียบร้อยแล้ว');

        console.log('\n============================================================');
        console.log('🎉 เสร็จสิ้น! ตอนนี้สิทธิ์ของคุณตรงกับระบบแอดมินแล้ว');
        console.log('1. กรุณารัน .\\Ship.bat อีกรอบ (เพื่อให้ไฟล์ auth-service.js ตัวใหม่ขึ้นระบบ)');
        console.log('2. จากนั้น Logout และ Login บนหน้าเว็บอีกครั้ง');
        console.log('============================================================\n');

    } catch (error) {
        console.error('\n❌ เกิดข้อผิดพลาด:', error.message);
    }
}

restoreAdmin();
