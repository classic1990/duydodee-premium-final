import { AuthService } from '../../services/auth-service.js';
import { UI } from '../../components/ui.js';
import { ValidationUtils } from '../../utils/validation-utils.js';
import { AccessibilityUtils } from '../../utils/accessibility-utils.js';

/**
 * 📝 DUYดูDEE REGISTER ENGINE (V2.2 - Security & Social Edition)
 */
document.addEventListener('DOMContentLoaded', () => {
    UI.injectStarfield();
    UI.initNavbar();

    // Initialize accessibility improvements
    AccessibilityUtils.init();

    const regForm = document.getElementById('register-form');
    const googleBtn = document.getElementById('google-register-btn');

    if (regForm) {
        regForm.onsubmit = handleEmailRegister;
    }
    if (googleBtn) {
        googleBtn.onclick = handleGoogleRegister;
    }
});

async function handleEmailRegister(e) {
    e.preventDefault();

    const nameInput = document.getElementById('display-name');
    const emailInput = document.getElementById('email');
    const passInput = document.getElementById('password');
    const confirmPassInput = document.getElementById('confirm-password');
    const submitBtn = e.target.querySelector('button[type="submit"]');

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const pass = passInput.value;
    const confirmPass = confirmPassInput.value;

    // 🛡️ Enhanced Validation
    if (!ValidationUtils.isValidName(name)) {
        UI.showToast('ชื่อต้องมีอย่างน้อย 2 ตัวอักษร', 'error');
        if (window.announceToScreenReader) {
            window.announceToScreenReader('ชื่อต้องมีอย่างน้อย 2 ตัวอักษร');
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

    if (!ValidationUtils.isValidPassword(pass)) {
        const strengthInfo = ValidationUtils.getPasswordStrength(pass);
        const errorMessages = strengthInfo.errors.length > 0
            ? strengthInfo.errors.join(', ')
            : 'รหัสผ่านไม่ปลอดภัยเพียงพอ';
        UI.showToast(errorMessages, 'error');
        if (window.announceToScreenReader) {
            window.announceToScreenReader(errorMessages);
        }
        return;
    }

    if (pass !== confirmPass) {
        UI.showToast('รหัสผ่านไม่ตรงกัน กรุณาตรวจสอบอีกครั้ง', 'error');
        if (window.announceToScreenReader) {
            window.announceToScreenReader('รหัสผ่านไม่ตรงกัน กรุณาตรวจสอบอีกครั้ง');
        }
        return;
    }

    UI.setLoading(true);
    if (submitBtn) {
        submitBtn.disabled = true;
    }

    try {
        await AuthService.registerWithEmail(name, email, pass);
        UI.showToast('สมัครสมาชิกสำเร็จ! กรุณาตรวจสอบอีเมลเพื่อยืนยันตัวตน', 'success');
        setTimeout(() => window.location.href = '/', 1500);
    } catch (error) {
        console.error('Register Error:', error);
        let msg = 'ระบบลงทะเบียนขัดข้อง';
        if (error.code === 'auth/email-already-in-use') {
            msg = 'อีเมลนี้ถูกใช้งานในระบบแล้ว';
        }
        if (error.code === 'auth/invalid-email') {
            msg = 'รูปแบบอีเมลไม่ถูกต้อง';
        }
        if (error.code === 'auth/weak-password') {
            msg = 'รหัสผ่านไม่ปลอดภัยเพียงพอ';
        }

        UI.showToast(msg, 'error');

        if (submitBtn) {
            submitBtn.disabled = false;
        }
    } finally {
        UI.setLoading(false);
    }
}

async function handleGoogleRegister() {
    try {
        await AuthService.loginWithGoogle();
        UI.showToast('ลงทะเบียนด้วย Google สำเร็จ!', 'success');
        setTimeout(() => window.location.href = '/', 1500);
    } catch (error) {
        console.error('Google Register Error:', error);
        if (error.code !== 'auth/popup-closed-by-user') {
            UI.showToast('เชื่อมต่อ Google ไม่สำเร็จ', 'error');
        }
    }
}
