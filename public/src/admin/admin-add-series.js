import {
  db,
  collection,
  serverTimestamp,
  doc,
  SCHEMA,
  logActivity,
  writeBatch
} from '../services/firebase.js';
import { ContentService } from '../services/content-service.js';
import { UI } from '../components/ui.js';
import { BaseAdminController } from './base-admin-controller.js';
import { AdminUtils } from './admin-utils.js';

/**
 * 📺 DUYดูDEE SERIES REGISTRATION ENGINE
 * Refactored using BaseAdminController & AdminUtils
 */

class SeriesController extends BaseAdminController {
  constructor() {
    super();
    this.elements = {};
    this.episodeCount = 0;
  }

  setupForm() {
    const form = document.getElementById('add-series-form');
    this.elements = {
      titleInput: document.getElementById('title'),
      descInput: document.getElementById('description'),
      posterPreview: document.getElementById('poster-preview'),
      selectedPosterUrlInput: document.getElementById('selected-poster-url'),
      thumbnailOptionsContainer: document.getElementById('thumbnail-options-container'),
      noPreview: document.getElementById('no-preview'),
      previewTitle: document.getElementById('preview-title'),
      episodeContainer: document.getElementById('episode-container')
    };

    if (!form) {
      return;
    }

    this.addEpisode();
    document.getElementById('add-episode-btn')?.addEventListener('click', () => this.addEpisode());

    this.elements.titleInput?.addEventListener('input', (e) => {
      const value = e.target.value.trim();
      if (value.startsWith('http')) {
        this.fetchSeriesInfo(value);
      } else if (this.elements.previewTitle) {
        this.elements.previewTitle.innerText = value || 'ยังไม่ได้ระบุชื่อ';
      }
    });

    form.addEventListener('submit', (e) => this.handleAddSeries(e));
    window.UI.selectPoster = (url, el) => this.selectPoster(url, el);
  }

  addEpisode(title = '', url = '') {
    this.episodeCount++;
    const container = this.elements.episodeContainer;
    if (!container) {
      return;
    }

    const epDiv = document.createElement('div');
    epDiv.className =
      'p-5 bg-black/40 border border-white/5 rounded-2xl space-y-4 animate-fade-in relative group';
    epDiv.innerHTML = `
            <div class="flex items-center justify-between">
                <span class="px-3 py-1 bg-brand-primary/20 text-brand-primary text-[10px] font-black uppercase rounded-lg border border-brand-primary/20">Episode ${this.episodeCount}</span>
                ${this.episodeCount > 1 ? '<button type="button" class="remove-ep-btn text-gray-600 hover:text-red-500 transition-colors"><i data-lucide="x-circle" class="w-5 h-5"></i></button>' : ''}
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-2">
                    <label class="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">ชื่อตอน</label>
                    <input type="text" name="ep-title" value="${title || 'ตอนที่ ' + this.episodeCount}" class="w-full bg-brand-black/50 border border-white/10 rounded-xl py-3.5 px-4 text-white outline-none focus:border-brand-primary transition-all text-sm" required>
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
      this.reindexEpisodes();
      this.updatePosterPreview();
    });

    epDiv.querySelector('.ep-url-input')?.addEventListener(
      'input',
      UI.debounce(async () => {
        this.updatePosterPreview();
        if (epDiv === container.querySelector('div:first-child')) {
          this.fetchSeriesInfo(epDiv.querySelector('.ep-url-input').value.trim());
        }
      }, 600)
    );
  }

  async fetchSeriesInfo(url) {
    const data = await AdminUtils.fetchYouTubeInfo(url);
    if (data) {
      if (
        this.elements.titleInput &&
        (!this.elements.titleInput.value || this.elements.titleInput.value.startsWith('http'))
      ) {
        this.elements.titleInput.value = data.title || '';
      }
      if (this.elements.descInput && !this.elements.descInput.value) {
        this.elements.descInput.value = data.title || '';
      }
      UI.showToast('ดึงข้อมูล YouTube สำเร็จ', 'success');
    }
  }

  reindexEpisodes() {
    const epDivs = document.querySelectorAll('#episode-container > div');
    this.episodeCount = 0;
    epDivs.forEach((div) => {
      this.episodeCount++;
      const badge = div.querySelector('.bg-brand-primary\/20');
      if (badge) {
        badge.innerText = `Episode ${this.episodeCount}`;
      }
    });
  }

  updatePosterPreview() {
    const firstUrl = document.querySelector('.ep-url-input')?.value.trim();
    if (!firstUrl) {
      return;
    }
    const videoId = AdminUtils.extractYouTubeId(firstUrl);
    if (!videoId) {
      return;
    }

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
      (url, el) => this.selectPoster(url, el)
    );
  }

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

  async handleAddSeries(e) {
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
      const vid = AdminUtils.extractYouTubeId(epUrl);

      if (vid) {
        if ((await ContentService.checkDuplicateLink(epUrl)).exists) {
          duplicateUrls.push(`ตอนที่ ${index + 1}`);
          div
            .querySelector('.ep-url-input')
            .classList.add('border-red-500', 'ring-4', 'ring-red-500/10');
        } else {
          div
            .querySelector('.ep-url-input')
            .classList.remove('border-red-500', 'ring-4', 'ring-red-500/10');
          episodes.push({
            title: epTitle,
            episodeNumber: index + 1,
            videoUrl: epUrl,
            embedURL: `https://www.youtube.com/embed/${vid}`
          });
        }
      }
    }

    if (duplicateUrls.length > 0) {
      UI.showToast(`ขออภัยพบลิ้งก์ซ้ำ: ${duplicateUrls.join(', ')}`, 'error');
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
        poster:
          this.elements.selectedPosterUrlInput?.value ||
          `https://img.youtube.com/vi/${AdminUtils.extractYouTubeId(episodes[0].videoUrl)}/maxresdefault.jpg`,
        episodeCount: episodes.length,
        views: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      episodes.forEach((ep) => {
        batch.set(doc(collection(db, SCHEMA.COLLECTIONS.SERIES, seriesRef.id, 'episodes')), {
          ...ep,
          createdAt: serverTimestamp()
        });
      });

      await batch.commit();
      await logActivity(
        'ADD_SERIES',
        `เพิ่มซีรีส์ใหม่: ${formData.title} (${episodes.length} ตอน)`
      );
      UI.showToast('บันทึกสำเร็จ', 'success');
      setTimeout(() => (window.location.href = './admin-manage-series.html'), 1500);
    } catch (error) {
      UI.showToast('เกิดข้อผิดพลาด', 'error');
    } finally {
      UI.setLoading(false);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => new SeriesController().init());
