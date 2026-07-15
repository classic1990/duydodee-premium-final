import { AuthService } from '../services/auth-service.js';
import { logger } from '../utils/logger.js';

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
        return reject(new Error('Unauthorized: No session found.'));
      }

      try {
        const isAdmin = await AuthService.checkIsAdmin(user);
        if (!isAdmin) {
          logger.error('Auth Guard: Access Denied. User does not have administrative rights.', {
            userId: user.uid
          });
          window.location.href = '/';
          return reject(new Error('Access Denied: Administrative rights required.'));
        }
        resolve({ user, role: 'authorized' });
      } catch (err) {
        logger.error('Auth Guard Error', { error: err.message, userId: user?.uid });
        window.location.href = '/';
        reject(err);
      }
    });
  });
}
