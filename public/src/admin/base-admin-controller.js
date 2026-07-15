import { BaseController } from '../components/base-controller.js';
import { UI } from '../components/ui.js';
import { checkAdminAccess } from '../middleware/auth-guard.js';

export class BaseAdminController extends BaseController {
  async init() {
    try {
      const { user } = await checkAdminAccess();
      this.user = user;
      UI.setupSidebar(this.user);
      UI.initAdminSidebar();
      await super.init();
    } catch (err) {
      console.error('Access Denied:', err);
    }
  }
}
