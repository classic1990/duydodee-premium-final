// 💠 Admin Edit Movie - admin-edit-movie.js
import { db, doc, getDoc, updateDoc, deleteDoc, serverTimestamp, logActivity, SCHEMA, collection, query, where, limit, collectionGroup, documentId } from '/src/services/firebase.js';
import { checkAdminAccess } from '/src/middleware/auth-guard.js';
import { UI } from '/src/components/ui.js'; // Import UI for toast messages
import { UIUtils } from '/src/utils/ui-utils.js';

let movieId = null;
let movieData = null;
let selectedPoster = '';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const extractYouTubeId = UIUtils.extractYouTubeId;

function getThumbnails(ytId) {
    if (!ytId) return [];
    return [
        `https://i.ytimg.com/vi/${ytId}/maxresdefault.jpg`,
        `https://i.ytimg.com/vi/${ytId}/sddefault.jpg`,
        `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`,
        `https://i.ytimg.com/vi/${ytId}/mqdefault.jpg`,
    ];
}

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

// ─── Load Movie ───────────────────────────────────────────────────────────────
async function loadMovie() {
    const docRef = doc(db, SCHEMA.COLLECTIONS.MOVIES, movieId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
        UI.showToast('ไม่พบภาพยนตร์นี้ในระบบ', 'error');
        window.location.replace('/admin/admin-manage-movies.html');
        return;
    }
    movieData = { id: snap.id, ...snap.data() };
    populateForm(movieData);
}

function populateForm(data) {
    setValue('videoUrl', data.videoUrl || '');
    setValue('title', data.title || '');
    setValue('category', data.category || '');
    setValue('badge', data.badge || '');
    setValue('description', data.description || '');
    selectedPoster = data.poster || '';
    setValue('selected-poster-url', selectedPoster);

    // Update preview
    updatePreview(data.videoUrl || '', data.title || '');
    renderThumbnailOptions(data.videoUrl || '');
}

function setValue(id, val) {
    const el = document.getElementById(id);
    if (el) el.value = val;
}

// ─── Preview ──────────────────────────────────────────────────────────────────
function updatePreview(url, title) {
    const ytId = extractYouTubeId(url);
    const previewImg = document.getElementById('poster-preview');
    const noPreview = document.getElementById('no-preview');
    const previewTitle = document.getElementById('preview-title');

    if (previewTitle) previewTitle.textContent = title || 'ยังไม่ได้ระบุชื่อเรื่อง';

    if (ytId && previewImg) {
        const src = `https://i.ytimg.com/vi/${ytId}/sddefault.jpg`;
        previewImg.src = src;
        previewImg.classList.remove('opacity-0');
        noPreview?.classList.add('hidden');
    } else if (previewImg) {
        previewImg.classList.add('opacity-0');
        noPreview?.classList.remove('hidden');
    }
}

function renderThumbnailOptions(videoUrl) {
    const container = document.getElementById('thumbnail-options-container');
    if (!container) return;
    const ytId = extractYouTubeId(videoUrl);
    if (!ytId) { container.innerHTML = ''; return; }

    const thumbs = getThumbnails(ytId);
    container.innerHTML = thumbs.map((url, i) => `
        <button type="button" onclick="selectPoster('${url}')" class="flex-shrink-0 w-20 h-28 rounded-xl overflow-hidden border-2 transition-all ${selectedPoster === url ? 'border-brand-primary' : 'border-white/10 hover:border-white/30'}">
            <img src="${url}" class="w-full h-full object-cover" loading="lazy" onerror="this.parentElement.style.display='none'">
        </button>`).join('');
}

window.selectPoster = function (url) {
    selectedPoster = url;
    const el = document.getElementById('selected-poster-url');
    if (el) el.value = url;
    const previewImg = document.getElementById('poster-preview');
    if (previewImg) { previewImg.src = url; previewImg.classList.remove('opacity-0'); }
    document.getElementById('no-preview')?.classList.add('hidden');
    // re-render options to update selection border
    renderThumbnailOptions(document.getElementById('videoUrl')?.value || '');
};

// ─── Live input listeners ─────────────────────────────────────────────────────
function initLiveListeners() {
    document.getElementById('videoUrl')?.addEventListener('input', (e) => {
        updatePreview(e.target.value, document.getElementById('title')?.value || '');
        renderThumbnailOptions(e.target.value);
    });
    document.getElementById('title')?.addEventListener('input', (e) => {
        const el = document.getElementById('preview-title');
        if (el) el.textContent = e.target.value || 'ยังไม่ได้ระบุชื่อเรื่อง';
    });
}

// ─── Save ─────────────────────────────────────────────────────────────────────
function initForm() {
    const form = document.getElementById('edit-movie-form');
    const submitBtn = document.getElementById('submit-btn');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'กำลังอัปเดต...'; }

        const videoUrl = document.getElementById('videoUrl')?.value.trim();
        const ytId = extractYouTubeId(videoUrl);

        if (!videoUrl) {
            UI.showToast('กรุณาระบุลิงก์วิดีโอ', 'error');
            if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'อัปเดตข้อมูลภาพยนตร์'; }
            return;
        }

        // --- Duplicate Video URL Check ---
        try {
            // 1. Check for duplicate in other movie documents
            const existingMovieQuery = query(
                collection(db, SCHEMA.COLLECTIONS.MOVIES),
                where('videoUrl', '==', videoUrl),
                where(documentId(), '!=', movieId), // Exclude current movie being edited
                limit(1)
            );
            const existingMovieSnap = await getDocs(existingMovieQuery);
            if (!existingMovieSnap.empty) {
                UI.showToast('ลิงก์วิดีโอนี้มีอยู่ในภาพยนตร์อื่นแล้ว', 'error');
                if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'อัปเดตข้อมูลภาพยนตร์'; }
                return;
            }

            // 2. Check for duplicate in series episodes (requires a collection group index on 'episodes' subcollection, field 'videoUrl')
            const existingEpisodeQuery = query(
                collectionGroup(db, 'episodes'),
                where('videoUrl', '==', videoUrl),
                limit(1)
            );
            const existingEpisodeSnap = await getDocs(existingEpisodeQuery);
            if (!existingEpisodeSnap.empty) {
                UI.showToast('ลิงก์วิดีโอนี้มีอยู่ในตอนของซีรีส์อื่นแล้ว', 'error');
                if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'อัปเดตข้อมูลภาพยนตร์'; }
                return;
            }
        } catch (err) {
            console.error('Duplicate video URL check error:', err);
            UI.showToast('เกิดข้อผิดพลาดในการตรวจสอบลิงก์วิดีโอ', 'error');
            if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'อัปเดตข้อมูลภาพยนตร์'; }
            return;
        }
        // --- End Duplicate Video URL Check ---

        const payload = {
            videoUrl,
            title: document.getElementById('title')?.value.trim(),
            category: document.getElementById('category')?.value,
            badge: document.getElementById('badge')?.value.trim(),
            description: document.getElementById('description')?.value.trim(),
            poster: selectedPoster || (ytId ? `https://i.ytimg.com/vi/${ytId}/maxresdefault.jpg` : ''),
            embedURL: ytId ? `https://www.youtube.com/embed/${ytId}` : '',
            updatedAt: serverTimestamp()
        };

        try {
            await updateDoc(doc(db, SCHEMA.COLLECTIONS.MOVIES, movieId), payload);
            await logActivity('UPDATE_MOVIE', { id: movieId, title: payload.title });
            UI.showToast('อัปเดตข้อมูลภาพยนตร์สำเร็จ', 'success');
            window.location.replace('/admin/admin-manage-movies.html');
        } catch (err) {
            console.error('Update error:', err);
            UI.showToast('เกิดข้อผิดพลาด: ' + err.message, 'error');
            if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'อัปเดตข้อมูลภาพยนตร์'; }
        }
    });
}

// ─── Delete ───────────────────────────────────────────────────────────────────
function initDeleteBtn() {
    const btn = document.getElementById('delete-btn');
    if (!btn) return;
    btn.addEventListener('click', async () => {
        if (!confirm(`ยืนยันการลบ "${movieData?.title || ''}"?\n\nการกระทำนี้ไม่สามารถย้อนคืนได้`)) return;
        try {
            await deleteDoc(doc(db, SCHEMA.COLLECTIONS.MOVIES, movieId));
            await logActivity('DELETE_MOVIE', { id: movieId, title: movieData?.title });
            window.location.replace('/admin/admin-manage-movies.html');
        } catch (err) {
            UI.showToast('เกิดข้อผิดพลาด: ' + err.message, 'error');
        }
    });
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function init() {
    initSidebar();
    const params = new URLSearchParams(window.location.search);
    movieId = params.get('id');
    if (!movieId) { window.location.replace('/admin/admin-manage-movies.html'); return; }

    try {
        await checkAdminAccess();
        await loadMovie();
        initLiveListeners();
        initForm();
        initDeleteBtn();
        if (window.lucide) window.lucide.createIcons();
    } catch (err) {
        console.error('[admin-edit-movie] Access Denied:', err);
        window.location.replace('/login.html');
    }
}

document.addEventListener('DOMContentLoaded', init);
