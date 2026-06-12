/* global YT */
import { UIUtils } from '../../utils/ui-utils.js';

export const VideoPlayer = {
    renderiPhonePlayer: (data, episodes = [], activeIndex = 0, isSeries = false, UI) => {
        return new Promise((resolve) => {
            const container = document.getElementById('watch-container');
            if (!container) {
                return resolve(null);
            }

            UI.injectStarfield();

            const currentEp = isSeries ? episodes[activeIndex] : data;
            const embedUrl = currentEp?.embedURL || currentEp?.videoUrl || currentEp?.url || '';
            const videoId = UIUtils.extractYouTubeId(embedUrl);

            if (!embedUrl) {
                container.innerHTML = `
                    <div class="p-20 text-center animate-fade-in">
                        <div class="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                            <i data-lucide="alert-triangle" class="w-10 h-10 text-brand-primary"></i>
                        </div>
                        <h2 class="text-white text-xl font-bold Thai-font mb-2">ไม่พบไฟล์วิดีโอ</h2>
                        <p class="text-gray-500 Thai-font">ขออภัย สตรีมมิ่งไฟล์นี้อาจถูกลบหรือย้ายที่อยู่</p>
                    </div>`;
                UI.refreshIcons();
                return resolve(null);
            }

            const title = UIUtils.escapeHTML(data.title);
            const isVertical = data.category && (data.category.includes('แนวตั้ง') || data.category.includes('Vertical'));
            const frameClass = isVertical ? '' : 'landscape';

            container.innerHTML = `
                <div class="animate-fade-in relative max-w-7xl mx-auto px-4 py-4 md:py-8">
                    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start relative z-10">
                        <div class="lg:col-span-8 w-full order-1">
                            <div id="device-wrapper" class="device-frame ${frameClass} shadow-2xl group relative">
                                <div class="device-chassis"></div>
                                <div class="device-screen bg-black relative">
                                    <div id="player-api-node" class="w-full h-full"></div>
                                    <div class="absolute inset-0 pointer-events-none border border-brand-primary/20 rounded-[inherit] z-20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <div class="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[0_0_40px_rgba(229,9,20,0.3)] z-10 opacity-50"></div>
                                </div>
                                ${isVertical ? '<div class="device-island"></div>' : ''}
                                <div class="device-home-bar"></div>
                            </div>
                        </div>
                        <div class="lg:col-span-4 space-y-6 order-2">
                            <div class="glass-premium p-6 rounded-2xl">
                                <h1 class="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter italic Thai-font leading-none mb-4">${title}</h1>
                                <div class="flex items-center gap-3 mb-4">
                                    <span class="px-3 py-1 bg-brand-primary/20 text-brand-primary text-[9px] font-black uppercase rounded-lg border border-brand-primary/30">HD 720p</span>
                                    <span class="px-3 py-1 bg-white/5 text-gray-400 text-[9px] font-black uppercase rounded-lg border border-white/10">${data.category || 'Premium'}</span>
                                </div>
                                <div class="flex items-center gap-3">
                                    <button class="flex-1 py-3 px-6 bg-brand-primary text-white text-[10px] font-black uppercase rounded-xl hover:bg-brand-primary/90 transition-all shadow-[0_0_20px_rgba(229,9,20,0.3)] hover:shadow-[0_0_30px_rgba(229,9,20,0.5)]" onclick="UI.handleShare('${title}')">
                                        <i data-lucide="share-2" class="w-4 h-4 inline mr-2"></i>แชร์
                                    </button>
                                    <button id="bookmark-btn" class="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-brand-primary hover:text-white hover:border-brand-primary transition-all">
                                        <i data-lucide="heart" id="bookmark-icon" class="w-5 h-5"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    ${isSeries ? VideoPlayer._buildEpSelector(episodes, data.id, activeIndex) : ''}
                </div>`;

            UI.refreshIcons();

            if (videoId) {
                const initPlayer = () => {
                    const player = new YT.Player('player-api-node', {
                        videoId: videoId,
                        playerVars: {
                            'autoplay': 1,
                            'controls': 1,
                            'playsinline': 1,
                            'rel': 0,
                            'modestbranding': 1
                        },
                        events: {
                            onReady: () => resolve(player),
                            onError: (event) => {
                                console.error('YouTube Player Error:', event.data);
                                resolve(null);
                            }
                        }
                    });
                };

                if (!window.YT) {
                    const tag = document.createElement('script');
                    tag.src = 'https://www.youtube.com/iframe_api';
                    const firstScriptTag = document.getElementsByTagName('script')[0];
                    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
                    window.onYouTubeIframeAPIReady = initPlayer;
                } else {
                    initPlayer();
                }
            } else {
                resolve(null);
            }

            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    },

    _buildEpSelector: (episodes, seriesId, activeIndex) => {
        return `
            <div class="mt-16 space-y-8 animate-slide-up">
                <div class="flex items-center gap-4">
                    <h3 class="text-xl font-black text-white uppercase tracking-widest Thai-font">เลือกตอนรับชม</h3>
                    <div class="flex-1 h-px bg-gradient-to-r from-brand-primary/50 to-transparent"></div>
                    <span class="text-[10px] font-black text-brand-primary uppercase tracking-widest Thai-font">${episodes.length} EPISODES</span>
                </div>
                
                <div class="flex overflow-x-auto gap-4 pb-6 scrollbar-hide snap-x">
                    ${episodes.map((ep, i) => {
        const isActive = i === activeIndex;
        return `
                            <button onclick="location.href='/watch-series.html?id=${seriesId}&ep=${i}'" 
                                    class="min-w-[160px] md:min-w-[200px] p-5 rounded-[1.5rem] border transition-all duration-300 snap-start text-left group backdrop-blur-xl
                                    hover:scale-105 hover:shadow-[0_0_30px_rgba(229,9,20,0.4)] hover:border-brand-primary/50
                                    ${isActive ? 'bg-brand-primary/90 border-brand-primary shadow-[0_0_40px_rgba(229,9,20,0.4)]' : 'bg-white/5 border-white/10 hover:bg-white/10'}">
                                <p class="text-[9px] font-black uppercase tracking-widest mb-1 ${isActive ? 'text-white/60' : 'text-gray-500 group-hover:text-brand-primary'}">ตอนที่ ${i + 1}</p>
                                <h4 class="text-xs md:text-sm font-black Thai-font line-clamp-1 ${isActive ? 'text-white' : 'text-white'}">${UIUtils.escapeHTML(ep.title)}</h4>
                            </button>`;
    }).join('')}
                </div>
            </div>`;
    }
};
