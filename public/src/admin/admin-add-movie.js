import {
  db,
  collection,
  addDoc,
  serverTimestamp,
  SCHEMA,
  logActivity
} from '../services/firebase.js';
import { ContentService } from '../services/content-service.js';
import { UI } from '../components/ui.js';
import { BaseAdminController } from './base-admin-controller.js';
import { AdminUtils } from './admin-utils.js';

/**
 * 🎬 DUYดูDEE MOVIE REGISTRATION ENGINE
 * Refactored using BaseAdminController & AdminUtils
 */

class MovieController extends BaseAdminController {
  constructor() {
    super();
    this.elements = {};
  }

  setupForm() {
    const form = document.getElementById('add-movie-form');
    this.elements = {
      videoUrlInput: document.getElementById('videoUrl'),
      titleInput: document.getElementById('title'),
      descInput: document.getElementById('description'),
      posterPreview: document.getElementById('poster-preview'),
      selectedPosterUrlInput: document.getElementById('selected-poster-url'),
      thumbnailOptionsContainer: document.getElementById('thumbnail-options-container'),
      noPreview: document.getElementById('no-preview'),
      previewTitle: document.getElementById('preview-title')
    };

    if (!form || !this.elements.videoUrlInput) {
      return;
    }

    this.elements.videoUrlInput.addEventListener('input', (e) =>
      this.handleLinkProcess(e.target.value.trim())
    );
    this.elements.titleInput?.addEventListener('input', (e) => {
      const value = e.target.value.trim();
      if (value.startsWith('http')) {
        this.handleLinkProcess(value);
      } else if (this.elements.previewTitle) {
        this.elements.previewTitle.innerText = value || 'ยังไม่ได้ระบุชื่อเรื่อง';
      }
    });

    form.addEventListener('submit', (e) => this.handleAddMovie(e));
    window.UI.selectPoster = (url, el) => this.selectPoster(url, el);
  }

  handleLinkProcess = UI.debounce(async (url) => {
    if (!url) {
      return;
    }
    const videoId = AdminUtils.extractYouTubeId(url);
    if (!videoId) {
      return;
    }

    if (this.elements.previewTitle) {
      this.elements.previewTitle.innerText = 'กำลังดึงข้อมูล...';
    }

    // Set Preview
    const thumb = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    if (this.elements.posterPreview) {
      this.elements.posterPreview.src = thumb;
      this.elements.posterPreview.classList.remove('opacity-0');
    }
    this.elements.noPreview?.classList.add('hidden');
    if (this.elements.selectedPosterUrlInput) {
      this.elements.selectedPosterUrlInput.value = thumb;
    }

    AdminUtils.renderThumbnailOptions(
      this.elements.thumbnailOptionsContainer,
      AdminUtils.getThumbnailOptions(videoId),
      thumb,
      (posterUrl, el) => this.selectPoster(posterUrl, el)
    );

    // Check Duplicate & Fetch Info
    const [dupResult, youtubeData] = await Promise.all([
      ContentService.checkDuplicateLink(url),
      AdminUtils.fetchYouTubeInfo(url)
    ]);

    if (dupResult.exists) {
      UI.showToast('🚨 ตรวจพบวิดีโอนี้ในระบบแล้ว!', 'warning');
      this.elements.videoUrlInput.classList.add('border-yellow-500');
    }

    if (youtubeData) {
      if (
        this.elements.titleInput &&
        (!this.elements.titleInput.value || this.elements.titleInput.value.startsWith('http'))
      ) {
        this.elements.titleInput.value = youtubeData.title || '';
      }
      if (this.elements.previewTitle) {
        this.elements.previewTitle.innerText = youtubeData.title || 'ไม่พบชื่อเรื่อง';
      }
      UI.showToast('เชื่อมต่อข้อมูลสำเร็จ', 'success');
    }
  }, 800);

  selectPoster(url, el) {
    if (this.elements.posterPreview) {
      this.elements.posterPreview.src = url;
    }
    if (this.elements.selectedPosterUrlInput) {
      this.elements.selectedPosterUrlInput.value = url;
    }
    el.parentElement
      .querySelectorAll('.border-brand-primary')
      .forEach((x) => x.classList.remove('border-brand-primary', 'shadow-lg'));
    el.classList.add('border-brand-primary', 'shadow-lg');
  }

  async handleAddMovie(e) {
    e.preventDefault();
    UI.setLoading(true);

    const formData = {
      videoUrl: this.elements.videoUrlInput?.value.trim(),
      title: this.elements.titleInput?.value.trim(),
      category: document.getElementById('category').value,
      badge: document.getElementById('badge')?.value.trim() || 'HD',
      description: this.elements.descInput?.value.trim() || ''
    };

    try {
      const videoId = AdminUtils.extractYouTubeId(formData.videoUrl);
      await addDoc(collection(db, SCHEMA.COLLECTIONS.MOVIES), {
        ...formData,
        embedURL: `https://www.youtube.com/embed/${videoId}`,
        poster:
          this.elements.selectedPosterUrlInput?.value ||
          `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        views: 0,
        createdAt: serverTimestamp()
      });

      await logActivity('ADD_MOVIE', `เพิ่มหนังเรื่อง: ${formData.title}`);
      UI.showToast('บันทึกสำเร็จ', 'success');
      setTimeout(() => (window.location.href = './admin-manage-movies.html'), 1500);
    } catch (error) {
      UI.showToast('เกิดข้อผิดพลาด', 'error');
    } finally {
      UI.setLoading(false);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => new MovieController().init());
