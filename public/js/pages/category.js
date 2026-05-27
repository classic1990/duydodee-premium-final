import { ContentService } from '../services/content-service.js';
import { UI } from '../components/ui.js';
import { SCHEMA, UI_CONFIG } from '../constants.js';

/**
 * 📂 CATEGORY ENGINE - Unified Premium Layout
 */
document.addEventListener('DOMContentLoaded', () => {
    UI.injectStarfield();
    UI.initNavbar();
    initCategoryPage();
});

let activeCol = '', activeCat = '', isAllCategories = false, lastVisible = null;

async function initCategoryPage() {
    const params = new URLSearchParams(window.location.search);
    let typeSlug = params.get('type'); 
    const catSlug = params.get('cat');   

    const catMap = {
        'vertical': [SCHEMA.CATEGORIES.VERTICAL, 'ซีรีส์แนวตั้ง', 'แนวตั้ง'].filter(Boolean),
        'chinese': [SCHEMA.CATEGORIES.CHINESE, 'ซีรีส์จีน', 'ซีรีส์จีนพากย์ไทย'].filter(Boolean)
    };

    if (catSlug === 'vertical' && !typeSlug) typeSlug = 'series';
    let targetCollection = typeSlug === 'movie' ? 'movie' : (typeSlug === 'series' ? 'series' : null);
    if (!targetCollection && !catSlug) { window.location.href = '/404.html'; return; }

    let targetCategoryNames = [];
    let displayTitle = '';
    
    if (catSlug && catMap[catSlug]) {
        targetCategoryNames = catMap[catSlug];
        displayTitle = targetCategoryNames[0];
        isAllCategories = false;
        document.getElementById('breadcrumb').innerText = `${(typeSlug || 'Content').toUpperCase()} / ${catSlug.toUpperCase()}`;
    } else {
        displayTitle = typeSlug === 'movie' ? 'ภาพยนตร์ทั้งหมด' : 'ซีรีส์ทั้งหมด';
        isAllCategories = true;
        document.getElementById('breadcrumb').innerText = `${(typeSlug || 'ALL').toUpperCase()} / ALL`;
    }

    document.getElementById('category-title').innerText = displayTitle;
    UI.updateMeta({ title: displayTitle });

    activeCol = targetCollection;
    activeCat = targetCategoryNames.length > 0 ? targetCategoryNames : displayTitle;

    const sortSelector = document.getElementById('sort-selector');
    if (sortSelector) sortSelector.onchange = (e) => loadCategoryContent(activeCol, activeCat, e.target.value, false);

    const loadMoreBtn = document.getElementById('load-more-btn');
    if (loadMoreBtn) loadMoreBtn.onclick = () => loadCategoryContent(activeCol, activeCat, sortSelector?.value || 'createdAt', true);

    // Ensure activeCol is valid before fetching
    const fetchCol = activeCol || 'movie';
    loadCategoryContent(fetchCol, activeCat);
}

async function loadCategoryContent(colName, categoryInput, sortField = 'createdAt', isAppend = false) {
    const container = document.getElementById('category-grid'), emptyState = document.getElementById('empty-state'), pagContainer = document.getElementById('pagination-container'), loadMoreBtn = document.getElementById('load-more-btn');
    if (!container) return;

    // Fix: Ensure colName is valid
    const safeColName = colName || 'movie';

    if (!isAppend) { 
        container.innerHTML = ''; 
        UI.renderSkeleton(container, UI_CONFIG.PAGE_SIZE); 
        lastVisible = null; 
        if (pagContainer) pagContainer.classList.add('hidden'); 
    } else if (loadMoreBtn) { 
        loadMoreBtn.disabled = true; 
        loadMoreBtn.innerText = 'กำลังโหลด...'; 
    }

    try {
        const direction = sortField === 'title' ? 'asc' : 'desc';
        
        const isVerticalSearch = Array.isArray(categoryInput) && categoryInput.some(c => c && typeof c === 'string' && c.includes('แนวตั้ง'));
        const collectionsToSearch = isVerticalSearch ? ['movie', 'series'] : [safeColName];

        const { items, lastDoc, empty } = await ContentService.fetchItemsByCategory(collectionsToSearch, categoryInput, {
            pageSize: UI_CONFIG.PAGE_SIZE,
            lastDoc: lastVisible,
            sortBy: sortField,
            direction,
            isAllCategories
        });

        lastVisible = lastDoc;

        if (!isAppend) container.innerHTML = '';
        if (empty && !isAppend) {
            container.classList.add('hidden');
            if(emptyState) { 
                emptyState.classList.remove('hidden'); 
                emptyState.innerHTML = '<div class="col-span-full py-20 text-center Thai-font opacity-40">ไม่พบเนื้อหาในหมวดหมู่ที่คุณต้องการ</div>';
            }
            if(pagContainer) pagContainer.classList.add('hidden');
            return;
        }

        container.classList.remove('hidden');
        if(emptyState) emptyState.classList.add('hidden');

        const html = items.map(item => UI.createMovieCard(item)).join('');
        if (isAppend) container.insertAdjacentHTML('beforeend', html);
        else container.innerHTML = html;

        if (pagContainer) { 
            if (items.length < UI_CONFIG.PAGE_SIZE) pagContainer.classList.add('hidden'); 
            else pagContainer.classList.remove('hidden'); 
        }
        if (loadMoreBtn) { 
            loadMoreBtn.disabled = false; 
            loadMoreBtn.innerText = 'แสดงเนื้อหาเพิ่มเติม'; 
        }
        UI.refreshIcons();
    } catch (err) { 
        console.error('Category Load Error:', err); 
        if (loadMoreBtn) { 
            loadMoreBtn.disabled = false; 
            loadMoreBtn.innerText = 'เกิดข้อผิดพลาด ลองใหม่อีกครั้ง'; 
        }
    }
}
