import { AuthService } from '../../services/auth-service.js';
import { UI } from '../../components/ui.js';
import { BaseController } from '../../components/base-controller.js';

class RegisterController extends BaseController {
  setupForm() {
    document
      .getElementById('register-form')
      ?.addEventListener('submit', (e) => this.handleRegister(e));
    document
      .getElementById('google-register-btn')
      ?.addEventListener('click', () => this.handleGoogleRegister());
  }

  async handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('display-name').value.trim();
    const email = document.getElementById('email').value.trim();
    const pass = document.getElementById('password').value;
    const confirm = document.getElementById('confirm-password').value;

    if (!name) {
      return UI.showToast('กรุณากรอกชื่อ', 'error');
    }
    if (pass.length < 6) {
      return UI.showToast('รหัสผ่านสั้นเกินไป', 'error');
    }
    if (pass !== confirm) {
      return UI.showToast('รหัสผ่านไม่ตรงกัน', 'error');
    }

    UI.setLoading(true);
    try {
      await AuthService.registerWithEmail(name, email, pass);
      UI.showToast('สมัครสมาชิกสำเร็จ!', 'success');
      setTimeout(() => (window.location.href = '/'), 1500);
    } catch (err) {
      UI.showToast(err.code === 'auth/email-already-in-use' ? 'อีเมลซ้ำ' : 'ระบบขัดข้อง', 'error');
      UI.setLoading(false);
    }
  }

  async handleGoogleRegister() {
    try {
      await AuthService.loginWithGoogle();
      UI.showToast('สำเร็จ!', 'success');
      setTimeout(() => (window.location.href = '/'), 1500);
    } catch (err) {
      UI.showToast('เชื่อมต่อ Google ไม่สำเร็จ', 'error');
    }
  }
}

document.addEventListener('DOMContentLoaded', () => new RegisterController().init());
