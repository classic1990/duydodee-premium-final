import { db, collection, serverTimestamp, doc, SCHEMA, logActivity, writeBatch } from '../services/firebase.js';
import { ContentService } from '../services/content-service.js';
import { UI } from '../components/ui.js';
import { checkAdminAccess } from '../middleware/auth-guard.js';
import { injectAdminSidebar } from './sidebar-loader.js';
import { ValidationUtils } from '../utils/validation-utils.js';

/**
 * 📺 DUYดูDEE SERIES REGISTRATION ENGINE
 * Unified Logic for High-Impact Content Onboarding
 * @module admin-add-series
 */

let episodeCount = 0;
let posterPreview, noPreview, selectedPosterUrlInput, thumbnailOptionsContainer, previewTitle;

/**
 * Validates YouTube URL format (using ValidationUtils)
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid YouTube URL
 */
function isValidYouTubeUrl(url) {
    return ValidationUtils.isValidYouTubeURL(url);
}

/**
 * Sanitizes user input to prevent XSS (using ValidationUtils)
 * @param {string} input - Raw input string
 * @returns {string} Sanitized string
 */
function sanitizeInput(input) {
    return ValidationUtils.sanitizeString(input);
}

/**
 * Validates form data before submission
 * @param {Object} formData - Form data object
 * @returns {Object} Validation result with isValid and errors
 */
function validateFormData(formData) {
    const errors = [];

    if (!formData.title || formData.title.length < 2) {
        errors.push('กรุณาระบุชื่อเรื่องอย่างน้อย 2 ตัวอักษร');
    }

    if (formData.title.length > 200) {
        errors.push('ชื่อเรื่องต้องไม่เกิน 200 ตัวอักษร');
    }

    if (formData.description && formData.description.length > 1000) {
        errors.push('คำอธิบายต้องไม่เกิน 1000 ตัวอักษร');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const { user } = await checkAdminAccess();
        UI.setupSidebar(user);
        await injectAdminSidebar();
        UI.initAdminSidebar();
        initForm();
    } catch (err) {
        console.error('Access Denied:', err);
    }
});

function initForm() {
    const form = document.getElementById('add-series-form');
    const titleInput = document.getElementById('title');
    posterPreview = document.getElementById('poster-preview');
    noPreview = document.getElementById('no-preview');
    selectedPosterUrlInput = document.getElementById('selected-poster-url');
    thumbnailOptionsContainer = document.getElementById('thumbnail-options-container');
    previewTitle = document.getElementById('preview-title');

    if (!form) {
        return;
    }

    addEpisode();
    document.getElementById('add-episode-btn')?.addEventListener('click', () => addEpisode());

    titleInput?.addEventListener('input', (e) => {
        const value = e.target.value.trim();
        if (value.startsWith('http') || value.includes('youtube.com') || value.includes('youtu.be')) {
            fetchSeriesInfo(value);
        } else if (previewTitle) {
            previewTitle.innerText = value || 'ยังไม่ได้ระบุชื่อ';
        }
    });

    form.addEventListener('submit', handleAddSeries);
}

function addEpisode(title = '', url = '') {
    episodeCount++;
    const container = document.getElementById('episode-container');
    if (!container) {
        return;
    }

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
    UI.refreshIcons();

    epDiv.querySelector('.remove-ep-btn')?.addEventListener('click', () => {
        epDiv.remove();
        reindexEpisodes();
        updatePosterPreview();
    });

    epDiv.querySelector('.ep-url-input')?.addEventListener('input', UI.debounce(async () => {
        updatePosterPreview();
        if (epDiv === container.querySelector('div:first-child')) {
            fetchSeriesInfo(epDiv.querySelector('.ep-url-input').value.trim());
        }
    }, 600));
}

async function fetchSeriesInfo(url) {
    const videoId = UI.extractYouTubeId(url);
    if (!videoId) {
        return;
    }

    try {
        const res = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`);
        if (res.ok) {
            const data = await res.json();
            const titleInput = document.getElementById('title');
            if (titleInput && (!titleInput.value || titleInput.value.startsWith('http'))) {
                titleInput.value = data.title || '';
            }

            const descInput = document.getElementById('description');
            if (descInput && !descInput.value) {
                descInput.value = data.title || '';
            }

            UI.showToast('ดึงข้อมูล YouTube สำเร็จ', 'success');
        }
    } catch (err) {
        console.error(err);
    }
}

function reindexEpisodes() {
    const epDivs = document.querySelectorAll('#episode-container > div');
    episodeCount = 0;
    epDivs.forEach((div) => {
        episodeCount++;
        const badge = div.querySelector('.bg-brand-primary\/20');
        if (badge) {
            badge.innerText = `Episode ${episodeCount}`;
        }
    });
}

function updatePosterPreview() {
    const firstUrl = document.querySelector('.ep-url-input')?.value.trim();
    if (!firstUrl) {
        return;
    }
    const videoId = UI.extractYouTubeId(firstUrl);
    if (!videoId) {
        return;
    }

    const thumb = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    if (posterPreview) {
        posterPreview.src = thumb; posterPreview.classList.remove('opacity-0');
    }
    noPreview?.classList.add('hidden');
    if (selectedPosterUrlInput) {
        selectedPosterUrlInput.value = thumb;
    }

    renderThumbnailOptions([
        { url: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`, label: 'สูงสุด' },
        { url: `https://img.youtube.com/vi/${videoId}/sddefault.jpg`, label: 'มาตรฐาน' },
        { url: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`, label: 'สูง' }
    ], thumb);
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
    thumbnailOptionsContainer.innerHTML = '';
    thumbnails.forEach(thumb => {
        const div = document.createElement('div');
        div.className = `relative flex-shrink-0 w-24 h-14 rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${thumb.url === currentSelectedUrl ? 'border-brand-primary shadow-lg' : 'border-white/10 hover:border-brand-primary/50'}`;
        div.dataset.url = thumb.url;
        div.innerHTML = `
            <img src="${thumb.url}" class="w-full h-full object-cover" onerror="this.onerror=null;this.src='/assets/logo/DUYDODEE.png';">
            <span class="absolute bottom-1 right-1 px-1 py-0.5 bg-black/70 text-white text-[8px] rounded-md Thai-font">${thumb.label}</span>
        `;
        div.addEventListener('click', () => selectPoster(thumb.url, div));
        thumbnailOptionsContainer.appendChild(div);
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

/**
 * Handles series addition form submission
 * @param {Event} e - Form submit event
 * @returns {Promise<void>}
 */
async function handleAddSeries(e) {
    e.preventDefault();
    UI.setLoading(true);

    const formData = {
        title: sanitizeInput(document.getElementById('title').value),
        category: document.getElementById('category').value,
        badge: sanitizeInput(document.getElementById('badge')?.value || 'NEW'),
        description: sanitizeInput(document.getElementById('description').value)
    };

    // Validate form data
    const validation = validateFormData(formData);
    if (!validation.isValid) {
        UI.showToast(validation.errors.join(', '), 'error');
        UI.setLoading(false);
        return;
    }

    const episodeDivs = document.querySelectorAll('#episode-container > div');
    const episodes = [];
    const duplicateUrls = [];
    const invalidUrls = [];

    for (const [index, div] of episodeDivs.entries()) {
        const epTitle = sanitizeInput(div.querySelector('[name="ep-title"]').value);
        const epUrl = sanitizeInput(div.querySelector('.ep-url-input').value);
        const vid = UI.extractYouTubeId(epUrl);

        if (!epUrl || !isValidYouTubeUrl(epUrl)) {
            invalidUrls.push(`ตอนที่ ${index + 1}`);
            div.querySelector('.ep-url-input')?.classList.add('border-red-500', 'ring-4', 'ring-red-500/10');
        } else if (vid) {
            if (await isDuplicateContent(epUrl)) {
                duplicateUrls.push(`ตอนที่ ${index + 1}`);
                div.querySelector('.ep-url-input')?.classList.add('border-red-500', 'ring-4', 'ring-red-500/10');
            } else {
                div.querySelector('.ep-url-input')?.classList.remove('border-red-500', 'ring-4', 'ring-red-500/10');
                episodes.push({ title: epTitle, episodeNumber: index + 1, videoUrl: epUrl, embedURL: `https://www.youtube.com/embed/${vid}` });
            }
        }
    }

    if (invalidUrls.length > 0) {
        UI.showToast(`กรุณาระบุลิงก์ YouTube ที่ถูกต้อง: ${invalidUrls.join(', ')}`, 'error');
        UI.setLoading(false);
        return;
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
        const seriesRef = doc(collection(db, SCHEMA.COLLECTIONS.SERIES));

        batch.set(seriesRef, {
            ...formData,
            poster: selectedPosterUrlInput?.value || `https://img.youtube.com/vi/${UI.extractYouTubeId(episodes[0].videoUrl)}/maxresdefault.jpg`,
            episodeCount: episodes.length,
            views: 0,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        episodes.forEach(ep => {
            batch.set(doc(collection(db, SCHEMA.COLLECTIONS.SERIES, seriesRef.id, 'episodes')), { ...ep, createdAt: serverTimestamp() });
        });

        await batch.commit();
        await logActivity('ADD_SERIES', `เพิ่มซีรีส์ใหม่: ${formData.title} (${episodes.length} ตอน)`);
        UI.showToast('บันทึกและเผยแพร่ซีรีส์สำเร็จ', 'success');
        setTimeout(() => window.location.href = './admin-manage-series.html', 1500);
    } catch (error) {
        console.error(error);
        UI.showToast('เกิดข้อผิดพลาดในการบันทึกข้อมูล', 'error');
    } finally {
        UI.setLoading(false);
    }
}

async function isDuplicateContent(videoUrl) {
    const result = await ContentService.checkDuplicateLink(videoUrl);
    return result.exists;
}

