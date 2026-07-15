import { UI } from '../components/ui.js';

export const AdminUtils = {
  extractYouTubeId: (url) => UI.extractYouTubeId(url),

  async fetchYouTubeInfo(url) {
    const videoId = this.extractYouTubeId(url);
    if (!videoId) {
      return null;
    }

    try {
      const res = await fetch(
        `https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`
      );
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.error('Error fetching YouTube info:', err);
    }
    return null;
  },

  getThumbnailOptions(videoId) {
    return [
      { url: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`, label: 'สูงสุด' },
      { url: `https://img.youtube.com/vi/${videoId}/sddefault.jpg`, label: 'มาตรฐาน' },
      { url: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`, label: 'สูง' }
    ];
  },

  renderThumbnailOptions(container, thumbnails, currentSelectedUrl, onSelect) {
    if (!container) {
      return;
    }
    container.innerHTML = '';
    thumbnails.forEach((thumb) => {
      const div = document.createElement('div');
      div.className = `relative flex-shrink-0 w-24 h-14 rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${thumb.url === currentSelectedUrl ? 'border-brand-primary shadow-lg' : 'border-white/10 hover:border-brand-primary/50'}`;
      div.onclick = () => onSelect(thumb.url, div);
      div.innerHTML = `
                <img src="${thumb.url}" class="w-full h-full object-cover" onerror="this.onerror=null;this.src='/assets/logo/DUYDODEE.png';">
                <span class="absolute bottom-1 right-1 px-1 py-0.5 bg-black/70 text-white text-[8px] rounded-md Thai-font">${thumb.label}</span>
            `;
      container.appendChild(div);
    });
  }
};
