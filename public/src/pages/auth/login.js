import { AuthService } from '../../services/auth-service.js';
import { UI } from '../../components/ui.js';
import { ValidationUtils } from '../../utils/validation-utils.js';
import { AccessibilityUtils } from '../../utils/accessibility-utils.js';
import { UIUXEnhancements } from '../../utils/uix-enhancements.js';

/**
 * 🔐 DUYDOODEE LOGIN ENGINE - MASTER EDITION (V2.1 Secure)
 */
document.addEventListener('DOMContentLoaded', () => {
    UI.injectStarfield();
    UI.initNavbar();

    // Initialize accessibility improvements
    AccessibilityUtils.init();

    // Initialize UI/UX enhancements
    UIUXEnhancements.init();

    const loginForm = document.getElementById('login-form');
    const googleBtn = document.getElementById('google-login-btn');

    if (loginForm) {
        loginForm.onsubmit = handleEmailLogin;
    }
    if (googleBtn) {
        googleBtn.onclick = handleGoogleLogin;
    }
});

async function handleEmailLogin(e) {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const pass = document.getElementById('password').value;

    // Validate email
    if (!email) {
        UI.showToast('กรุณากรอกอีเมล', 'error');
        if (window.announceToScreenReader) {
            window.announceToScreenReader('กรุณากรอกอีเมล');
        }
        return;
    }

    if (!ValidationUtils.isValidEmail(email)) {
        UI.showToast('รูปแบบอีเมลไม่ถูกต้อง', 'error');
        if (window.announceToScreenReader) {
            window.announceToScreenReader('รูปแบบอีเมลไม่ถูกต้อง');
        }
        return;
    }

    // Validate password
    if (!pass) {
        UI.showToast('กรุณากรอกรหัสผ่าน', 'error');
        if (window.announceToScreenReader) {
            window.announceToScreenReader('กรุณากรอกรหัสผ่าน');
        }
        return;
    }

    if (pass.length < 6) {
        UI.showToast('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร', 'error');
        if (window.announceToScreenReader) {
            window.announceToScreenReader('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
        }
        return;
    }

    UI.setLoading(true);

    try {
        const user = await AuthService.loginWithEmail(email, pass);
        await postLogin(user);
    } catch (error) {
        console.error('Email Login Error:', error);
        let msg = 'อีเมลหรือรหัสผ่านไม่ถูกต้อง';
        if (error.code === 'auth/user-not-found') {
            msg = 'ไม่พบผู้ใช้งานนี้';
        }
        if (error.code === 'auth/wrong-password') {
            msg = 'รหัสผ่านไม่ถูกต้อง';
        }
        UI.showToast(msg, 'error');
        UI.setLoading(false);
    }
}

async function handleGoogleLogin() {
    const btn = document.getElementById('google-login-btn');
    const originalContent = btn.innerHTML;

    UI.setLoading(true);
    btn.innerHTML = '<div class="flex items-center gap-3"><div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div><span>กำลังเชื่อมต่อ...</span></div>';
    btn.disabled = true;

    try {
        const user = await AuthService.loginWithGoogle();
        await postLogin(user);
        UI.setLoading(false);
    } catch (error) {
        console.error('🚨 Login Error:', error);
        if (error.code !== 'auth/popup-closed-by-user') {
            UI.showToast('เชื่อมต่อ Google ไม่สำเร็จ', 'error');
        }
        btn.innerHTML = originalContent;
        btn.disabled = false;
        UI.setLoading(false);
    }
}

async function postLogin(user) {
    // 📧 1. Check Email Verification (Optional but Recommended)
    if (user.providerId === 'password' && !user.emailVerified) {
        UI.showToast('กรุณายืนยันอีเมลของคุณก่อนเข้าใช้งาน', 'error');
        UI.setLoading(false);
        return;
    }

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
