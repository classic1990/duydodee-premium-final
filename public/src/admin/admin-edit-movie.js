import {
  db,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  SCHEMA,
  collection,
  query,
  where,
  getDocs,
  limit
} from '../services/firebase.js';
import { ContentService } from '../services/content-service.js';
import { UI } from '../components/ui.js';
import { checkAdminAccess } from '../middleware/auth-guard.js';

/**
 * 🎬 DUYดูDEE MOVIE EDIT ENGINE
 * Unified Logic for High-Impact Content Editing
 */

let videoUrlInput,
  titleInput,
  posterPreview,
  selectedPosterUrlInput,
  thumbnailOptionsContainer,
  movieId;

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const { user } = await checkAdminAccess();
    UI.setupSidebar(user);
    UI.initAdminSidebar();

    const params = new URLSearchParams(window.location.search);
    movieId = params.get('id');

    if (!movieId) {
      UI.showToast('ไม่พบรหัสภาพยนตร์', 'error');
      setTimeout(() => (window.location.href = './admin-manage-movies.html'), 1500);
      return;
    }

    initForm();
  } catch (err) {
    console.error('Access Denied:', err);
  }
});

async function initForm() {
  UI.setLoading(true);
  const form = document.getElementById('edit-movie-form');
  videoUrlInput = document.getElementById('videoUrl');
  titleInput = document.getElementById('title');
  const categoryInput = document.getElementById('category');
  const badgeInput = document.getElementById('badge');
  const descriptionInput = document.getElementById('description');
  posterPreview = document.getElementById('poster-preview');
  selectedPosterUrlInput = document.getElementById('selected-poster-url');
  thumbnailOptionsContainer = document.getElementById('thumbnail-options-container');

  if (!form || !videoUrlInput) {
    return;
  }

  try {
    const movieSnap = await getDoc(doc(db, SCHEMA.COLLECTIONS.MOVIES, movieId));
    if (movieSnap.exists()) {
      const data = movieSnap.data();
      if (videoUrlInput) {
        videoUrlInput.value = data.videoUrl || '';
      }
      if (titleInput) {
        titleInput.value = data.title || '';
      }
      if (categoryInput) {
        categoryInput.value = data.category || 'ซีรีส์แนวตั้ง (ตอนเดียวจบ)';
      }
      if (badgeInput) {
        badgeInput.value = data.badge || '';
      }
      if (descriptionInput) {
        descriptionInput.value = data.description || '';
      }
      if (posterPreview) {
        posterPreview.src = data.poster || '';
        if (data.poster) {
          posterPreview.classList.remove('opacity-0');
        }
      }
      if (selectedPosterUrlInput) {
        selectedPosterUrlInput.value = data.poster || '';
      }

      videoUrlInput?.addEventListener(
        'input',
        UI.debounce((e) => handleSmartFetch(e.target.value.trim()), 600)
      );
      handleSmartFetch(data.videoUrl);
    } else {
      UI.showToast('ไม่พบข้อมูลภาพยนตร์', 'error');
      window.location.href = './admin-manage-movies.html';
    }
  } catch (error) {
    console.error('Fetch Error:', error);
  } finally {
    UI.setLoading(false);
  }

  form.addEventListener('submit', handleUpdateMovie);
  document.getElementById('delete-btn')?.addEventListener('click', handleDeleteMovie);
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

  if (
    posterPreview &&
    (!posterPreview.src || posterPreview.src === '' || !selectedPosterUrlInput?.value)
  ) {
    posterPreview.src = thumbnailSizes[0].url;
    posterPreview.classList.remove('opacity-0');
  }

  if (selectedPosterUrlInput && !selectedPosterUrlInput.value) {
    selectedPosterUrlInput.value = thumbnailSizes[0].url;
  }

  renderThumbnailOptions(thumbnailSizes, selectedPosterUrlInput?.value || thumbnailSizes[0].url);

  const result = await ContentService.checkDuplicateLink(url);
  if (result.exists && (result.type !== 'movie' || result.data?.id !== movieId)) {
    UI.showToast(
      `ตรวจพบลิงก์นี้ใน${result.type === 'movie' ? 'ภาพยนตร์' : 'ซีรีส์'}เรื่องอื่นแล้ว!`,
      'warning'
    );
    videoUrlInput.classList.add('border-red-500');
  } else {
    videoUrlInput.classList.remove('border-red-500');
  }
}

function renderThumbnailOptions(thumbnails, currentSelectedUrl) {
  if (!thumbnailOptionsContainer) {
    return;
  }
  thumbnailOptionsContainer.innerHTML = thumbnails
    .map(
      (thumb) => `
        <div onclick="window.UI.selectPoster('${thumb.url}', this)" class="relative flex-shrink-0 w-24 h-14 rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${thumb.url === currentSelectedUrl ? 'border-brand-primary shadow-lg' : 'border-white/10 hover:border-brand-primary/50'}">
            <img src="${thumb.url}" class="w-full h-full object-cover" onerror="this.onerror=null;this.src='/assets/logo/DUYDODEE.png';">
            <span class="absolute bottom-1 right-1 px-1 py-0.5 bg-black/70 text-white text-[8px] rounded-md">${thumb.label}</span>
        </div>`
    )
    .join('');
}

window.UI.selectPoster = (url, el) => {
  if (posterPreview) {
    posterPreview.src = url;
  }
  if (selectedPosterUrlInput) {
    selectedPosterUrlInput.value = url;
  }
  el.parentElement
    .querySelectorAll('.border-brand-primary')
    .forEach((x) => x.classList.remove('border-brand-primary', 'shadow-lg'));
  el.classList.add('border-brand-primary', 'shadow-lg');
};

async function handleUpdateMovie(e) {
  e.preventDefault();
  UI.setLoading(true);

  const formData = {
    title: titleInput?.value.trim() || '',
    category: document.getElementById('category')?.value || '',
    badge: document.getElementById('badge')?.value.trim() || 'HD',
    description: document.getElementById('description')?.value.trim() || '',
    videoUrl: videoUrlInput?.value.trim() || ''
  };

  if (await isDuplicateContent(formData.videoUrl)) {
    UI.showToast('ขออภัย ลิงก์นี้มีอยู่ในเรื่องอื่นแล้ว', 'error');
    UI.setLoading(false);
    return;
  }

  const videoId = UI.extractYouTubeId(formData.videoUrl);
  if (!videoId) {
    UI.showToast('กรุณาระบุ YouTube URL ที่ถูกต้อง', 'error');
    UI.setLoading(false);
    return;
  }

  try {
    await updateDoc(doc(db, SCHEMA.COLLECTIONS.MOVIES, movieId), {
      ...formData,
      embedURL: `https://www.youtube.com/embed/${videoId}`,
      poster: selectedPosterUrlInput?.value || '',
      updatedAt: new Date()
    });
    UI.showToast('อัปเดตข้อมูลเรียบร้อยแล้ว!', 'success');
    setTimeout(() => (window.location.href = './admin-manage-movies.html'), 1500);
  } catch (error) {
    console.error('Save Error:', error);
    UI.showToast('เกิดข้อผิดพลาดในการบันทึกข้อมูล', 'error');
  } finally {
    UI.setLoading(false);
  }
}

async function handleDeleteMovie() {
  if (confirm('คุณต้องการลบภาพยนตร์เรื่องนี้ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้')) {
    UI.setLoading(true);
    try {
      await deleteDoc(doc(db, SCHEMA.COLLECTIONS.MOVIES, movieId));
      UI.showToast('ลบภาพยนตร์เรียบร้อยแล้ว', 'success');
      setTimeout(() => (window.location.href = './admin-manage-movies.html'), 1500);
    } catch (error) {
      console.error('Error deleting movie:', error);
      UI.showToast('เกิดข้อผิดพลาดในการลบข้อมูล', 'error');
      UI.setLoading(false);
    }
  }
}

async function isDuplicateContent(videoUrl) {
  const result = await ContentService.checkDuplicateLink(videoUrl);
  // If it exists in another collection or is a different movie ID
  if (result.exists) {
    if (result.type !== 'movie') {
      return true;
    }
    // Search again to get the document ID (checkDuplicateLink returns data but maybe not ID if not handled)
    // Let's refine checkDuplicateLink later to return ID too. For now, assume data has ID if we added it.
    // Actually, let's just re-query here for simplicity in edit mode.
    const q = query(
      collection(db, SCHEMA.COLLECTIONS.MOVIES),
      where('videoUrl', '==', videoUrl),
      limit(5)
    );
    const snap = await getDocs(q);
    return snap.docs.filter((d) => d.id !== movieId).length > 0;
  }
  return false;
}
