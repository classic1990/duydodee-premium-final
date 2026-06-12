import { db, collection, addDoc, serverTimestamp, query, where, getDocs, SCHEMA, limit, logActivity } from '/src/services/firebase.js';
import { UI } from '/src/components/ui.js';
import { checkAdminAccess } from '/src/middleware/auth-guard.js';

/**
 * 🎬 DUYดูDEE MOVIE REGISTRATION ENGINE
 * Unified Logic for High-Impact Content Onboarding
 */

let videoUrlInput;
let titleInput;
let categoryInput;
let badgeInput;
let descInput;
let posterPreview;
let selectedPosterUrlInput;
let thumbnailOptionsContainer;
let noPreview;
let previewTitle;

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const { user } = await checkAdminAccess();
        // Since UI.setupSidebar is not in UI, let's see how sidebar profile is loaded or do it inline
        setupAdminProfile(user);
        initForm();
    } catch (err) {
        console.error('Access Denied:', err);
        window.location.href = '/login.html';
    }
});

function setupAdminProfile(user) {
    const profileContainer = document.getElementById('admin-sidebar-profile');
    if (profileContainer) {
        profileContainer.innerHTML = `
            <div class="flex items-center gap-3">
                <img src="${user.photoURL || '/assets/logo/DUYDODEE.png'}" class="w-10 h-10 rounded-xl object-cover border border-white/10">
                <div class="truncate">
                    <p class="text-xs font-bold text-white leading-tight">${user.displayName || 'Admin'}</p>
                    <p class="text-[9px] text-gray-500 truncate">${user.email}</p>
                </div>
            </div>
        `;
    }
}

function initForm() {
    const form = document.getElementById('add-movie-form');
    videoUrlInput = document.getElementById('videoUrl');
    titleInput = document.getElementById('title');
    categoryInput = document.getElementById('category');
    badgeInput = document.getElementById('badge');
    descInput = document.getElementById('description');
    posterPreview = document.getElementById('poster-preview');
    selectedPosterUrlInput = document.getElementById('selected-poster-url');
    thumbnailOptionsContainer = document.getElementById('thumbnail-options-container');
    noPreview = document.getElementById('no-preview');
    previewTitle = document.getElementById('preview-title');

    if (!form || !videoUrlInput) return;

    // Listen for link input
    videoUrlInput.addEventListener('input', (e) => handleLinkProcess(e.target.value.trim()));
    
    // Support pasting link in title field
    titleInput?.addEventListener('input', (e) => {
        const value = e.target.value.trim();
        if (value.startsWith('http') || value.includes('youtube.com') || value.includes('youtu.be')) {
            handleLinkProcess(value);
        } else if (previewTitle) {
            previewTitle.innerText = value || 'ยังไม่ได้ระบุชื่อเรื่อง';
        }
    });

    form.addEventListener('submit', handleAddMovie);
}

// Debounce helper inline
function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

const handleLinkProcess = debounce(async (url) => {
    if (!url) return;
    
    // Extract YouTube ID using a regex helper
    // Regex for youtube ID: /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    const videoId = (match && match[2].length === 11) ? match[2] : null;

    if (!videoId) return;

    // Auto-sync fields
    if (titleInput && titleInput.value.includes(url) && videoUrlInput && !videoUrlInput.value) {
        videoUrlInput.value = url;
    }

    if (previewTitle) previewTitle.innerText = 'กำลังดึงข้อมูลจากระบบ...';

    // Update Poster Thumbnails
    const thumb = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    if (posterPreview) { posterPreview.src = thumb; posterPreview.classList.remove('opacity-0'); }
    noPreview?.classList.add('hidden');
    if (selectedPosterUrlInput) selectedPosterUrlInput.value = thumb;

    renderThumbnailOptions([
        { url: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`, label: 'สูงสุด' },
        { url: `https://img.youtube.com/vi/${videoId}/sddefault.jpg`, label: 'มาตรฐาน' },
        { url: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`, label: 'สูง' }
    ], thumb);

    // 🛡️ REAL-TIME DUPLICATE CHECK
    try {
        const q = query(collection(db, SCHEMA.COLLECTIONS.MOVIES), where('videoUrl', '==', url), limit(1));
        const snap = await getDocs(q);
        if (!snap.empty) {
            UI.showToast('🚨 ตรวจพบวิดีโอนี้ในระบบแล้ว! กรุณาตรวจสอบอีกครั้ง', 'warning');
            videoUrlInput.classList.add('border-yellow-500', 'ring-4', 'ring-yellow-500/10');
        } else {
            videoUrlInput.classList.remove('border-yellow-500', 'ring-4', 'ring-yellow-500/10');
        }
    } catch (err) {}

    // Fetch Meta
    try {
        const response = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`);
        if (response.ok) {
            const data = await response.json();
            if (titleInput && (!titleInput.value || titleInput.value.startsWith('http') || titleInput.value === url)) {
                titleInput.value = data.title || '';
                if (previewTitle) previewTitle.innerText = data.title || 'ยังไม่ได้ระบุชื่อเรื่อง';
            }
            UI.showToast('เชื่อมต่อข้อมูล YouTube สำเร็จ', 'success');
        }
    } catch (err) { if (previewTitle) previewTitle.innerText = 'ไม่พบชื่อเรื่องอัตโนมัติ'; }
}, 800);

function renderThumbnailOptions(thumbnails, currentSelectedUrl) {
    if (!thumbnailOptionsContainer) return;
    thumbnailOptionsContainer.innerHTML = thumbnails.map(thumb => `
        <div onclick="window.selectPoster('${thumb.url}', this)" class="relative flex-shrink-0 w-24 h-14 rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${thumb.url === currentSelectedUrl ? 'border-brand-primary shadow-lg' : 'border-white/10 hover:border-brand-primary/50'}">
            <img src="${thumb.url}" class="w-full h-full object-cover">
            <span class="absolute bottom-1 right-1 px-1 py-0.5 bg-black/70 text-white text-[8px] rounded-md Thai-font">${thumb.label}</span>
        </div>`).join('');
}

// Global UI Helper
window.selectPoster = (url, el) => {
    if (posterPreview) posterPreview.src = url;
    if (selectedPosterUrlInput) selectedPosterUrlInput.value = url;
    el.parentElement.querySelectorAll('.border-brand-primary').forEach(x => x.classList.remove('border-brand-primary', 'shadow-lg'));
    el.classList.add('border-brand-primary', 'shadow-lg');
};

// Set Loading helper
function setLoadingState(loading) {
    const submitBtn = document.getElementById('submit-btn');
    if (submitBtn) {
        if (loading) {
            submitBtn.disabled = true;
            submitBtn.innerText = 'กำลังบันทึกข้อมูล...';
        } else {
            submitBtn.disabled = false;
            submitBtn.innerText = 'บันทึกภาพยนตร์และเผยแพร่';
        }
    }
}

async function handleAddMovie(e) {
    e.preventDefault();
    setLoadingState(true);

    const videoUrl = videoUrlInput?.value.trim() || '';
    const title = titleInput?.value.trim() || 'Untitled';
    const category = document.getElementById('category').value;
    const badge = document.getElementById('badge')?.value.trim() || 'HD';
    const description = descInput?.value.trim() || '';

    // 🛡️ BLOCK DUPLICATE SAVE
    try {
        const q = query(collection(db, SCHEMA.COLLECTIONS.MOVIES), where('videoUrl', '==', videoUrl), limit(1));
        const snap = await getDocs(q);
        if (!snap.empty) {
            UI.showToast('ขออภัย ลิงก์นี้มีอยู่ในระบบแล้ว ไม่สามารถบันทึกซ้ำได้', 'error');
            setLoadingState(false);
            return;
        }
    } catch (err) {}

    // Extract YouTube ID
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = videoUrl.match(regExp);
    const videoId = (match && match[2].length === 11) ? match[2] : null;

    if (!videoId) {
        UI.showToast('กรุณาระบุลิงก์ YouTube ที่ถูกต้อง', 'error');
        setLoadingState(false);
        return;
    }

    try {
        await addDoc(collection(db, SCHEMA.COLLECTIONS.MOVIES), {
            title, description, category,
            badge,
            videoUrl,
            embedURL: `https://www.youtube.com/embed/${videoId}`,
            poster: selectedPosterUrlInput?.value || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
            views: 0,
            createdAt: serverTimestamp()
        });
        
        await logActivity('ADD_MOVIE', `เพิ่มหนังเรื่อง: ${title}`);
        UI.showToast('บันทึกและเผยแพร่ข้อมูลสำเร็จ', 'success');
        setTimeout(() => window.location.href = './admin-manage-movies.html', 1500);
    } catch (error) {
        console.error('Error adding movie:', error);
        UI.showToast('เกิดข้อผิดพลาดในการบันทึก', 'error');
    } finally {
        setLoadingState(false);
    }
}
