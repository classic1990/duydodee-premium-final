import { db, collection, getDocs, doc, setDoc, addDoc, deleteDoc, query, orderBy, SCHEMA, serverTimestamp } from '../services/firebase.js';
import { UI } from '../components/ui.js';
import { checkAdminAccess } from '../middleware/auth-guard.js';
import { injectAdminSidebar } from './sidebar-loader.js';

/**
 * 🖼️ DUYดูDEE HERO SLIDER ENGINE
 * Unified Logic for High-Impact Hero Slider Management
 */

let modal, form, container, slidesCache = [];

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const { user } = await checkAdminAccess();
        UI.setupSidebar(user);
        await injectAdminSidebar();
        UI.initAdminSidebar();

        modal = document.getElementById('hero-modal');
        form = document.getElementById('hero-form');
        container = document.getElementById('hero-slides-list');

        initEventListeners();
        loadHeroSlides();
    } catch (err) {
        console.error('Access Denied:', err);
        UI.showToast('ไม่มีสิทธิเข้าถึงหน้าจัดการสไลเดอร์', 'error');
        setTimeout(() => {
            window.location.href = '/admin/admin-manage.html';
        }, 2000);
    }
});

function initEventListeners() {
    document.getElementById('add-slide-btn')?.addEventListener('click', () => {
        form.reset();
        document.getElementById('hero-id').value = '';
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    });

    document.getElementById('close-modal')?.addEventListener('click', () => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    });

    form.addEventListener('submit', handleSaveHero);
}

async function loadHeroSlides() {
    UI.setLoading(true);
    try {
        const q = query(collection(db, SCHEMA.COLLECTIONS.HERO), orderBy('order', 'asc'));
        const snap = await getDocs(q);
        const slides = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        slidesCache = slides;
        renderSlides(slides);
    } catch (err) {
        console.error(err);
        UI.showToast('โหลดข้อมูลล้มเหลว', 'error');
    } finally {
        UI.setLoading(false);
    }
}

function renderSlides(slides) {
    if (!container) {
        return;
    }
    if (slides.length === 0) {
        container.innerHTML = '<div class="col-span-full py-12 sm:py-16 text-center opacity-30 Thai-font">ยังไม่มีเนื้อหาแนะนำ</div>';
        return;
    }

    container.innerHTML = slides.map(slide => `
        <div class="cyber-card group animate-fade-up">
            <div class="aspect-video relative overflow-hidden rounded-t-[1.5rem]">
                <img src="${UI.getSafePoster(slide.imageUrl)}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="${UI.escapeHTML(slide.title)}">
                <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                <div class="absolute bottom-4 left-4">
                    <span class="px-2 py-0.5 bg-brand-primary text-black text-[9px] font-black uppercase rounded Thai-font">ORDER: ${slide.order}</span>
                    <h3 class="text-white font-bold Thai-font mt-1">${UI.escapeHTML(slide.title)}</h3>
                </div>
            </div>
            <div class="p-4 flex gap-2">
                <button data-action="edit-hero" data-id="${slide.id}" class="hero-action-btn flex-1 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-bold hover:bg-brand-primary hover:text-black transition-all Thai-font">แก้ไข</button>
                <button data-action="delete-hero" data-id="${slide.id}" class="hero-action-btn px-3 py-2.5 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
            </div>
        </div>
    `).join('');
    UI.refreshIcons();

    // Setup event delegation for hero action buttons
    setupHeroActionListeners();
}

/**
 * Sets up event delegation for hero action buttons
 */
function setupHeroActionListeners() {
    if (!container) {
        return;
    }
    container.addEventListener('click', (e) => {
        const btn = e.target.closest('.hero-action-btn');
        if (!btn) {
            return;
        }

        const action = btn.dataset.action;
        const id = btn.dataset.id;

        if (action === 'edit-hero') {
            editHero(id);
        } else if (action === 'delete-hero') {
            deleteHero(id);
        }
    });
}

/**
 * Opens the edit hero modal
 * @param {string} id - Hero slide ID
 */
function editHero(id) {
    const data = slidesCache.find(s => s.id === id);
    if (!data) {
        return;
    }
    document.getElementById('hero-id').value = id;
    document.getElementById('hero-title').value = data.title;
    document.getElementById('hero-desc').value = data.description;
    document.getElementById('hero-image').value = data.imageUrl;
    document.getElementById('hero-link').value = data.targetUrl;
    document.getElementById('hero-order').value = data.order || 0;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

async function handleSaveHero(e) {
    e.preventDefault();
    UI.setLoading(true);

    const id = document.getElementById('hero-id').value;
    const formData = {
        title: document.getElementById('hero-title').value.trim(),
        description: document.getElementById('hero-desc').value.trim(),
        imageUrl: document.getElementById('hero-image').value.trim(),
        targetUrl: document.getElementById('hero-link').value.trim(),
        order: parseInt(document.getElementById('hero-order').value) || 0,
        updatedAt: serverTimestamp()
    };

    try {
        if (id) {
            await setDoc(doc(db, SCHEMA.COLLECTIONS.HERO, id), formData, { merge: true });
        } else {
            await addDoc(collection(db, SCHEMA.COLLECTIONS.HERO), { ...formData, createdAt: serverTimestamp() });
        }

        UI.showToast('บันทึกข้อมูลเรียบร้อย', 'success');
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        loadHeroSlides();
    } catch (err) {
        console.error(err);
        UI.showToast('บันทึกล้มเหลว', 'error');
    } finally {
        UI.setLoading(false);
    }
}

/**
 * Deletes a hero slide
 * @param {string} id - Hero slide ID
 * @returns {Promise<void>}
 */
async function deleteHero(id) {
    // eslint-disable-next-line no-alert
    if (!confirm('คุณต้องการลบสไลด์นี้ใช่หรือไม่?')) {
        return;
    }
    UI.setLoading(true);
    try {
        await deleteDoc(doc(db, SCHEMA.COLLECTIONS.HERO, id));
        UI.showToast('ลบข้อมูลเรียบร้อย', 'success');
        loadHeroSlides();
    } catch (err) {
        console.error(err);
        UI.showToast('ลบล้มเหลว', 'error');
    } finally {
        UI.setLoading(false);
    }
}

