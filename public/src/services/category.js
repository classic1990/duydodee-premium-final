import { ContentService } from '../../services/content-service.js';
import { UI } from '../../components/ui.js';
import { SCHEMA, UI_CONFIG } from '../../constants.js';

/**
 * 📂 CATEGORY ENGINE - Professional Content Domain
 */
document.addEventListener('DOMContentLoaded', () => {
  UI.injectStarfield();
  UI.initNavbar();
  initCategoryPage();
});

let activeCol = '',
  activeCat = '',
  isAllCategories = false,
  lastVisible = null;

async function initCategoryPage() {
  const params = new URLSearchParams(window.location.search);
  let typeSlug = params.get('type');
  const catSlug = params.get('cat');

  const catMap = {
    vertical: [SCHEMA.CATEGORIES.VERTICAL, 'ซีรีส์แนวตั้ง', 'แนวตั้ง'].filter(
      Boolean,
    ),
    chinese: [
      SCHEMA.CATEGORIES.CHINESE,
      'ซีรีส์จีน',
      'ซีรีส์จีนพากย์ไทย',
    ].filter(Boolean),
  };

  if (catSlug === 'vertical' && !typeSlug) typeSlug = 'series';
  let targetCollection =
    typeSlug === 'movie' ? 'movie' : typeSlug === 'series' ? 'series' : null;

  if (!targetCollection && catSlug) {
    activeCol = ['movie', 'series'];
  } else if (!targetCollection && !catSlug) {
    window.location.href = '/404.html';
    return;
  } else {
    activeCol = targetCollection;
  }

  let targetCategoryNames = [];
  let displayTitle = '';

  if (catSlug && catMap[catSlug]) {
    targetCategoryNames = catMap[catSlug];
    displayTitle = targetCategoryNames[0];
    isAllCategories = false;
    document.getElementById('breadcrumb').innerText =
      `${(typeSlug || 'Content').toUpperCase()} / ${catSlug.toUpperCase()}`;
  } else {
    displayTitle = typeSlug === 'movie' ? 'ภาพยนตร์ทั้งหมด' : 'ซีรีส์ทั้งหมด';
    isAllCategories = true;
    document.getElementById('breadcrumb').innerText =
      `${(typeSlug || 'ALL').toUpperCase()} / ALL`;
  }

  document.getElementById('category-title').innerText = displayTitle;
  UI.updateMeta({ title: displayTitle });
  activeCat =
    targetCategoryNames.length > 0 ? targetCategoryNames : displayTitle;

  const sortSelector = document.getElementById('sort-selector');
  const yearSelector = document.getElementById('year-selector');

  const handleFilterChange = () => {
    loadCategoryContent(
      activeCol,
      activeCat,
      sortSelector?.value || 'createdAt',
      false,
    );
  };

  if (sortSelector) sortSelector.onchange = handleFilterChange;
  if (yearSelector) yearSelector.onchange = handleFilterChange;

  const loadMoreBtn = document.getElementById('load-more-btn');
  if (loadMoreBtn)
    loadMoreBtn.onclick = () =>
      loadCategoryContent(
        activeCol,
        activeCat,
        sortSelector?.value || 'createdAt',
        true,
      );

  loadCategoryContent(activeCol, activeCat);
}

async function loadCategoryContent(
  colName,
  categoryInput,
  sortField = 'createdAt',
  isAppend = false,
) {
  const container = document.getElementById('category-grid');
  if (!container) return;

  const collectionsToSearch = Array.isArray(colName)
    ? colName
    : [colName || 'movie'];

  if (!isAppend) {
    container.innerHTML = '';
    UI.renderSkeleton(container, UI_CONFIG.PAGE_SIZE);
    lastVisible = null;
  }

  try {
    const direction = sortField === 'title' ? 'asc' : 'desc';
    const { items, lastDoc, empty } = await ContentService.fetchItemsByCategory(
      collectionsToSearch,
      categoryInput,
      {
        pageSize: UI_CONFIG.PAGE_SIZE,
        lastDoc: lastVisible,
        sortBy: sortField,
        direction,
        isAllCategories,
      },
    );

    lastVisible = lastDoc;
    if (!isAppend) container.innerHTML = '';
    if (empty && !isAppend)
      return UI.renderEmptyState(
        container,
        'ไม่พบเนื้อหาในหมวดหมู่ที่คุณต้องการ',
      );

    const html = items.map((item) => UI.createMovieCard(item)).join('');
    if (isAppend) container.insertAdjacentHTML('beforeend', html);
    else container.innerHTML = html;

    UI.refreshIcons();
  } catch (err) {
    console.error('Category Load Error:', err);
  }
}
