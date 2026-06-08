import { AuthService } from '../services/auth-service.js';

/**
 * 🛡️ DUYดูDEE - MASTER AUTH GUARD (V6.0)
 * ระบบรักษาความปลอดภัยขั้นสูง ตรวจสอบสิทธิ์แบบเรียลไทม์
 */
export async function checkAdminAccess() {
    return new Promise((resolve, reject) => {
        const unsubscribe = AuthService.onStateChanged(async (user) => {
            unsubscribe(); 
            if (!user) {
                window.location.href = '/login.html';
                return reject('Unauthorized: No session found.');
            }

            try {
                const isAdmin = await AuthService.checkIsAdmin(user);
                if (!isAdmin) {
                    console.error('Auth Guard: Access Denied. User does not have administrative rights.');
                    window.location.href = '/';
                    return reject('Access Denied: Administrative rights required.');
                }
                resolve({ user, role: 'authorized' });
            } catch (err) {
                console.error('Auth Guard Error:', err);
                window.location.href = '/';
                reject(err);
            }
        });
    });
}



