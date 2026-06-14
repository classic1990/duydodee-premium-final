import { AuthService } from '../services/auth-service.js';
import errorHandler from '../utils/error-handler.js';

/**
 * 🛡️ DUYดูDEE - MASTER AUTH GUARD (V6.0)
 * ระบบรักษาความปลอดภัยขั้นสูง ตรวจสอบสิทธิ์แบบเรียลไทม์
 * 🔒 SECURITY: Only Google login is allowed for admin access
 */
export async function checkAdminAccess() {
    return new Promise((resolve, reject) => {
        // Wait for auth to initialize if necessary
        const unsubscribe = AuthService.onStateChanged(async (user) => {
            if (user === null) {
                // If still null, wait briefly in case it's just initializing
                await new Promise(r => setTimeout(r, 500));
            }

            if (!AuthService.auth.currentUser) {
                unsubscribe();
                window.location.href = '/login.html';
                return reject('Unauthorized: No session found.');
            }

            unsubscribe();
            const currentUser = AuthService.auth.currentUser;

            try {
                const isAdmin = await AuthService.checkIsAdmin(currentUser);
                if (!isAdmin) {
                    // Check if it's because of non-Google login
                    if (!AuthService.isGoogleUser(currentUser)) {
                        errorHandler.logError({
                            type: 'security',
                            message: 'Non-Google login attempt for admin access'
                        });
                        // eslint-disable-next-line no-alert
                        alert('🔒 ระบบความปลอดภัย: การเข้าถึงหน้าแอดมินต้องล็อกอินด้วย Google Account เท่านั้น\n\nกรุณาล็อกอินด้วย Google Account ที่ลงทะเบียนไว้เท่านั้น');
                    } else {
                        errorHandler.logError({
                            type: 'auth',
                            message: 'Access Denied: Administrative rights required.'
                        });
                        // eslint-disable-next-line no-alert
                        alert('❌ ไม่มีสิทธิ์เข้าถึงหน้าแอดมิน\n\nอีเมลของคุณไม่อยู่ในรายชื่อผู้ดูแลระบบ');
                    }
                    window.location.href = '/';
                    return reject('Access Denied: Administrative rights required.');
                }
                resolve({ user: currentUser, role: 'authorized' });
            } catch (err) {
                errorHandler.logError({ type: 'error', message: 'Auth Guard Error', stack: err.stack });
                window.location.href = '/';
                reject(err);
            }
        });
    });
}

