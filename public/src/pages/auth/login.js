import { AuthService } from '../../services/auth-service.js';
import { UI } from '../../components/ui.js';
import { BaseController } from '../../components/base-controller.js';

class LoginController extends BaseController {
  setupForm() {
    const form = document.getElementById('login-form');
    const googleBtn = document.getElementById('google-login-btn');
    form?.addEventListener('submit', (e) => this.handleEmailLogin(e));
    googleBtn?.addEventListener('click', () => this.handleGoogleLogin(googleBtn));
  }

  async handleEmailLogin(e) {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const pass = document.getElementById('password').value;
    if (!email || !pass) {
      return UI.showToast('กรุณากรอกข้อมูลให้ครบ', 'error');
    }
    UI.setLoading(true);
    try {
      await this.postLogin(await AuthService.loginWithEmail(email, pass));
    } catch (error) {
      UI.showToast(
        error.code === 'auth/wrong-password' ? 'รหัสผ่านไม่ถูกต้อง' : 'ล็อกอินล้มเหลว',
        'error'
      );
      UI.setLoading(false);
    }
  }

  async handleGoogleLogin(btn) {
    const original = btn.innerHTML;
    btn.innerHTML = '<span>กำลังเชื่อมต่อ...</span>';
    btn.disabled = true;
    try {
      await this.postLogin(await AuthService.loginWithGoogle());
    } catch (error) {
      UI.showToast('เชื่อมต่อ Google ไม่สำเร็จ', 'error');
      btn.innerHTML = original;
      btn.disabled = false;
    }
  }

  async postLogin(user) {
    if (await AuthService.isUserBanned(user.uid)) {
      await AuthService.logout();
      UI.showToast('บัญชีของคุณถูกระงับ', 'error');
      UI.setLoading(false);
      return;
    }
    UI.showToast('ยินดีต้อนรับ!', 'success');
    const isAdmin = await AuthService.checkIsAdmin(user);
    setTimeout(() => (window.location.href = isAdmin ? '/admin/admin-manage.html' : '/'), 1200);
  }
}

document.addEventListener('DOMContentLoaded', () => new LoginController().init());
