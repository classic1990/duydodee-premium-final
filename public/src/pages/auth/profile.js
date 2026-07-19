import { auth, db, SCHEMA } from '../../services/firebase.js';
import { UI } from '../../components/ui.js';
import { BaseController } from '../../components/base-controller.js';
import {
  onAuthStateChanged,
  signOut
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  orderBy,
  limit
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

class ProfileController extends BaseController {
  setupForm() {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        this.loadProfile(user);
        this.loadHistory(user);
      } else {
        window.location.href = '/login.html';
      }
    });
  }

  async loadProfile(user) {
    const docSnap = await getDoc(doc(db, SCHEMA.COLLECTIONS.USERS, user.uid));
    const data = docSnap.exists() ? docSnap.data() : {};

    document.getElementById('user-display-name').innerText =
      data.displayName || user.displayName || 'MEMBER';
    document.getElementById('user-email').innerText = user.email.toLowerCase();
    const pic = document.getElementById('profile-pic');
    if (pic && data.photoURL) {
      pic.src = data.photoURL.replace('s96-c', 's400-c');
    }

    if (
      ['super-admin', 'admin', 'master'].includes((data.role || '').toLowerCase()) &&
      !document.getElementById('admin-btn')
    ) {
      const btn = document.createElement('a');
      btn.id = 'admin-btn';
      btn.href = '/admin/admin-manage.html';
      btn.innerText = 'Admin Dashboard';
      btn.className =
        'px-5 py-2 rounded-xl bg-red-600/10 border border-red-600/20 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-600/20 transition-all';
      document
        .getElementById('logout-btn')
        .parentElement.insertBefore(btn, document.getElementById('logout-btn'));
    }

    document.getElementById('logout-btn').onclick = () => {
      if (confirm('ออกจากระบบ?')) {
        signOut(auth).then(() => (window.location.href = '/login.html'));
      }
    };
    UI.refreshIcons();
  }

  async loadHistory(user) {
    const grid = document.getElementById('history-grid');
    if (!grid) {
      return;
    }
    const snap = await getDocs(
      query(
        collection(db, SCHEMA.COLLECTIONS.USERS, user.uid, 'history'),
        orderBy('watchedAt', 'desc'),
        limit(20)
      )
    );
    grid.innerHTML = snap.empty
      ? '<p class="text-center text-gray-500">ไม่มีประวัติ</p>'
      : snap.docs.map((d) => UI.createHistoryCard(d.data())).join('');
    UI.refreshIcons();
  }
}

document.addEventListener('DOMContentLoaded', () => new ProfileController().init());
