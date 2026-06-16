import { db, doc, getDoc, collection, collectionGroup, getDocs, writeBatch, SCHEMA, serverTimestamp, query, orderBy, where, limit, deleteDoc, logActivity } from '../services/firebase.js';
import { ContentService } from '../services/content-service.js';
import { UI } from '../components/ui.js';
import { checkAdminAccess } from '../middleware/auth-guard.js';
import { injectAdminSidebar } from './sidebar-loader.js';

/**
 * 📺 DUYดูDEE SERIES EDIT ENGINE
 * Unified Logic for High-Impact Content Editing
 */

let posterPreview, selectedPosterUrlInput, thumbnailOptionsContainer, seriesId;

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const { user } = await checkAdminAccess();
        UI.setupSidebar(user);
        await injectAdminSidebar();
        UI.initAdminSidebar();

        const params = new URLSearchParams(window.location.search);
        seriesId = params.get('id');

        if (!seriesId) {
            UI.showToast('ไม่พบรหัสซีรีส์', 'error');
            setTimeout(() => window.location.href = './admin-manage-series.html', 1500);
            return;
        }

        initForm();
    } catch (err) {
        console.error('Access Denied:', err);
    }
});

async function initForm() {
    UI.setLoading(true);
    const form = document.getElementById('edit-series-form');
    posterPreview = document.getElementById('poster-preview');
    selectedPosterUrlInput = document.getElementById('selected-poster-url');
    thumbnailOptionsContainer = document.getElementById('thumbnail-options-container');

    try {
        const seriesSnap = await getDoc(doc(db, SCHEMA.COLLECTIONS.SERIES, seriesId));
        if (seriesSnap.exists()) {
            const data = seriesSnap.data();
            document.getElementById('title').value = data.title || '';
            document.getElementById('category').value = data.category || 'ซีรีส์แนวตั้ง (ตอนเดียวจบ)';
            document.getElementById('badge').value = data.badge || '';
            document.getElementById('description').value = data.description || '';

            if (posterPreview) {
                posterPreview.src = data.poster || '';
                if (data.poster) {
                    posterPreview.classList.remove('opacity-0');
                }
            }
            if (selectedPosterUrlInput) {
                selectedPosterUrlInput.value = data.poster || '';
            }

            const epSnap = await getDocs(query(collection(db, SCHEMA.COLLECTIONS.SERIES, seriesId, 'episodes'), orderBy('episodeNumber')));
            epSnap.forEach(epDoc => {
                const epData = epDoc.data();
                addEpisode(epData.title, epData.videoUrl);
            });

            if (epSnap.empty) {
                addEpisode();
            }
            if (!epSnap.empty) {
                handleSmartFetch(epSnap.docs[0].data().videoUrl);
            }
        } else {
            UI.showToast('ไม่พบข้อมูลซีรีส์', 'error');
            window.location.href = './admin-manage-series.html';
        }
    } catch (error) {
        console.error('Fetch Error:', error);
    } finally {
        UI.setLoading(false);
    }

    document.getElementById('add-episode-btn')?.addEventListener('click', () => addEpisode());
    form.addEventListener('submit', handleUpdateSeries);
    document.getElementById('delete-btn')?.addEventListener('click', handleDeleteSeries);
}

function addEpisode(title = '', url = '') {
    const container = document.getElementById('episode-container');
    const epDiv = document.createElement('div');
    const epCount = container.children.length + 1;

    epDiv.className = 'p-5 bg-black/40 border border-white/5 rounded-2xl space-y-4 animate-fade-in relative group';
    epDiv.innerHTML = `
        <div class="flex items-center justify-between">
            <span class="px-3 py-1 bg-brand-primary/20 text-brand-primary text-[10px] font-black uppercase rounded-lg border border-brand-primary/20">Episode ${epCount}</span>
            ${epCount > 1 ? '<button type="button" class="remove-ep-btn text-gray-600 hover:text-red-500 transition-colors"><i data-lucide="x-circle" class="w-5 h-5"></i></button>' : ''}
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
                <label class="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">ชื่อตอน</label>
                <input type="text" name="ep-title" value="${title || 'ตอนที่ ' + epCount}" class="w-full bg-brand-black/50 border border-white/10 rounded-xl py-3.5 px-4 text-white outline-none focus:border-brand-primary transition-all text-sm" required>
            </div>
            <div class="space-y-2">
                <label class="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">YouTube Video URL</label>
                <input type="url" name="ep-url" value="${url}" class="ep-url-input w-full bg-brand-black/50 border border-white/10 rounded-xl py-3.5 px-4 text-white outline-none focus:border-brand-primary transition-all text-sm" placeholder="https://..." required>
            </div>
        </div>
    `;
    container.appendChild(epDiv);
    UI.refreshIcons();

    epDiv.querySelector('.remove-ep-btn')?.addEventListener('click', () => {
        epDiv.remove();
        reindexEpisodes();
    });

    epDiv.querySelector('.ep-url-input')?.addEventListener('input', UI.debounce(async () => {
        if (epDiv === container.querySelector('div:first-child')) {
            handleSmartFetch(epDiv.querySelector('.ep-url-input').value.trim());
        }
    }, 600));
}

async function handleSmartFetch(url) {
    const videoId = UI.extractYouTubeId(url);
    if (!videoId) {
        return;
    }

    const thumbnailSizes = [
        { url: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`, label: 'สูงสุด' },
        { url: `https://img.youtube.com/vi/${videoId}/sddefault.jpg`, label: 'มาตรฐาน' },
        { url: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`, label: 'สูง' }
    ];

    if (posterPreview && (!posterPreview.src || posterPreview.src === '' || !selectedPosterUrlInput?.value)) {
        posterPreview.src = thumbnailSizes[0].url;
        posterPreview.classList.remove('opacity-0');
    }

    if (selectedPosterUrlInput && !selectedPosterUrlInput.value) {
        selectedPosterUrlInput.value = thumbnailSizes[0].url;
    }

    renderThumbnailOptions(thumbnailSizes, selectedPosterUrlInput?.value || thumbnailSizes[0].url);
}

/**
 * Renders thumbnail selection options
 * @param {Array} thumbnails - Array of thumbnail objects with url and label
 * @param {string} currentSelectedUrl - Currently selected thumbnail URL
 */
function renderThumbnailOptions(thumbnails, currentSelectedUrl) {
    if (!thumbnailOptionsContainer) {
        return;
    }
    thumbnailOptionsContainer.innerHTML = thumbnails.map(thumb => `
        <div data-url="${thumb.url}" class="thumbnail-option relative flex-shrink-0 w-24 h-14 rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${thumb.url === currentSelectedUrl ? 'border-brand-primary shadow-lg' : 'border-white/10 hover:border-brand-primary/50'}">
            <img src="${thumb.url}" class="w-full h-full object-cover" onerror="this.onerror=null;this.src='/assets/logo/DUYDODEE.png';">
            <span class="absolute bottom-1 right-1 px-1 py-0.5 bg-black/70 text-white text-[8px] rounded-md Thai-font">${thumb.label}</span>
        </div>`).join('');

    // Add event listeners using event delegation
    thumbnailOptionsContainer.querySelectorAll('.thumbnail-option').forEach(el => {
        el.addEventListener('click', () => selectPoster(el.dataset.url, el));
    });
}

/**
 * Selects a poster thumbnail
 * @param {string} url - Thumbnail URL to select
 * @param {HTMLElement} el - Clicked element
 */
function selectPoster(url, el) {
    if (posterPreview) {
        posterPreview.src = url;
    }
    if (selectedPosterUrlInput) {
        selectedPosterUrlInput.value = url;
    }
    el.parentElement.querySelectorAll('.border-brand-primary').forEach(x => x.classList.remove('border-brand-primary', 'shadow-lg'));
    el.classList.add('border-brand-primary', 'shadow-lg');
}

function reindexEpisodes() {
    const epDivs = document.querySelectorAll('#episode-container > div');
    epDivs.forEach((div, index) => {
        const badge = div.querySelector('.bg-brand-primary\/20');
        if (badge) {
            badge.innerText = `Episode ${index + 1}`;
        }
    });
}

async function handleUpdateSeries(e) {
    e.preventDefault();
    UI.setLoading(true);

    const formData = {
        title: document.getElementById('title').value.trim(),
        category: document.getElementById('category').value,
        badge: document.getElementById('badge')?.value.trim() || 'NEW',
        description: document.getElementById('description').value.trim()
    };

    const episodeDivs = document.querySelectorAll('#episode-container > div');
    const episodes = [];
    const duplicateUrls = [];

    for (const [index, div] of episodeDivs.entries()) {
        const epTitle = div.querySelector('[name="ep-title"]').value.trim();
        const epUrl = div.querySelector('.ep-url-input').value.trim();
        const vid = UI.extractYouTubeId(epUrl);

        if (vid) {
            if (await isDuplicateContent(epUrl)) {
                duplicateUrls.push(`ตอนที่ ${index + 1}`);
                div.querySelector('.ep-url-input').classList.add('border-red-500', 'ring-4', 'ring-red-500/10');
            } else {
                div.querySelector('.ep-url-input').classList.remove('border-red-500', 'ring-4', 'ring-red-500/10');
                episodes.push({ title: epTitle, episodeNumber: index + 1, videoUrl: epUrl, embedURL: `https://www.youtube.com/embed/${vid}` });
            }
        }
    }

    if (duplicateUrls.length > 0) {
        UI.showToast(`ขออภัยพบลิ้งก์ซ้ำในระบบ: ${duplicateUrls.join(', ')}`, 'error');
        UI.setLoading(false);
        return;
    }

    if (episodes.length === 0) {
        UI.showToast('กรุณาเพิ่มอย่างน้อย 1 ตอน', 'error');
        UI.setLoading(false);
        return;
    }

    try {
        const batch = writeBatch(db);
        batch.update(doc(db, SCHEMA.COLLECTIONS.SERIES, seriesId), {
            ...formData,
            poster: selectedPosterUrlInput?.value || `https://img.youtube.com/vi/${UI.extractYouTubeId(episodes[0].videoUrl)}/maxresdefault.jpg`,
            episodeCount: episodes.length,
            updatedAt: serverTimestamp()
        });

        const oldEpSnap = await getDocs(collection(db, SCHEMA.COLLECTIONS.SERIES, seriesId, 'episodes'));
        oldEpSnap.forEach(d => batch.delete(d.ref));

        episodes.forEach(ep => {
            batch.set(doc(collection(db, SCHEMA.COLLECTIONS.SERIES, seriesId, 'episodes')), { ...ep, createdAt: serverTimestamp() });
        });

        await batch.commit();
        await logActivity('EDIT_SERIES', `อัปเดตซีรีส์: ${formData.title}`);
        UI.showToast('อัปเดตซีรีส์สำเร็จ', 'success');
        setTimeout(() => window.location.href = './admin-manage-series.html', 1500);
    } catch (error) {
        console.error(error);
        UI.showToast('เกิดข้อผิดพลาดในการบันทึกข้อมูล', 'error');
    } finally {
        UI.setLoading(false);
    }
}

async function handleDeleteSeries() {
    // eslint-disable-next-line no-alert
    if (confirm('คุณต้องการลบซีรีส์ชุดนี้ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้')) {
        UI.setLoading(true);
        try {
            await deleteDoc(doc(db, SCHEMA.COLLECTIONS.SERIES, seriesId));
            UI.showToast('ลบซีรีส์เรียบร้อยแล้ว', 'success');
            setTimeout(() => window.location.href = './admin-manage-series.html', 1500);
        } catch (error) {
            console.error('Error deleting series:', error);
            UI.showToast('เกิดข้อผิดพลาดในการลบข้อมูล', 'error');
            UI.setLoading(false);
        }
    }
}

async function isDuplicateContent(videoUrl) {
    const result = await ContentService.checkDuplicateLink(videoUrl);
    if (result.exists) {
        // If it's a movie, it's definitely a duplicate for this series
        if (result.type === 'movie') {
            return true;
        }

        // If it's another series episode, we need to check if it's from THIS series or another one
        // Note: For series, we allow duplicate links WITHIN the same series (unlikely but possible)
        // OR we check if the parent series ID is different.
        // For simplicity and strictness, if it exists in 'episodes' group, we check the path.
        const q = query(collectionGroup(db, 'episodes'), where('videoUrl', '==', videoUrl), limit(1));
        const snap = await getDocs(q);
        if (!snap.empty) {
            const epDoc = snap.docs[0];
            const parentSeriesId = epDoc.ref.parent.parent.id;
            return parentSeriesId !== seriesId;
        }
    }
    return false;
}

