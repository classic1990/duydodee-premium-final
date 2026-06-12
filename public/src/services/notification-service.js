import { messaging, getToken, onMessage, db, doc, updateDoc, SCHEMA, auth } from './firebase.js';
import { UI } from '../components/ui.js';

export const NotificationService = {
    // 🔑 VAPID Key ได้จาก Firebase Console -> Project Settings -> Cloud Messaging
    VAPID_KEY: 'YOUR_PUBLIC_VAPID_KEY_HERE',

    requestPermission: async () => {
        try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                const token = await getToken(messaging, { vapidKey: NotificationService.VAPID_KEY });
                if (token && auth.currentUser) {
                    // เก็บ Token ลงในข้อมูลผู้ใช้
                    await updateDoc(doc(db, SCHEMA.COLLECTIONS.USERS, auth.currentUser.uid), {
                        fcmToken: token,
                        notificationsEnabled: true
                    });
                    return true;
                }
            }
            return false;
        } catch (error) {
            console.error('Notification Error:', error);
            return false;
        }
    },

    initForegroundListener: () => {
        onMessage(messaging, (payload) => {
            console.log('Message received. ', payload);
            UI.showToast(payload.notification.body, 'info', payload.notification.title);
        });
    },

    checkStatus: async (uid) => {
        try {
            // ตรวจสอบว่า Browser รองรับหรือไม่
            if (!('Notification' in window)) return 'unsupported';

            if (Notification.permission === 'granted') return 'enabled';
            if (Notification.permission === 'denied') return 'disabled';
            return 'default';
        } catch (err) {
            return 'error';
        }
    }
};

window.NotificationService = NotificationService;