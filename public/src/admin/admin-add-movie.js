import { db, collection, addDoc, serverTimestamp, SCHEMA, logActivity } from './services/firebase.js';
import { ContentService } from './services/content-service.js';
import { UI } from './components/ui.js';
import { checkAdminAccess } from './middleware/auth-guard.js';

/**
 * 🎬 DUYดูDEE MOVIE REGISTRATION ENGINE
 * Unified Logic for High-Impact Content Onboarding
 */

// Module-scoped variables
let videoUrlInput, titleInput, descInput, posterPreview, selectedPosterUrlInput, thumbnailOptionsContainer, noPreview, previewTitle;

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const { user } = await checkAdminAccess();
        UI.setupSidebar(user);
        UI.initAdminSidebar();
        initForm();
    } catch (err) {
        console.error('Access Denied:', err);
    }
});

function initForm() {
    const form = document.getElementById('add-movie-form');
    videoUrlInput = document.getElementById('videoUrl');
    titleInput = document.getElementById('title');
    descInput = document.getElementById('description');
    posterPreview = document.getElementById('poster-preview');
    selectedPosterUrlInput = document.getElementById('selected-poster-url');
    thumbnailOptionsContainer = document.getElementById('thumbnail-options-container');
    noPreview = document.getElementById('no-preview');
    previewTitle = document.getElementById('preview-title');

    if (!form || !videoUrlInput) return;

    videoUrlInput.addEventListener('input', (e) => handleLinkProcess(e.target.value.trim()));
    
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

const handleLinkProcess = UI.debounce(async (url) => {
    if (!url) return;
    const videoId = UI.extractYouTubeId(url);
    if (!videoId) return;

    if (titleInput && titleInput.value.includes(url) && videoUrlInput && !videoUrlInput.value) {
        videoUrlInput.value = url;
    }

    if (previewTitle) previewTitle.innerText = 'กำลังดึงข้อมูลจากระบบ...';

    const thumb = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    if (posterPreview) { posterPreview.src = thumb; posterPreview.classList.remove('opacity-0'); }
    noPreview?.classList.add('hidden');
    if (selectedPosterUrlInput) selectedPosterUrlInput.value = thumb;

    renderThumbnailOptions([
        { url: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`, label: 'สูงสุด' },
        { url: `https://img.youtube.com/vi/${videoId}/sddefault.jpg`, label: 'มาตรฐาน' },
        { url: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`, label: 'สูง' }
    ], thumb);

    try {
        const result = await ContentService.checkDuplicateLink(url);
        if (result.exists) {
            UI.showToast(`🚨 ตรวจพบวิดีโอนี้ในระบบแล้ว! (${result.type === 'movie' ? 'ภาพยนตร์' : 'ซีรีส์'})`, 'warning');
            videoUrlInput.classList.add('border-yellow-500', 'ring-4', 'ring-yellow-500/10');
        } else {
            videoUrlInput.classList.remove('border-yellow-500', 'ring-4', 'ring-yellow-500/10');
        }
    } catch (err) { console.error(err); }

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
        <div onclick="window.UI.selectPoster('${thumb.url}', this)" class="relative flex-shrink-0 w-24 h-14 rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${thumb.url === currentSelectedUrl ? 'border-brand-primary shadow-lg' : 'border-white/10 hover:border-brand-primary/50'}">
            <img src="${thumb.url}" class="w-full h-full object-cover">
            <span class="absolute bottom-1 right-1 px-1 py-0.5 bg-black/70 text-white text-[8px] rounded-md Thai-font">${thumb.label}</span>
        </div>`).join('');
}

window.UI.selectPoster = (url, el) => {
    if (posterPreview) posterPreview.src = url;
    if (selectedPosterUrlInput) selectedPosterUrlInput.value = url;
    el.parentElement.querySelectorAll('.border-brand-primary').forEach(x => x.classList.remove('border-brand-primary', 'shadow-lg'));
    el.classList.add('border-brand-primary', 'shadow-lg');
};

async function handleAddMovie(e) {
    e.preventDefault();
    UI.setLoading(true);

    const formData = {
        videoUrl: videoUrlInput?.value.trim() || '',
        title: titleInput?.value.trim() || 'Untitled',
        category: document.getElementById('category').value,
        badge: document.getElementById('badge')?.value.trim() || 'HD',
        description: descInput?.value.trim() || ''
    };

    if (await isDuplicateContent(formData.videoUrl)) {
        UI.showToast('ขออภัย ลิงก์นี้มีอยู่ในระบบแล้ว', 'error');
        UI.setLoading(false);
        return;
    }

    const videoId = UI.extractYouTubeId(formData.videoUrl);
    if (!videoId) {
        UI.showToast('กรุณาระบุลิงก์ YouTube ที่ถูกต้อง', 'error');
        UI.setLoading(false);
        return;
    }

    try {
        await addDoc(collection(db, SCHEMA.COLLECTIONS.MOVIES), {
            ...formData,
            embedURL: `https://www.youtube.com/embed/${videoId}`,
            poster: selectedPosterUrlInput?.value || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
            views: 0,
            createdAt: serverTimestamp()
        });
        
        await logActivity('ADD_MOVIE', `เพิ่มหนังเรื่อง: ${formData.title}`);
        UI.showToast('บันทึกและเผยแพร่ข้อมูลสำเร็จ', 'success');
        setTimeout(() => window.location.href = './admin-manage-movies.html', 1500);
    } catch (error) {
        console.error('Save Error:', error);
        UI.showToast('เกิดข้อผิดพลาดในการบันทึก', 'error');
    } finally {
        UI.setLoading(false);
    }
}

async function isDuplicateContent(videoUrl) {
    const result = await ContentService.checkDuplicateLink(videoUrl);
    return result.exists;
}


