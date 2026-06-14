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
                    <div class="p-12 sm:p-20 text-center animate-fade-in">
                        <div class="w-16 h-16 sm:w-20 sm:h-20 bg-brand-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                            <i data-lucide="alert-triangle" class="w-8 h-8 sm:w-10 sm:h-10 text-brand-primary"></i>
                        </div>
                        <h2 class="text-white text-lg sm:text-xl font-bold Thai-font mb-2">ไม่พบไฟล์วิดีโอ</h2>
                        <p class="text-gray-300 sm:text-gray-400 text-sm sm:text-base Thai-font">ขออภัย สตรีมมิ่งไฟล์นี้อาจถูกลบหรือย้ายที่อยู่</p>
                    </div>`;
                UI.refreshIcons();
                return resolve(null);
            }

            const title = UIUtils.escapeHTML(data.title);
            const isVertical = data.category && (data.category.includes('แนวตั้ง') || data.category.includes('Vertical'));
            const frameClass = isVertical ? '' : 'landscape';

            container.innerHTML = `
                <div class="animate-fade-in relative max-w-7xl mx-auto px-2 sm:px-4 py-2 sm:py-4 md:py-8">
                    <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start relative z-10">
                        <div class="lg:col-span-8 w-full order-1">
                            <div id="device-wrapper" class="device-frame ${frameClass} group relative w-full">
                                <div class="device-chassis"></div>
                                <div class="device-screen bg-black relative">
                                    <div id="player-api-node" class="w-full h-full"></div>
                                    <!-- Cinematic Glow -->
                                    <div class="absolute inset-0 pointer-events-none bg-gradient-to-t from-brand-black/10 to-transparent rounded-[inherit] z-15"></div>
                                    
                                    <!-- Video Quality Badge -->
                                    <div class="absolute top-3 sm:top-4 right-3 sm:right-4 px-2 sm:px-3 py-0.5 sm:py-1 bg-brand-black/90 backdrop-blur-md rounded-lg border border-brand-primary/40 z-30">
                                        <span class="text-[8px] sm:text-[9px] font-black text-brand-primary uppercase tracking-widest">HD 720p</span>
                                    </div>
                                </div>
                                ${isVertical ? '<div class="device-island"></div>' : ''}
                                <div class="device-home-bar"></div>
                            </div>
                        </div>
                        <div class="lg:col-span-4 space-y-4 sm:space-y-6 order-2">
                            <!-- Movie Info Card -->
                            <div class="glass-premium-enhanced p-4 sm:p-6 rounded-2xl relative overflow-hidden">
                                <!-- Premium Background Glow -->
                                <div class="absolute -top-10 -right-10 w-32 h-32 bg-brand-primary/10 rounded-full blur-3xl"></div>
                                
                                <h1 class="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black text-white uppercase tracking-tighter italic Thai-font leading-none mb-3 sm:mb-4">${title}</h1>
                                
                                <!-- Movie Meta Info -->
                                <div class="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                                    <div class="flex items-center gap-2 sm:gap-3 flex-wrap">
                                        <span class="badge-premium text-[8px] sm:text-[9px] px-2 sm:px-3">HD 720p</span>
                                        <span class="px-2 sm:px-3 py-1 bg-white/10 text-white/90 text-[8px] sm:text-[9px] font-black uppercase rounded-lg border border-white/20">${data.category || 'Premium'}</span>
                                        ${data.views ? `<span class="px-2 sm:px-3 py-1 bg-white/10 text-white/80 text-[8px] sm:text-[9px] font-black uppercase rounded-lg border border-white/20 flex items-center gap-1"><i data-lucide="eye" class="w-3 h-3"></i>${(data.views || 0).toLocaleString()}</span>` : ''}
                                    </div>
                                    ${data.description ? `
                                        <p class="text-gray-300 sm:text-gray-400 text-sm leading-relaxed line-clamp-3 Thai-font">${UIUtils.escapeHTML(data.description)}</p>
                                    ` : ''}
                                </div>
                                
                                <!-- Action Buttons -->
                                <div class="flex items-center gap-2 sm:gap-3">
                                    <button class="flex-1 py-2 sm:py-3 px-3 sm:px-6 bg-gradient-to-r from-brand-primary to-brand-primary-dark text-white text-[9px] sm:text-[10px] font-black uppercase rounded-xl hover:scale-105 transition-all shadow-[0_0_30px_rgba(229,9,20,0.4)] hover:shadow-[0_0_50px_rgba(229,9,20,0.6)] relative overflow-hidden group" onclick="UI.handleShare('${title}')">
                                        <span class="relative z-10 flex items-center justify-center gap-1 sm:gap-2">
                                            <i data-lucide="share-2" class="w-3 h-3 sm:w-4 sm:h-4"></i><span class="hidden sm:inline">แชร์</span>
                                        </span>
                                        <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
                                    </button>
                                    <button id="bookmark-btn" class="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-brand-primary hover:text-white hover:border-brand-primary transition-all hover:scale-110 shadow-lg">
                                        <i data-lucide="heart" id="bookmark-icon" class="w-4 h-4 sm:w-5 sm:h-5"></i>
                                    </button>
                                </div>
                            </div>

                            <!-- Additional Info Card -->
                            <div class="glass-premium-enhanced p-4 sm:p-6 rounded-2xl relative overflow-hidden">
                                <h3 class="text-sm sm:text-lg font-black text-white uppercase tracking-widest Thai-font mb-3 sm:mb-4">ข้อมูลเพิ่มเติม</h3>
                                <div class="space-y-2 sm:space-y-3">
                                    <div class="flex items-center gap-2 sm:gap-3">
                                        <i data-lucide="calendar" class="w-3 h-3 sm:w-4 sm:h-4 text-brand-primary"></i>
                                        <span class="text-gray-200 sm:text-gray-400 text-xs sm:text-sm">เผยแพร่: ${data.year || '2026'}</span>
                                    </div>
                                    <div class="flex items-center gap-2 sm:gap-3">
                                        <i data-lucide="clock" class="w-3 h-3 sm:w-4 sm:h-4 text-brand-primary"></i>
                                        <span class="text-gray-200 sm:text-gray-400 text-xs sm:text-sm">ระยะเวลา: ${data.duration || '90 นาที'}</span>
                                    </div>
                                    <div class="flex items-center gap-2 sm:gap-3">
                                        <i data-lucide="globe" class="w-3 h-3 sm:w-4 sm:h-4 text-brand-primary"></i>
                                        <span class="text-gray-200 sm:text-gray-400 text-xs sm:text-sm">ประเภท: ${data.category || 'Premium'}</span>
                                    </div>
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
                            'modestbranding': 1,
                            'origin': window.location.origin,
                            'enablejsapi': 1,
                            'widget_referrer': window.location.href
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
            <div class="mt-8 sm:mt-12 md:mt-16 space-y-4 sm:space-y-8 animate-slide-up px-2 sm:px-0">
                <div class="flex items-center gap-2 sm:gap-4">
                    <h3 class="text-base sm:text-lg md:text-xl font-black text-white uppercase tracking-widest Thai-font">เลือกตอนรับชม</h3>
                    <div class="flex-1 h-px bg-gradient-to-r from-brand-primary/50 via-brand-gold/30 to-transparent"></div>
                    <span class="text-[9px] sm:text-[10px] font-black text-brand-primary uppercase tracking-widest Thai-font">${episodes.length} EPISODES</span>
                </div>
                
                <div class="flex overflow-x-auto gap-2 sm:gap-4 pb-4 sm:pb-6 scrollbar-hide snap-x px-2 sm:px-0">
                    ${episodes.map((ep, i) => {
        const isActive = i === activeIndex;
        return `
                            <button onclick="location.href='/watch-series.html?id=${seriesId}&ep=${i}'" 
                                    class="min-w-[140px] sm:min-w-[160px] md:min-w-[200px] p-3 sm:p-5 rounded-[1.5rem] border transition-all duration-300 snap-start text-left group backdrop-blur-xl relative overflow-hidden
                                    hover:scale-105 hover:shadow-[0_0_40px_rgba(229,9,20,0.5)] hover:border-brand-primary/50 cinematic-border
                                    ${isActive ? 'bg-gradient-to-r from-brand-primary/90 to-brand-primary-dark/90 border-brand-primary shadow-[0_0_50px_rgba(229,9,20,0.5)]' : 'bg-white/5 border-white/10 hover:bg-white/10'}">
                                <!-- Premium Background Effect for Active State -->
                                ${isActive ? '<div class="absolute inset-0 bg-gradient-to-br from-brand-primary/20 to-brand-gold/10"></div>' : ''}
                                
                                <div class="relative z-10">
                                    <p class="text-[8px] sm:text-[9px] font-black uppercase tracking-widest mb-1 ${isActive ? 'text-white/70' : 'text-gray-300 sm:text-gray-500 group-hover:text-brand-primary'}">ตอนที่ ${i + 1}</p>
                                    <h4 class="text-[10px] sm:text-xs md:text-sm font-black Thai-font line-clamp-1 ${isActive ? 'text-white' : 'text-gray-200 sm:text-white group-hover:text-brand-primary transition-colors'}">${UIUtils.escapeHTML(ep.title)}</h4>
                                </div>
                            </button>`;
    }).join('')}
                </div>
            </div>`;
    }
};
