import { auth, rtdb, rtdbRef, onValue, set, onDisconnect, rtdbTimestamp } from './firebase.js';

/**
 * 🟢 DUYดูDEE PRESENCE SERVICE
 * ระบบติดตามสถานะผู้ใช้แบบ Real-time โดยใช้ Realtime Database
 */
export const PresenceService = {
    /**
     * เริ่มติดตามสถานะออนไลน์ของผู้ใช้
     */
    init() {
        auth.onAuthStateChanged((user) => {
            if (user) {
                this.managePresence(user.uid);
            }
        });
    },

    /**
     * จัดการสถานะเชื่อมต่อและตัดการเชื่อมต่ออัตโนมัติ
     */
    managePresence(uid) {
        // อ้างอิง Path ใน RTDB: status/{uid}
        const userStatusRef = rtdbRef(rtdb, `status/${uid}`);

        // ตรวจสอบการเชื่อมต่อกับ Firebase Server (Special path: .info/connected)
        const connectedRef = rtdbRef(rtdb, '.info/connected');

        onValue(connectedRef, (snap) => {
            if (snap.val() === false) {
                return;
            }

            // เมื่อเชื่อมต่อสำเร็จ:
            // 1. ตั้งค่าสถานะเป็น online และบันทึกเวลาล่าสุด
            const onlineStatus = {
                state: 'online',
                last_changed: rtdbTimestamp(),
                email: auth.currentUser.email
            };

            // 2. ใช้ onDisconnect เพื่อสั่งให้ Server ลบข้อมูลทิ้งเมื่อเราตัดการเชื่อมต่อ (Offline)
            // วิธีนี้ประหยัดและแม่นยำกว่าการเช็ค Heartbeat ใน Firestore
            onDisconnect(userStatusRef).remove().then(() => {
                set(userStatusRef, onlineStatus);
            });
        });
    },

    /**
     * ฟังจำนวนผู้ใช้งานที่กำลังออนไลน์ (สำหรับหน้าแอดมิน)
     */
    listenToOnlineCount(callback) {
        const statusRef = rtdbRef(rtdb, 'status');
        return onValue(statusRef, (snapshot) => {
            const count = snapshot.numChildren() || 0;
            callback(count);
        });
    }
};
