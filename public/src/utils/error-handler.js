/**
 * 🛡️ DUYดูDEE Error Handler
 * Global error tracking and handling
 */

class ErrorHandler {
    constructor() {
        this.isStorageBlocked = false;
        this.init();
    }

    init() {
        window.addEventListener('error', (e) => this.showUserError(e.message));
        window.addEventListener('unhandledrejection', (e) => this.showUserError(e.reason));
    }

    showUserError(message) {
        console.error('UI Error:', message);
        // Minimalistic error notification
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 bg-red-500/10 text-red-500 px-6 py-3 rounded-xl border border-red-500/20 backdrop-blur-xl z-[9999]';
        toast.innerText = 'เกิดข้อผิดพลาด กรุณาลองใหม่';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
}

window.errorHandler = new ErrorHandler();
export default window.errorHandler;
