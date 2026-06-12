import { AuthService } from '../services/auth-service.js';

export function checkAdminAccess() {
    return new Promise((resolve, reject) => {
        const unsubscribe = AuthService.onStateChanged(async (user) => {
            unsubscribe(); // Clean up state change listener
            if (!user) {
                reject('Unauthorized');
                return;
            }
            try {
                const isAdmin = await AuthService.checkIsAdmin(user);
                if (!isAdmin) {
                    reject('Access Denied');
                } else {
                    resolve({ user });
                }
            } catch (err) {
                reject('Access Denied');
            }
        });
    });
}
