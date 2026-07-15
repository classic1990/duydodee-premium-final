import { AuthService } from '../services/auth-service.js';
import { ContentService } from '../services/content-service.js';
import { UI } from '../components/ui.js';
import { UI_CONFIG } from '../constants.js';

class HomeController {
  constructor() {
    this.pageNumber = 0;
    this.pageCursors = [null];
    this.isEndOfContent = false;
    this.currentType = 'all';
  }

  async init() {
    UI.injectStarfield();
    UI.initNavbar();
    UI.updateMeta({});

    window.changePage = (dir) => this.changePage(dir);

    this.initHeroSlider();
    this.loadTrendingMovies();
    this.initSearchSystem();
    this.initFilterSystem();
    this.loadDiscoveryContent(true);

    AuthService.onStateChanged((user) => {
      if (user) {
        this.loadUserHistory(user.uid);
      } else {
        document.getElementById('history-section')?.classList.add('hidden');
      }
    });
  }

  async initHeroSlider() {
    const container = document.getElementById('hero-slider-container');
    if (!container) {
      return;
    }
    try {
      const { items } = await ContentService.fetchItems('hero', {
        pageSize: 5,
        sortBy: 'order',
        direction: 'asc'
      });
      this.renderSlider(
        items.length > 0
          ? items
          : [
            {
              title: 'DUYดูDEE',
              description: 'ก้าวข้ามขีดจำกัด สู่โลกความบันเทิงระดับมาสเตอร์พีซ',
              targetUrl: '/category.html?cat=vertical'
            }
          ],
        container
      );
    } catch (e) {
      console.error('Hero Error:', e);
    }
  }

  renderSlider(slides, container) {
    let idx = 0;
    const show = () => {
      container.innerHTML = `<div class="absolute bottom-10 right-10 z-10">${slides.length > 1 ? `<div class="flex gap-3">${slides.map((_, i) => `<button data-index="${i}" class="slider-dot h-1.5 rounded-full ${i === idx ? 'w-12 bg-brand-primary' : 'w-2 bg-white/20'}"></button>`).join('')}</div>` : ''}</div>`;
      document.querySelectorAll('.slider-dot').forEach(
        (d) =>
          (d.onclick = (e) => {
            idx = parseInt(e.target.dataset.index, 10);
            show();
          })
      );
    };
    show();
    if (slides.length > 1) {
      setInterval(() => {
        idx = (idx + 1) % slides.length;
        show();
      }, 10000);
    }
  }

  async loadTrendingMovies() {
    const container = document.getElementById('trending-grid');
    if (!container) {
      return;
    }
    try {
      const { items } = await ContentService.fetchItems('movie', {
        pageSize: 10,
        sortBy: 'views',
        direction: 'desc'
      });
      if (items.length > 0) {
        document.getElementById('trending-section')?.classList.remove('hidden');
        container.innerHTML = items.map((item, i) => UI.createTrendingCard(item, i + 1)).join('');
      }
    } catch (e) {
      console.error(e);
    }
  }

  async loadDiscoveryContent(reset = false) {
    const container = document.getElementById('library-grid');
    if (!container) {
      return;
    }

    if (reset) {
      this.pageNumber = 0;
      this.pageCursors = [null];
      this.isEndOfContent = false;
      UI.renderSkeleton(container, UI_CONFIG.PAGE_SIZE);
    }

    console.log(
      `[DEBUG] Loading Page: ${this.pageNumber + 1}, Cursor:`,
      this.pageCursors[this.pageNumber]
    );

    try {
      const res =
        this.currentType === 'all'
          ? await ContentService.fetchItemsByCategory(['movie', 'series'], null, {
            pageSize: UI_CONFIG.PAGE_SIZE,
            lastDoc: this.pageCursors[this.pageNumber],
            isAllCategories: true
          })
          : await ContentService.fetchItems(this.currentType, {
            pageSize: UI_CONFIG.PAGE_SIZE,
            lastDoc: this.pageCursors[this.pageNumber]
          });

      console.log(`[DEBUG] Items loaded: ${res.items.length}, NextLastDoc:`, res.lastDoc);

      this.isEndOfContent = res.items.length < UI_CONFIG.PAGE_SIZE;
      if (res.items.length > 0 && res.lastDoc) {
        this.pageCursors[this.pageNumber + 1] = res.lastDoc;
      }

      container.innerHTML =
        res.items.length > 0
          ? res.items.map((item) => UI.createMovieCard(item)).join('')
          : '<p class="col-span-full text-center py-20">ไม่พบข้อมูล</p>';
      this.updatePaginationUI();
    } catch (e) {
      console.error(e);
      container.innerHTML =
        '<p class="col-span-full text-center text-red-500 py-10">โหลดข้อมูลขัดข้อง</p>';
    }
  }

  updatePaginationUI() {
    const prev = document.getElementById('prev-page'),
      next = document.getElementById('next-page'),
      pages = document.getElementById('page-numbers');
    if (!prev || !next) {
      return;
    }
    pages.textContent = `หน้า ${this.pageNumber + 1}`;
    prev.disabled = this.pageNumber === 0;
    prev.style.opacity = this.pageNumber === 0 ? '0.2' : '1';
    next.disabled = this.isEndOfContent;
    next.style.opacity = this.isEndOfContent ? '0.2' : '1';
  }

  changePage(dir) {
    if (dir === 1 && !this.isEndOfContent) {
      this.pageNumber++;
    } else if (dir === -1 && this.pageNumber > 0) {
      this.pageNumber--;
      this.isEndOfContent = false;
    } else {
      return;
    }
    document.getElementById('vertical-section')?.scrollIntoView({ behavior: 'smooth' });
    this.loadDiscoveryContent(false);
  }

  initFilterSystem() {
    document.querySelectorAll('.type-filter').forEach((btn) =>
      btn.addEventListener('click', (e) => {
        this.currentType = e.target.dataset.type;
        document
          .querySelectorAll('.type-filter')
          .forEach((b) => b.classList.remove('active', 'bg-brand-primary', 'text-black'));
        btn.classList.add('active', 'bg-brand-primary', 'text-black');
        this.loadDiscoveryContent(true);
      })
    );
  }

  async initSearchSystem() {
    const handleSearch = async (term) => {
      const libGrid = document.getElementById('library-grid');
      if (!term) {
        this.loadDiscoveryContent(true);
        document.getElementById('pagination-container')?.classList.remove('hidden');
        return;
      }
      document.getElementById('pagination-container')?.classList.add('hidden');
      UI.renderSkeleton(libGrid, 6);
      const [movies, series] = await Promise.all([
        ContentService.searchItems('movie', term, 12),
        ContentService.searchItems('series', term, 12)
      ]);
      libGrid.innerHTML =
        [...movies, ...series].length > 0
          ? [...movies, ...series].map((i) => UI.createMovieCard(i)).join('')
          : '<p class="col-span-full text-center">ไม่พบผลลัพธ์</p>';
    };
    const search = UI.debounce(
      (e) => handleSearch(e.target.value.trim().toLowerCase()),
      UI_CONFIG.DEBOUNCE_DELAY
    );
    document.getElementById('global-search')?.addEventListener('input', search);
    document.getElementById('global-search-mobile')?.addEventListener('input', search);
  }

  async loadUserHistory(uid) {
    const container = document.getElementById('history-grid');
    if (!container) {
      return;
    }
    const history = await AuthService.getWatchHistory(uid, 8);
    if (history.length > 0) {
      document.getElementById('history-section')?.classList.remove('hidden');
      container.innerHTML = history.map((item) => UI.createHistoryCard(item)).join('');
    }
  }
}

document.addEventListener('DOMContentLoaded', () => new HomeController().init());
