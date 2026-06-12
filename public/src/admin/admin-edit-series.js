import { db, doc, getDoc, updateDoc, collection, getDocs, query, orderBy, limit, writeBatch, SCHEMA, serverTimestamp, where, deleteDoc, logActivity } from '/src/services/firebase.js';
import { UI } from '/src/components/ui.js';
import { checkAdminAccess } from '/src/middleware/auth-guard.js';

/**
 * 📺 DUYดูDEE SERIES EDIT ENGINE
 * Unified Logic for High-Impact Series Updates.
 */

// Module-scoped variables
let episodeCount = 0;
let posterPreview;
let selectedPosterUrlInput;
let thumbnailOptionsContainer;
let seriesId;
let noPreview;
let previewTitle;

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const { user } = await checkAdminAccess();
        setupAdminProfile(user);
        
        const params = new URLSearchParams(window.location.search);
        seriesId = params.get('id');

        if (!seriesId) {
            UI.showToast('ไม่พบ ID ซีรีส์', 'error');
            setTimeout(() => window.location.href = './admin-manage-series.html', 1500);
            return;
        }

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

async function initForm() {
    setLoadingState(true);
    const form = document.getElementById('edit-series-form');
    const titleInput = document.getElementById('title');
    const categoryInput = document.getElementById('category');
    const badgeInput = document.getElementById('badge');
    const descriptionInput = document.getElementById('description');
    posterPreview = document.getElementById('poster-preview');
    selectedPosterUrlInput = document.getElementById('selected-poster-url');
    thumbnailOptionsContainer = document.getElementById('thumbnail-options-container');
    const addEpBtn = document.getElementById('add-episode-btn');
    const deleteBtn = document.getElementById('delete-btn');
    noPreview = document.getElementById('no-preview');
    previewTitle = document.getElementById('preview-title');

    if (!form) return;

    try {
        const seriesSnap = await getDoc(doc(db, SCHEMA.COLLECTIONS.SERIES, seriesId));
        if (seriesSnap.exists()) {
            const data = seriesSnap.data();
            titleInput.value = data.title || '';
            categoryInput.value = data.category || 'ซีรีส์แนวตั้ง';
            badgeInput.value = data.badge || '';
            descriptionInput.value = data.description || '';
            
            if (previewTitle) previewTitle.innerText = data.title || 'ยังไม่ได้ระบุชื่อ';

            if (posterPreview && data.poster) {
                posterPreview.src = data.poster;
                posterPreview.classList.remove('opacity-0');
                if (noPreview) noPreview.classList.add('hidden');
            }
            if (selectedPosterUrlInput) selectedPosterUrlInput.value = data.poster || '';

            // Load episodes
            const epSnap = await getDocs(query(collection(db, SCHEMA.COLLECTIONS.SERIES, seriesId, 'episodes'), orderBy('episodeNumber')));
            epSnap.forEach(epDoc => {
                const epData = epDoc.data();
                addEpisode(epData.title, epData.videoUrl);
            });
            if (epSnap.empty) addEpisode(); // Add one empty episode if none exist

            // Fetch Thumbnails for preview
            const firstEpUrl = epSnap.docs.length > 0 ? epSnap.docs[0].data().videoUrl : '';
            if (firstEpUrl) handleSmartFetch(firstEpUrl, data.poster);

        } else {
            UI.showToast('ไม่พบข้อมูลซีรีส์', 'error');
            setTimeout(() => window.location.href = './admin-manage-series.html', 1500);
            return;
        }
    } catch (error) {
        console.error('Error loading series:', error);
        UI.showToast('เกิดข้อผิดพลาดในการดึงข้อมูล', 'error');
    } finally {
        setLoadingState(false);
    }

    if (addEpBtn) addEpBtn.addEventListener('click', () => addEpisode());
    form.addEventListener('submit', handleUpdateSeries);

    if (deleteBtn) {
        deleteBtn.addEventListener('click', handleDeleteSeries);
    }
}

// Debounce helper inline
function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

function addEpisode(title = '', url = '') {
    episodeCount++;
    const container = document.getElementById('episode-container');
    const epDiv = document.createElement('div');
    epDiv.className = 'p-5 bg-black/40 border border-white/5 rounded-2xl space-y-4 animate-fade-in relative group';
    epDiv.innerHTML = `
        <div class="flex items-center justify-between">
            <span class="px-3 py-1 bg-brand-primary/20 text-brand-primary text-[10px] font-black uppercase rounded-lg border border-brand-primary/20">Episode ${episodeCount}</span>
            ${episodeCount > 1 ? '<button type="button" class="remove-ep-btn text-gray-600 hover:text-red-500 transition-colors"><i data-lucide="x-circle" class="w-5 h-5"></i></button>' : ''}
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
                <label class="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">ชื่อตอน</label>
                <input type="text" name="ep-title" value="${title || 'ตอนที่ ' + episodeCount}" class="w-full bg-brand-black/50 border border-white/10 rounded-xl py-3.5 px-4 text-white outline-none focus:border-brand-primary transition-all text-sm" required>
            </div>
            <div class="space-y-2">
                <label class="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">YouTube Video URL</label>
                <input type="url" name="ep-url" value="${url}" class="ep-url-input w-full bg-brand-black/50 border border-white/10 rounded-xl py-3.5 px-4 text-white outline-none focus:border-brand-primary transition-all text-sm" placeholder="https://..." required>
            </div>
        </div>
    `;
    container.appendChild(epDiv);
    
    // Reinitialize icons
    if (window.lucide) {
        window.lucide.createIcons();
    }

    const removeBtn = epDiv.querySelector('.remove-ep-btn');
    if (removeBtn) {
        removeBtn.onclick = () => {
            epDiv.remove();
            reindexEpisodes();
            updatePosterPreview();
        };
    }

    const urlInput = epDiv.querySelector('.ep-url-input');
    if (urlInput) {
        urlInput.addEventListener('input', debounce(() => {
            updatePosterPreview();
            // Auto-fetch if first episode
            const firstEp = container.querySelector('div:first-child');
            const isFirst = epDiv === firstEp;
            if (isFirst && urlInput.value) fetchSeriesInfo(urlInput.value.trim());
        }, 600));
    }
}

async function fetchSeriesInfo(url) {
    // Extract YouTube ID
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    const videoId = (match && match[2].length === 11) ? match[2] : null;

    if (!videoId) return;

    const titleInput = document.getElementById('title');
    const descInput = document.getElementById('description');
    const firstEpUrlInput = document.querySelector('.ep-url-input');

    try {
        const res = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`);
        if (res.ok) {
            const data = await res.json();
            if (titleInput && (!titleInput.value || titleInput.value.startsWith('http') || titleInput.value === url)) {
                titleInput.value = data.title || '';
                if (previewTitle) previewTitle.innerText = data.title || 'ยังไม่ได้ระบุชื่อ';
            }
            if (descInput && !descInput.value) descInput.value = data.title || '';
            if (firstEpUrlInput && !firstEpUrlInput.value) {
                firstEpUrlInput.value = url;
                updatePosterPreview();
            }
            UI.showToast('ดึงข้อมูล YouTube สำเร็จ', 'success');
        }
    } catch (err) {}
}

function handleSmartFetch(url, currentPoster) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    const videoId = (match && match[2].length === 11) ? match[2] : null;

    if (videoId) {
        renderThumbnailOptions([
            { url: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`, label: 'สูงสุด' },
            { url: `https://img.youtube.com/vi/${videoId}/sddefault.jpg`, label: 'มาตรฐาน' },
            { url: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`, label: 'สูง' }
        ], currentPoster);
    }
}

function reindexEpisodes() {
    const epDivs = document.querySelectorAll('#episode-container > div');
    episodeCount = 0;
    epDivs.forEach((div) => {
        episodeCount++;
        const badge = div.querySelector('.bg-brand-primary\\/20');
        if (badge) badge.innerText = `Episode ${episodeCount}`;
    });
}

function updatePosterPreview() {
    const firstUrlInput = document.querySelector('.ep-url-input');
    if (!firstUrlInput) return;
    
    // Extract YouTube ID
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = firstUrlInput.value.trim().match(regExp);
    const videoId = (match && match[2].length === 11) ? match[2] : null;

    if (videoId) {
        const thumb = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        if (posterPreview) { posterPreview.src = thumb; posterPreview.classList.remove('opacity-0'); }
        noPreview?.classList.add('hidden');
        if (selectedPosterUrlInput) selectedPosterUrlInput.value = thumb;
        
        renderThumbnailOptions([
            { url: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`, label: 'สูงสุด' },
            { url: `https://img.youtube.com/vi/${videoId}/sddefault.jpg`, label: 'มาตรฐาน' },
            { url: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`, label: 'สูง' }
        ], thumb);
    }
}

function renderThumbnailOptions(thumbnails, currentSelectedUrl) {
    if (!thumbnailOptionsContainer) return;
    thumbnailOptionsContainer.innerHTML = thumbnails.map(thumb => `
        <div onclick="window.selectPoster('${thumb.url}', this)" class="relative flex-shrink-0 w-24 h-14 rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${thumb.url === currentSelectedUrl ? 'border-brand-primary shadow-lg' : 'border-white/10 hover:border-brand-primary/50'}">
            <img src="${thumb.url}" class="w-full h-full object-cover">
            <span class="absolute bottom-1 right-1 px-1 py-0.5 bg-black/70 text-white text-[8px] rounded-md Thai-font">${thumb.label}</span>
        </div>`).join('');
}

window.selectPoster = (url, el) => {
    if (posterPreview) posterPreview.src = url;
    if (selectedPosterUrlInput) selectedPosterUrlInput.value = url;
    el.parentElement.querySelectorAll('.border-brand-primary').forEach(x => x.classList.remove('border-brand-primary', 'shadow-lg'));
    el.classList.add('border-brand-primary', 'shadow-lg');
};

function setLoadingState(loading) {
    const submitBtn = document.getElementById('submit-btn');
    if (submitBtn) {
        if (loading) {
            submitBtn.disabled = true;
            submitBtn.innerText = 'กำลังบันทึกข้อมูล...';
        } else {
            submitBtn.disabled = false;
            submitBtn.innerText = 'บันทึกซีรีส์และตอนทั้งหมด';
        }
    }
}

async function handleUpdateSeries(e) {
    e.preventDefault();
    setLoadingState(true);

    const title = document.getElementById('title').value.trim();
    const category = document.getElementById('category').value;
    const badge = document.getElementById('badge').value.trim() || 'NEW';
    const description = document.getElementById('description').value.trim();

    const episodeDivs = document.querySelectorAll('#episode-container > div');
    const episodes = [];
    const duplicateEps = [];

    // Extract YouTube ID helper function
    const extractId = (url) => {
        const reg = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(reg);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    for (let i = 0; i < episodeDivs.length; i++) {
        const div = episodeDivs[i];
        const epTitle = div.querySelector('[name="ep-title"]').value.trim();
        const epUrl = div.querySelector('.ep-url-input').value.trim();
        const videoId = extractId(epUrl);
        if (videoId) {
            // 🛡️ MANDATORY DUPLICATE CHECK (BLOCKING)
            try {
                const q = query(collection(db, SCHEMA.COLLECTIONS.MOVIES), where('videoUrl', '==', epUrl), limit(1));
                const snap = await getDocs(q);
                if (!snap.empty) {
                    duplicateEps.push(i + 1);
                    div.querySelector('.ep-url-input').classList.add('border-red-500');
                } else {
                    div.querySelector('.ep-url-input').classList.remove('border-red-500');
                    episodes.push({
                        title: epTitle,
                        episodeNumber: i + 1,
                        videoUrl: epUrl,
                        embedURL: `https://www.youtube.com/embed/${videoId}`
                    });
                }
            } catch (err) { console.error(err); }
        }
    }

    if (duplicateEps.length > 0) {
        UI.showToast(`ขออภัย พบลิ้งก์ซ้ำในตอนที่ ${duplicateEps.join(', ')}`, 'error');
        setLoadingState(false);
        return; // ⛔ STOP SUBMISSION
    }

    if (episodes.length === 0) {
        UI.showToast('กรุณาเพิ่มอย่างน้อย 1 ตอน', 'error');
        setLoadingState(false);
        return;
    }

    const firstVideoId = extractId(episodes[0].videoUrl);
    const poster = selectedPosterUrlInput?.value || `https://img.youtube.com/vi/${firstVideoId}/maxresdefault.jpg`;

    try {
        const batch = writeBatch(db);
        const seriesRef = doc(db, SCHEMA.COLLECTIONS.SERIES, seriesId);
        
        // 1. Update Series Doc
        batch.update(seriesRef, {
            title,
            description,
            category,
            badge: badge || 'NEW',
            poster,
            episodeCount: episodes.length,
            episodes: episodes,
            updatedAt: serverTimestamp()
        });

        // 2. Clear previous episodes subcollection and write new ones
        const oldEpsSnap = await getDocs(collection(db, SCHEMA.COLLECTIONS.SERIES, seriesId, 'episodes'));
        oldEpsSnap.forEach(epDoc => {
            batch.delete(epDoc.ref);
        });

        episodes.forEach(ep => {
            const epRef = doc(collection(db, SCHEMA.COLLECTIONS.SERIES, seriesId, 'episodes'));
            batch.set(epRef, { ...ep, createdAt: serverTimestamp() });
        });

        await batch.commit();

        await logActivity('EDIT_SERIES', `แก้ไขซีรีส์: ${title} (${episodes.length} ตอน)`);
        UI.showToast('แก้ไขข้อมูลซีรีส์สำเร็จ', 'success');
        setTimeout(() => window.location.href = './admin-manage-series.html', 1500);

    } catch (error) {
        console.error(error);
        UI.showToast('เกิดข้อผิดพลาดในการบันทึกข้อมูล', 'error');
    } finally {
        setLoadingState(false);
    }
}

async function handleDeleteSeries() {
    if (!confirm('🚨 คำเตือน: คุณต้องการลบซีรีส์นี้และตอนทั้งหมดจริงหรือไม่? การกระทำนี้ไม่สามารถย้อนคืนได้!')) return;

    UI.setLoading(true);

    try {
        const batch = writeBatch(db);
        
        // 1. Delete all episodes in subcollection
        const epSnap = await getDocs(collection(db, SCHEMA.COLLECTIONS.SERIES, seriesId, 'episodes'));
        epSnap.forEach(epDoc => {
            batch.delete(epDoc.ref);
        });

        // 2. Delete main series doc
        const seriesRef = doc(db, SCHEMA.COLLECTIONS.SERIES, seriesId);
        batch.delete(seriesRef);

        await batch.commit();

        await logActivity('DELETE_SERIES', `ลบซีรีส์ ID: ${seriesId}`);
        UI.showToast('ลบซีรีส์เรียบร้อยแล้ว', 'success');
        setTimeout(() => window.location.href = './admin-manage-series.html', 1500);
    } catch (error) {
        console.error('Error deleting series:', error);
        UI.showToast('เกิดข้อผิดพลาดในการลบซีรีส์', 'error');
        UI.setLoading(false);
    }
}
