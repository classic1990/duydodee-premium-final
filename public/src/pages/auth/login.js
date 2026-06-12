import { AuthService } from '/src/services/auth-service.js';
import { UI } from '/src/components/ui.js';

/**
 * 🔐 DUYดูDEE LOGIN LOGIC
 * Master Edition - Clean & Secure
 */
document.addEventListener('DOMContentLoaded', () => {
    UI.injectStarfield();

    const loginForm = document.getElementById('login-form');
    const googleBtn = document.getElementById('google-login-btn');
    const passwordInput = document.getElementById('password');
    const togglePasswordBtn = document.getElementById('toggle-password');

    if (loginForm) loginForm.onsubmit = handleEmailLogin;
    if (googleBtn) googleBtn.onclick = handleGoogleLogin;
    if (togglePasswordBtn) {
        togglePasswordBtn.onclick = () => {
            const isPassword = passwordInput.type === 'password';
            passwordInput.type = isPassword ? 'text' : 'password';
            // Assuming lucide icons are initialized globally, 
            // the icon change might need a redraw or we just change the data-lucide attribute
            const icon = togglePasswordBtn.querySelector('i');
            icon.setAttribute('data-lucide', isPassword ? 'eye-off' : 'eye');
            lucide.createIcons(); // Re-initialize icons
        };
    }
});

async function handleEmailLogin(e) {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!email || !password) return UI.showToast('กรุณากรอกข้อมูลให้ครบถ้วน', 'error');

    try {
        const user = await AuthService.loginWithEmail(email, password);
        UI.showToast(`ยินดีต้อนรับคุณ ${user.displayName || 'Member'}`, 'success');
        setTimeout(() => window.location.href = '/', 1200);
    } catch (err) {
        console.error('Login Error:', err);
        UI.showToast('อีเมลหรือรหัสผ่านไม่ถูกต้อง', 'error');
    }
}

async function handleGoogleLogin() {
    try {
        const user = await AuthService.loginWithGoogle();
        UI.showToast(`ยินดีต้อนรับคุณ ${user.displayName || 'Member'}`, 'success');
        setTimeout(() => window.location.href = '/', 1200);
    } catch (err) {
        console.error('Google Login Error:', err);
        if (err.code !== 'auth/popup-closed-by-user') {
            UI.showToast('ไม่สามารถเข้าสู่ระบบด้วย Google ได้', 'error');
        }
    }
}
