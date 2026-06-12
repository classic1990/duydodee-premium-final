import { db, collection, getDocs, updateDoc, doc, SCHEMA } from '/src/services/firebase.js';

/**
 * 🛠️ Data Migration Utility - data-migration.js
 * 
 * คำแนะนำ: คุณสามารถเรียกใช้งานฟังก์ชัน migrateThaiToEnglishFields() 
 * จาก Console ของ Browser ในหน้า Admin เพื่อทำการย้ายข้อมูลจากฟิลด์ภาษาไทย
 * ('ชื่อ', 'โปสเตอร์') ไปยังฟิลด์ภาษาอังกฤษ ('title', 'poster')
 */

export const migrateThaiToEnglishFields = async () => {
    const collections = [SCHEMA.COLLECTIONS.MOVIES, SCHEMA.COLLECTIONS.SERIES];
    let totalUpdated = 0;

    console.log('🚀 เริ่มต้นการย้ายข้อมูล (Migration)...');

    for (const colName of collections) {
        console.log(`กำลังตรวจสอบ Collection: ${colName}`);
        const snap = await getDocs(collection(db, colName));

        for (const d of snap.docs) {
            const data = d.data();
            const updates = {};

            // ตรวจสอบและย้าย 'ชื่อ' -> 'title'
            if (data['ชื่อ'] && !data.title) updates.title = data['ชื่อ'];
            // ตรวจสอบและย้าย 'โปสเตอร์' -> 'poster'
            if (data['โปสเตอร์'] && !data.poster) updates.poster = data['โปสเตอร์'];

            if (Object.keys(updates).length > 0) {
                await updateDoc(doc(db, colName, d.id), updates);
                totalUpdated++;
                console.log(`✅ อัปเดตเอกสาร [${d.id}] ใน ${colName} เรียบร้อย`);
            }
        }
    }

    console.log(`🏁 การย้ายข้อมูลเสร็จสิ้น! อัปเดตไปทั้งหมด: ${totalUpdated} รายการ`);
    return totalUpdated;
};

// ส่งออกไปยัง window เพื่อให้เรียกใช้จาก Console ได้ง่าย (สำหรับทดสอบ)
window.runDuyDoDeeMigration = migrateThaiToEnglishFields;