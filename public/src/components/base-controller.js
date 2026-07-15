import { UI } from '../components/ui.js';

export class BaseController {
  constructor() {
    this.user = null;
  }

  async init() {
    UI.initNavbar();
    this.setupForm();
  }

  setupForm() {
    // Optional: Subclasses implement this
  }
}
