import { AuthService } from '/js/services/auth-service.js';
import { UI } from '/js/components/ui.js';

/**
 * 🔐 DUYDOODEE LOGIN ENGINE - MASTER EDITION (V2.1 Secure)
 */
document.addEventListener('DOMContentLoaded', () => {
    UI.injectStarfield();
    UI.initNavbar();

    const loginForm = document.getElementById('login-form');
    const googleBtn = document.getElementById('google-login-btn');

    if (loginForm) loginForm.onsubmit = handleEmailLogin;
    if (googleBtn) googleBtn.onclick = handleGoogleLogin;
});

async function handleEmailLogin(e) {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const pass = document.getElementById('password').value;

    if (!email || !pass) return UI.showToast('กรุณากรอกอีเมลและรหัสผ่าน', 'error');

    UI.setLoading(true);

    try {
        const user = await AuthService.loginWithEmail(email, pass);
        await postLogin(user);
    } catch (error) {
        console.error('Email Login Error:', error);
        let msg = 'อีเมลหรือรหัสผ่านไม่ถูกต้อง';
        if (error.code === 'auth/user-not-found') msg = 'ไม่พบผู้ใช้งานนี้';
        if (error.code === 'auth/wrong-password') msg = 'รหัสผ่านไม่ถูกต้อง';
        UI.showToast(msg, 'error');
        UI.setLoading(false);
    }
}

async function handleGoogleLogin() {
    const btn = document.getElementById('google-login-btn');
    const originalContent = btn.innerHTML;

    btn.innerHTML = '<div class="flex items-center gap-3"><div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div><span>กำลังเชื่อมต่อ...</span></div>';
    btn.disabled = true;

    try {
        const user = await AuthService.loginWithGoogle();
        await postLogin(user);
    } catch (error) {
        console.error('🚨 Login Error:', error);
        if (error.code !== 'auth/popup-closed-by-user') {
            UI.showToast('เชื่อมต่อ Google ไม่สำเร็จ', 'error');
        }
        btn.innerHTML = originalContent;
        btn.disabled = false;
    }
}

async function postLogin(user) {
    // Check if user is Banned
    const isBanned = await AuthService.isUserBanned(user.uid);
    if (isBanned) {
        await AuthService.logout();
        UI.showToast('บัญชีของคุณถูกระงับการใช้งาน โปรดติดต่อเจ้าหน้าที่', 'error');
        UI.setLoading(false);
        return;
    }

    const isAdmin = await AuthService.checkIsAdmin(user);

    if (isAdmin) {
        UI.showToast('ยินดีต้อนรับท่านผู้ดูแลระบบ!', 'success');
        setTimeout(() => window.location.href = '/admin/admin-manage.html', 1200);
    } else {
        UI.showToast(`ยินดีต้อนรับคุณ ${user.displayName || 'Member'}`, 'success');
        setTimeout(() => window.location.href = '/', 1200);
    }
}
