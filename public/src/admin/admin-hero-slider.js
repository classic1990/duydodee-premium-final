// 💠 Admin Hero Slider - admin-hero-slider.js
import { db, collection, getDocs, doc, setDoc, updateDoc, deleteDoc, addDoc, serverTimestamp, orderBy, query, logActivity } from '/src/services/firebase.js';
import { checkAdminAccess } from '/src/middleware/auth-guard.js';
import { UI } from '/src/components/ui.js';

let slides = [];
let editingSlideId = null;

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function initSidebar() {
    const toggleBtn = document.getElementById('sidebar-toggle-btn');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('admin-overlay');
    if (!toggleBtn || !sidebar) return;
    const open = () => { sidebar.classList.remove('-translate-x-full'); overlay?.classList.remove('hidden'); };
    const close = () => { sidebar.classList.add('-translate-x-full'); overlay?.classList.add('hidden'); };
    toggleBtn.addEventListener('click', () => sidebar.classList.contains('-translate-x-full') ? open() : close());
    overlay?.addEventListener('click', close);
}

// ─── Admin Profile ────────────────────────────────────────────────────────────
function renderSidebarProfile(user) {
    const el = document.getElementById('admin-sidebar-profile');
    if (!el) return;
    el.innerHTML = `
        <div class="flex items-center gap-3">
            <img src="${user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'A')}&background=FBBF24&color=000`}" 
                 class="w-10 h-10 rounded-xl object-cover border border-brand-primary/20">
            <div class="overflow-hidden">
                <p class="text-xs font-black text-white truncate Thai-font">${user.displayName || 'แอดมิน'}</p>
                <p class="text-[9px] font-bold text-brand-primary uppercase tracking-widest">ADMIN</p>
            </div>
        </div>`;
}

// ─── Fetch Slides ─────────────────────────────────────────────────────────────
async function fetchSlides() {
    const snap = await getDocs(query(collection(db, 'hero_slides'), orderBy('order', 'asc')));
    slides = snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ─── Render Slides ────────────────────────────────────────────────────────────
function renderSlides() {
    const grid = document.getElementById('hero-slides-list');
    if (!grid) return;

    if (!slides.length) {
        grid.innerHTML = `
            <div class="col-span-full flex flex-col items-center justify-center py-32 text-gray-700">
                <i data-lucide="images" class="w-16 h-16 mb-4 opacity-20"></i>
                <p class="text-sm font-black Thai-font">ยังไม่มีสไลด์ในระบบ</p>
                <p class="text-xs Thai-font mt-2 text-gray-600">คลิก "เพิ่มสไลด์ใหม่" เพื่อเริ่มต้น</p>
            </div>`;
        if (window.lucide) window.lucide.createIcons();
        return;
    }

    grid.innerHTML = slides.map(slide => `
        <div class="group relative rounded-3xl overflow-hidden border border-white/5 hover:border-brand-primary/30 transition-all">
            <div class="aspect-video relative overflow-hidden bg-black/40">
                ${slide.imageUrl ? `<img src="${slide.imageUrl}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" onerror="this.style.display='none'">` : '<div class="w-full h-full flex items-center justify-center text-gray-700"><i data-lucide=\'image\' class=\'w-12 h-12\'></i></div>'}
                <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <div class="absolute top-4 left-4">
                    <span class="text-[9px] font-black uppercase tracking-widest bg-brand-primary text-black px-3 py-1.5 rounded-lg">
                        ลำดับที่ ${slide.order ?? '-'}
                    </span>
                </div>
                <div class="absolute bottom-0 left-0 right-0 p-5">
                    <h3 class="text-sm font-black text-white Thai-font truncate">${slide.title || '(ไม่มีหัวข้อ)'}</h3>
                    <p class="text-[10px] text-gray-300 Thai-font mt-1 truncate">${slide.description || ''}</p>
                </div>
            </div>
            <div class="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                <button onclick="openModal('${slide.id}')" class="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-brand-primary hover:text-black transition-all">
                    <i data-lucide="pencil" class="w-4 h-4"></i>
                </button>
                <button onclick="deleteSlide('${slide.id}', '${(slide.title || '').replace(/'/g, '\\\'')}')" class="w-9 h-9 rounded-xl bg-red-500/10 backdrop-blur-sm border border-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500 hover:text-white transition-all">
                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
            </div>
        </div>`).join('');
    if (window.lucide) window.lucide.createIcons();
}

// ─── Modal ────────────────────────────────────────────────────────────────────
window.openModal = function (slideId = null) {
    editingSlideId = slideId;
    const modal = document.getElementById('hero-modal');
    const form = document.getElementById('hero-form');

    if (slideId) {
        const slide = slides.find(s => s.id === slideId);
        if (slide) {
            document.getElementById('hero-id').value = slideId;
            document.getElementById('hero-title').value = slide.title || '';
            document.getElementById('hero-desc').value = slide.description || '';
            document.getElementById('hero-image').value = slide.imageUrl || '';
            document.getElementById('hero-link').value = slide.link || '';
            document.getElementById('hero-order').value = slide.order ?? 0;
        }
    } else {
        form?.reset();
        document.getElementById('hero-id').value = '';
        document.getElementById('hero-order').value = slides.length;
    }

    if (modal) { modal.classList.remove('hidden'); modal.classList.add('flex'); }
    if (window.lucide) window.lucide.createIcons();
};

function closeModal() {
    const modal = document.getElementById('hero-modal');
    if (modal) { modal.classList.add('hidden'); modal.classList.remove('flex'); }
    editingSlideId = null;
}

function initModal() {
    const closeBtn = document.getElementById('close-modal');
    closeBtn?.addEventListener('click', closeModal);

    const modal = document.getElementById('hero-modal');
    modal?.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

    const addBtn = document.getElementById('add-slide-btn');
    addBtn?.addEventListener('click', () => openModal(null));
}

// ─── Form Submit ──────────────────────────────────────────────────────────────
function initForm() {
    const form = document.getElementById('hero-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'กำลังบันทึก...'; }

        const payload = {
            title: document.getElementById('hero-title')?.value.trim(),
            description: document.getElementById('hero-desc')?.value.trim(),
            imageUrl: document.getElementById('hero-image')?.value.trim(),
            link: document.getElementById('hero-link')?.value.trim(),
            order: parseInt(document.getElementById('hero-order')?.value || '0', 10),
            updatedAt: serverTimestamp()
        };

        try {
            if (editingSlideId) {
                await updateDoc(doc(db, 'hero_slides', editingSlideId), payload);
                await logActivity('UPDATE_HERO_SLIDE', { id: editingSlideId, title: payload.title });
            } else {
                payload.createdAt = serverTimestamp();
                const docRef = await addDoc(collection(db, 'hero_slides'), payload);
                await logActivity('ADD_HERO_SLIDE', { id: docRef.id, title: payload.title });
            }
            UI.showToast(editingSlideId ? 'อัปเดตสไลด์สำเร็จ' : 'เพิ่มสไลด์ใหม่สำเร็จ', 'success');
            closeModal();
            await fetchSlides();
            renderSlides();
        } catch (err) {
            console.error('Save error:', err);
            UI.showToast('เกิดข้อผิดพลาด: ' + err.message, 'error');
        } finally {
            if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'ยืนยันการบันทึก'; }
        }
    });
}

// ─── Delete ───────────────────────────────────────────────────────────────────
window.deleteSlide = async function (id, title) {
    if (!confirm(`ลบสไลด์ "${title}"?\n\nไม่สามารถย้อนคืนได้`)) return;
    try {
        await deleteDoc(doc(db, 'hero_slides', id));
        await logActivity('DELETE_HERO_SLIDE', { id, title });
        UI.showToast('ลบสไลด์เรียบร้อยแล้ว', 'success');
        slides = slides.filter(s => s.id !== id);
        renderSlides();
    } catch (err) {
        UI.showToast('เกิดข้อผิดพลาด: ' + err.message, 'error');
    }
};

// ─── Main ─────────────────────────────────────────────────────────────────────
async function init() {
    initSidebar();
    initModal();
    initForm();

    try {
        const { user } = await checkAdminAccess();
        renderSidebarProfile(user);
        await fetchSlides();
        renderSlides();
    } catch (err) {
        console.error('[admin-hero-slider] Access Denied:', err);
        window.location.replace('/login.html');
    }
}

document.addEventListener('DOMContentLoaded', init);
