import { AuthService } from '../../services/auth-service.js';
import { UI } from '../../components/ui.js';

document.addEventListener('DOMContentLoaded', () => {
    UI.injectStarfield();
    const registerForm = document.getElementById('register-form');
    const googleBtn = document.getElementById('google-login-btn');
    if (registerForm) registerForm.onsubmit = handleRegister;
    if (googleBtn) googleBtn.onclick = handleGoogleLogin;
});

async function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    if (!name || !email || !password) return UI.showToast('กรุณากรอกข้อมูลให้ครบถ้วน', 'error');
    try {
        await AuthService.registerWithEmail(name, email, password);
        UI.showToast('ลงทะเบียนสำเร็จ!', 'success');
        setTimeout(() => window.location.href = '/login.html', 2000);
    } catch (err) {
        UI.showToast('ไม่สามารถลงทะเบียนได้', 'error');
    }
}

async function handleGoogleLogin() {
    try {
        const user = await AuthService.loginWithGoogle();
        UI.showToast(`ยินดีต้อนรับคุณ ${user.displayName || 'Member'}`, 'success');
        setTimeout(() => window.location.href = '/', 1200);
    } catch (err) {
        UI.showToast('ไม่สามารถสมัครด้วย Google ได้', 'error');
    }
}
