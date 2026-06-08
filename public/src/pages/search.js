import {
  db,
  collection,
  getDocs,
  query,
  where,
  limit,
  SCHEMA,
} from '../services/firebase.js';
import { UI } from '../components/ui.js';

/**
 * 🔍 DUYดูDEE SEARCH ENGINE - Real-time Edition
 */
document.addEventListener('DOMContentLoaded', () => {
  UI.injectStarfield();
  UI.initNavbar();

  const searchInput = document.getElementById('search-input');
  const resultsGrid = document.getElementById('search-results');
  let debounceTimer;

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const keyword = e.target.value.trim();
      clearTimeout(debounceTimer);

      if (keyword.length < 2) {
        resultsGrid.innerHTML = '';
        return;
      }

      // ⏲️ Debounce 300ms เพื่อประหยัด Firestore Reads
      debounceTimer = setTimeout(() => performSearch(keyword), 300);
    });
  }
});

async function performSearch(keyword) {
  const grid = document.getElementById('search-results');
  UI.renderSkeleton(grid, 6);

  try {
    // Firestore ไม่รองรับ Full-text search โดยตรง
    // เราจะใช้วิธี Query แบบ Prefix matching (เริ่มด้วย...) ซึ่งมีประสิทธิภาพสูง
    const q = query(
      collection(db, SCHEMA.COLLECTIONS.MOVIES),
      where('title', '>=', keyword),
      where('title', '<=', keyword + '\uf8ff'),
      limit(12),
    );

    const snap = await getDocs(q);
    grid.innerHTML = '';

    if (snap.empty) {
      UI.renderEmptyState(grid, `ไม่พบผลลัพธ์สำหรับ "${keyword}"`);
      return;
    }

    snap.forEach((doc) => {
      const data = { id: doc.id, ...doc.data(), type: 'movie' };
      grid.insertAdjacentHTML('beforeend', UI.createMovieCard(data));
    });

    UI.refreshIcons();
  } catch (error) {
    console.error('Search Error:', error);
    UI.showToast('การค้นหาขัดข้อง กรุณาลองใหม่', 'error');
  }
}
