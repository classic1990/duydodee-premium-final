import { AuthService } from '/js/services/auth-service.js';
import { UI } from '/js/components/ui.js';

/**
 * 📝 DUYดูDEE REGISTER ENGINE (V2.2 - Security & Social Edition)
 */
document.addEventListener('DOMContentLoaded', () => {
    UI.injectStarfield();
    UI.initNavbar();

    const regForm = document.getElementById('register-form');
    const googleBtn = document.getElementById('google-register-btn');

    if (regForm) regForm.onsubmit = handleEmailRegister;
    if (googleBtn) googleBtn.onclick = handleGoogleRegister;
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

    // 🛡️ Validation
    if (!name) return UI.showToast('กรุณากรอกชื่อที่ใช้แสดง', 'error');
    if (pass.length < 6) return UI.showToast('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร', 'error');
    if (pass !== confirmPass) return UI.showToast('รหัสผ่านไม่ตรงกัน กรุณาตรวจสอบอีกครั้ง', 'error');

    // UI Feedback
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i data-lucide="loader-2" class="w-5 h-5 animate-spin mx-auto"></i>';
    UI.refreshIcons();

    try {
        await AuthService.registerWithEmail(name, email, pass);
        UI.showToast('สมัครสมาชิกสำเร็จ! ยินดีต้อนรับ', 'success');
        setTimeout(() => window.location.href = '/', 1500);
    } catch (error) {
        console.error('Register Error:', error);
        let msg = 'ระบบลงทะเบียนขัดข้อง';
        if (error.code === 'auth/email-already-in-use') msg = 'อีเมลนี้ถูกใช้งานในระบบแล้ว';
        if (error.code === 'auth/invalid-email') msg = 'รูปแบบอีเมลไม่ถูกต้อง';
        if (error.code === 'auth/weak-password') msg = 'รหัสผ่านไม่ปลอดภัยเพียงพอ';
        
        UI.showToast(msg, 'error');
        
        // Reset Button
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
        UI.refreshIcons();
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
