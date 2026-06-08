import { db, collection, getDocs, query, orderBy, limit, startAfter, SCHEMA, auth, onAuthStateChanged, doc, getDoc, where, getWatchHistory } from '../services/firebase.js';
import { UI } from '../components/ui.js';
import { UI_CONFIG } from '../constants.js';

/**
 * 🎬 DUYดูDEE HOME ENGINE - Content Renderer
 */
let lastVisibleDoc = null;
let isFetching = false;
let hasMore = true;

document.addEventListener('DOMContentLoaded', async () => {
    UI.injectStarfield();
    UI.initNavbar();
    
    const movieGrid = document.getElementById('movie-grid');
    if (movieGrid) {
        await loadMovies(movieGrid);
        setupInfiniteScroll(movieGrid);
    }

    // 🧭 Load Recommendations when user is logged in
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            const recGrid = document.getElementById('recommend-grid');
            if (recGrid) await loadRecommendations(user, recGrid);
        }
    });
});

/**
 * 🧠 ระบบแนะนำหนังฉลาด (Recommendation Engine)
 */
async function loadRecommendations(user, container) {
    try {
        // 1. ดึงข้อมูล Profile เพื่อดูหมวดหมู่ที่ชอบ
        const userDoc = await getDoc(doc(db, SCHEMA.COLLECTIONS.USERS, user.uid));
        const prefs = userDoc.data()?.preferredCategories || {};
        
        // 2. ดึงประวัติการรับชมล่าสุดเพื่อเอาไว้กรองเรื่องที่ดูแล้วออก
        const history = await getWatchHistory(user.uid, 20);
        const watchedIds = new Set(history.map(item => item.id));
        
        // หาหมวดหมู่ที่ดูบ่อยที่สุด 2 อันดับแรก
        const topCategories = Object.entries(prefs)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 2)
            .map(([cat]) => cat);

        if (topCategories.length === 0) return; // ถ้ายังไม่มีพฤติกรรม ไม่ต้องแสดง

        // 3. Query หนังในหมวดหมู่นั้น (ดึงมาเผื่อ 12 เรื่อง เพื่อกรองออก)
        const q = query(
            collection(db, SCHEMA.COLLECTIONS.MOVIES),
            where('category', 'in', topCategories),
            orderBy('rating', 'desc'), // 🏆 จัดอันดับตามเรตติ้ง
            limit(12)
        );

        const snap = await getDocs(q);
        
        // 4. กรองเรื่องที่ดูแล้วออก และเลือกมาแสดงแค่ 6 เรื่อง
        const recommendedItems = snap.docs
            .map(docSnap => ({ id: docSnap.id, ...docSnap.data(), type: 'movie' }))
            .filter(movie => !watchedIds.has(movie.id))
            .slice(0, 6);

        if (recommendedItems.length === 0) return;

        document.getElementById('recommend-section').classList.remove('hidden');
        container.innerHTML = '';

        recommendedItems.forEach(movie => {
            container.insertAdjacentHTML('beforeend', UI.createMovieCard(movie));
        });

        if (window.lucide) window.lucide.createIcons();

    } catch (error) {
        console.error('Recommendation Engine Error:', error);
    }
}

/**
 * ♾️ Infinite Scroll Setup
 */
function setupInfiniteScroll(container) {
    const observer = new IntersectionObserver(async (entries) => {
        if (entries[0].isIntersecting && hasMore && !isFetching) {
            await loadMovies(container, true);
        }
    }, { rootMargin: '300px' });

    const sentinel = document.createElement('div');
    sentinel.id = 'scroll-sentinel';
    sentinel.className = 'col-span-full h-1 w-full';
    container.after(sentinel);
    observer.observe(sentinel);
}

/**
 * โหลดข้อมูลหนังพร้อม Skeleton Loading
 */
async function loadMovies(container, isAppend = false) {
    if (isFetching || !hasMore) return;
    isFetching = true;

    if (isAppend) UI.renderSkeleton(container, 4, 'poster', true);
    else UI.renderSkeleton(container, UI_CONFIG.PAGE_SIZE);

    try {
        let q = query(collection(db, SCHEMA.COLLECTIONS.MOVIES), orderBy('createdAt', 'desc'), limit(UI_CONFIG.PAGE_SIZE));
        if (isAppend && lastVisibleDoc) q = query(q, startAfter(lastVisibleDoc));

        const querySnapshot = await getDocs(q);
        
        // ลบ Skeletons ออกก่อนแสดงผลจริง
        if (isAppend) container.querySelectorAll('.skeleton-item').forEach(el => el.remove());
        else container.innerHTML = '';

        if (querySnapshot.empty) {
            if (!isAppend) container.innerHTML = '<p class="text-center text-gray-500 col-span-full py-20">ไม่พบข้อมูลในขณะนี้</p>';
            hasMore = false;
            return;
        }

        lastVisibleDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
        if (querySnapshot.docs.length < UI_CONFIG.PAGE_SIZE) hasMore = false;

        querySnapshot.forEach((doc) => {
            const movieData = doc.data();
            // สร้าง Object ที่มีทั้ง ID และข้อมูลอื่นๆ เพื่อส่งให้ UI Component
            const movie = { id: doc.id, ...movieData, type: 'movie' };
            const cardHTML = UI.createMovieCard(movie);
            container.insertAdjacentHTML('beforeend', cardHTML);
        });

        // 2. รีเฟรช Lucide Icons หลังจาก Render เสร็จ
        if (window.lucide) {
            window.lucide.createIcons();
        }
    } catch (error) {
        console.error('🚨 Error loading movies:', error);
        if (!isAppend) container.innerHTML = '<p class="text-center text-red-500 col-span-full py-20">เกิดข้อผิดพลาด</p>';
    } finally {
        isFetching = false;
    }
}