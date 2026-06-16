import { UIUtils } from '../../utils/ui-utils.js';

export const MovieCards = {
    createMovieCard: (item) => {
        const id = item.id || '';
        const title = UIUtils.escapeHTML(item.title || '');
        const category = item.category || 'VOD';
        const type = item.type || 'movie';
        const watchUrl = UIUtils.getMediaWatchPath(category, type, id);

        let posterUrl = item.poster || item.posterURL;

        // 🚀 PERFORMANCE: Use 'medium' (hqdefault) for grid cards to save bandwidth
        if (item.videoUrl && item.videoUrl.includes('youtube.com')) {
            posterUrl = UIUtils.getSafePoster(item.videoUrl, 'medium');
        } else {
            posterUrl = UIUtils.getSafePoster(posterUrl, 'medium');
        }

        return `
            <div class="movie-card poster-glow group relative w-full aspect-[2/3] rounded-2xl overflow-hidden bg-brand-charcoal border border-white/5 cursor-pointer shadow-2xl card-3d cinematic-border"
                 onclick="window.location.href='${watchUrl}'">
                <!-- Premium Image with Zoom Effect -->
                <div class="absolute inset-0 z-0">
                    <img src="${posterUrl}" alt="${title}" loading="lazy" decoding="async"
                         class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                         onerror="this.src='/assets/logo/DUYDODEE.png'">
                    <!-- Gradient Overlays -->
                    <div class="absolute inset-0 bg-gradient-to-t from-brand-black via-brand-black/60 to-transparent opacity-90"></div>
                    <div class="absolute inset-0 bg-gradient-to-br from-brand-primary/10 via-transparent to-brand-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
                
                <!-- Shine Effect -->
                <div class="absolute inset-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                    <div class="shine-effect"></div>
                </div>
                
                <!-- Premium Badge -->
                <div class="absolute top-3 right-3 z-30">
                    <span class="badge-premium">${category}</span>
                </div>
                
                <!-- Content Info with Animation -->
                <div class="absolute bottom-0 inset-x-0 p-4 z-30 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <div class="p-3 rounded-xl glass-premium-enhanced relative overflow-hidden">
                        <h3 class="text-white font-bold text-sm line-clamp-1 mb-2 Thai-font group-hover:text-brand-primary transition-colors">${title}</h3>
                        <div class="flex items-center gap-2 text-[10px] text-brand-primary font-black uppercase tracking-widest">
                            <div class="flex items-center gap-1">
                                <i data-lucide="play" class="w-3 h-3 fill-current"></i> 
                                <span>รับชมเลย</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Enhanced Play Button with Premium Effects -->
                <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 bg-brand-black/40 backdrop-blur-sm pointer-events-none group-hover:pointer-events-auto z-40">
                    <div class="relative">
                        <!-- Outer Glow -->
                        <div class="absolute inset-0 rounded-full bg-gradient-to-r from-brand-primary to-brand-gold blur-md opacity-0 group-hover:opacity-60 transition-opacity duration-500 animate-pulse"></div>
                        
                        <!-- Main Button -->
                        <div class="relative w-20 h-20 rounded-full bg-brand-primary/95 flex items-center justify-center text-white scale-75 group-hover:scale-110 transition-all duration-500 shadow-[0_0_50px_rgba(229,9,20,0.6)] hover:shadow-[0_0_70px_rgba(229,9,20,0.9)] border-2 border-white/30 cursor-pointer hover:bg-brand-primary play-button-container pointer-events-auto">
                            <!-- Ripple Effect -->
                            <div class="absolute inset-0 rounded-full border-2 border-white/40 opacity-0 group-hover:animate-ping"></div>
                            
                            <!-- Play Icon -->
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor" stroke="none" class="ml-2 transition-transform duration-300 group-hover:scale-110">
                                <polygon points="5 3 19 12 5 21 5 3"></polygon>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>`;
    },

    createTrendingCard: (movie, rank) => {
        const watchUrl = UIUtils.getMediaWatchPath(movie.category, movie.type, movie.id);
        // Use high quality for trending cards
        const posterUrl = UIUtils.getSafePoster(movie.poster || movie.posterURL, 'high');

        return `
            <div class="min-w-[280px] md:min-w-[450px] snap-start group animate-fade-in cursor-pointer" onclick="location.href='${watchUrl}'">
                <div class="poster-glow relative aspect-video rounded-2xl overflow-hidden border border-white/10 bg-brand-charcoal shadow-2xl cinematic-border">
                    <!-- Premium Image with Effects -->
                    <img src="${posterUrl}" class="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-110" loading="lazy" alt="${UIUtils.escapeHTML(movie.title)}" onerror="this.src='/assets/logo/DUYDODEE.png';">
                    
                    <!-- Premium Gradient Overlays -->
                    <div class="absolute inset-0 bg-gradient-to-t from-brand-black via-brand-black/40 to-transparent opacity-95"></div>
                    <div class="absolute inset-0 bg-gradient-to-br from-brand-primary/15 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <!-- Premium Rank Badge -->
                    <div class="absolute top-4 left-4 z-20">
                        <div class="relative">
                            <div class="absolute inset-0 bg-gradient-to-r from-brand-primary to-brand-gold rounded-xl blur-md opacity-50"></div>
                            <div class="relative w-12 h-12 rounded-xl bg-gradient-to-r from-brand-primary to-brand-primary-dark text-white font-black text-2xl italic flex items-center justify-center shadow-[0_0_30px_rgba(229,9,20,0.5)] border border-white/20 Thai-font">
                                ${rank}
                            </div>
                        </div>
                    </div>
                    
                    <!-- Content Info -->
                    <div class="absolute bottom-0 left-0 right-0 p-6 md:p-8 z-10">
                        <div class="space-y-1 md:space-y-2 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                            <span class="text-[10px] md:text-xs font-black text-brand-primary uppercase tracking-[0.3em] Thai-font block drop-shadow-md">${movie.category || 'Trending Now'}</span>
                            <h4 class="text-xl md:text-3xl font-black text-white Thai-font line-clamp-1 drop-shadow-lg group-hover:text-brand-primary transition-colors">${UIUtils.escapeHTML(movie.title)}</h4>
                        </div>
                    </div>
                    
                    <!-- Premium Play Button -->
                    <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 bg-brand-black/50 backdrop-blur-md pointer-events-none group-hover:pointer-events-auto z-40">
                        <div class="relative">
                            <!-- Glow Effect -->
                            <div class="absolute inset-0 rounded-full bg-gradient-to-r from-brand-primary to-brand-gold blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-500"></div>
                            
                            <!-- Main Button -->
                            <div class="relative w-24 h-24 rounded-full bg-brand-primary/95 flex items-center justify-center text-white scale-75 group-hover:scale-110 transition-all duration-500 shadow-[0_0_60px_rgba(229,9,20,0.7)] hover:shadow-[0_0_80px_rgba(229,9,20,0.9)] border-3 border-white/30 hover:border-white/50 cursor-pointer hover:bg-brand-primary play-button-container pointer-events-auto">
                                <!-- Ripple Effect -->
                                <div class="absolute inset-0 rounded-full border-2 border-white/40 opacity-0 group-hover:animate-ping"></div>
                                
                                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="currentColor" stroke="none" class="ml-2 transition-transform duration-300 group-hover:scale-110">
                                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
    },

    createAdminAssetCard: (data) => {
        const safeTitle = UIUtils.escapeHTML(data.title);
        const watchUrl = UIUtils.getMediaWatchPath(data.category, data.type, data.id);
        const editUrl = `/admin/admin-edit-${data.type}.html?id=${data.id}`;
        const typeLabel = data.type === 'movie' ? 'ภาพยนตร์' : 'ซีรีส์';
        const safePoster = UIUtils.getSafePoster(data.poster || data.posterURL, 'medium');

        return `
            <div class="movie-card group animate-fade-in">
                <div class="movie-poster-wrapper poster-glow !rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl relative aspect-[2/3] max-w-[180px] mx-auto">
                    <img src="${safePoster}" onerror="this.onerror=null;this.src='/assets/logo/DUYDODEE.png';" class="movie-poster-img w-full h-full object-cover" loading="lazy">
                    <div class="absolute top-3 left-3 px-2 py-0.5 bg-brand-black/90 backdrop-blur-md rounded-lg text-[7px] font-black text-brand-primary border border-white/10 uppercase tracking-widest z-40">
                        ${typeLabel}
                    </div>
                    <div class="movie-card-overlay flex flex-row justify-center items-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-500 bg-brand-black/70 backdrop-blur-[3px]">
                         <button onclick="window.open('${watchUrl}', '_blank')" class="w-10 h-10 rounded-xl bg-brand-primary flex items-center justify-center shadow-2xl hover:scale-110 transition-all duration-300 text-white haptic-btn" title="ดูตัวอย่างเนื้อหา">
                            <i data-lucide="external-link" class="w-5 h-5"></i>
                         </button>
                         <button onclick="location.href='${editUrl}'" class="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-2xl hover:bg-white hover:text-black transition-all duration-300 haptic-btn" title="แก้ไขข้อมูล">
                            <i data-lucide="edit-3" class="w-5 h-5"></i>
                         </button>
                    </div>
                </div>
                <div class="mt-4 space-y-1.5 text-center max-w-[180px] mx-auto">
                    <h4 class="text-[11px] font-black text-white group-hover:text-brand-primary transition-colors line-clamp-1 Thai-font uppercase tracking-tighter">${safeTitle}</h4>
                    <div class="flex items-center justify-center gap-2">
                        <span class="text-[8px] font-black text-gray-600 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded border border-white/5">${data.category || 'พรีเมียม'}</span>
                    </div>
                </div>
            </div>`;
    },

    createHistoryCard: (item) => {
        if (!item || !item.id) {
            return '';
        }

        const type = item.type || 'movie';
        const category = item.category || 'Premium';
        const watchUrl = UIUtils.getMediaWatchPath(category, type, item.id);
        const poster = UIUtils.getSafePoster(item.poster || item.posterURL, 'medium');
        const progress = item.progress || 0;
        const title = item.title || 'Unknown Title';

        return `
            <div class="group cursor-pointer animate-fade-in">
                <div class="poster-glow relative aspect-[2/3] rounded-2xl overflow-hidden border border-white/5 bg-brand-obsidian shadow-2xl" onclick="location.href='${watchUrl}'">
                    <img src="${poster}" class="w-full h-full object-cover opacity-90 group-hover:scale-110 transition-transform duration-[3s]" onerror="this.onerror=null;this.src='/assets/logo/DUYDODEE.png';">

                    <div class="absolute bottom-0 left-0 right-0 p-4 space-y-2 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                        <div class="flex items-center gap-2">
                             <span class="px-2 py-0.5 bg-brand-primary text-white text-[8px] font-black uppercase rounded shadow-lg Thai-font">รับชมค้างไว้</span>
                             <span class="text-[9px] font-bold text-white/50 uppercase tracking-widest">${UIUtils.escapeHTML(category)}</span>
                        </div>
                        <h4 class="text-sm md:text-base font-black text-white Thai-font line-clamp-1 group-hover:text-brand-primary transition-colors">${UIUtils.escapeHTML(title)}</h4>

                        <div class="pt-2">
                            <div class="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                <div class="h-full bg-brand-primary shadow-[0_0_10px_#E50914] transition-all duration-1000" style="width: ${progress}%"></div>
                            </div>
                        </div>
                    </div>

                    <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 bg-brand-black/40 backdrop-blur-[3px] pointer-events-none group-hover:pointer-events-auto z-40">
                        ${progress > 0 ? `
                            <div class="absolute inset-0 flex flex-col items-center justify-center space-y-3 pointer-events-auto">
                                <div class="relative w-16 h-16">
                                    <svg class="absolute inset-0 transform -rotate-90" viewBox="0 0 36 36">
                                        <path class="text-brand-black/40" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" stroke-width="2"/>
                                        <path class="text-brand-primary" stroke-dasharray="${progress}, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" stroke-width="2"/>
                                    </svg>
                                    <div class="absolute inset-0 flex items-center justify-center">
                                        <span class="text-[10px] font-black text-white">${Math.round(progress)}%</span>
                                    </div>
                                </div>
                            </div>
                        ` : `
                            <div class="relative w-20 h-20 rounded-full bg-brand-primary/95 flex items-center justify-center text-white scale-75 group-hover:scale-110 transition-all duration-500 shadow-[0_0_50px_rgba(229,9,20,0.7)] hover:shadow-[0_0_70px_rgba(229,9,20,0.9)] border-3 border-white/30 hover:border-white/50 cursor-pointer hover:bg-brand-primary play-button-container pointer-events-auto">
                                <div class="absolute inset-0 rounded-full border-2 border-white/40 opacity-0 group-hover:animate-ping"></div>
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor" stroke="none" class="ml-2 transition-transform duration-300 group-hover:scale-110">
                                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                                </svg>
                            </div>
                        `}
                    </div>
                </div>
            </div>`;
    }
};
