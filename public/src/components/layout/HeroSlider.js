import {
    db,
    collection,
    query,
    orderBy,
    getDocs,
    SCHEMA
} from '../../services/firebase.js';
import { UIUtils } from '../../utils/ui-utils.js';

export const HeroSlider = {
    loadHeroSlides: async (containerId = 'hero-slider-container', UI) => {
        const container = document.getElementById(containerId);
        if (!container) {
            return;
        }

        const backgroundImage = document.getElementById('hero-background-image');

        // Fallback mode: show default hero when db is null
        if (!db) {
            if (backgroundImage) {
                backgroundImage.style.display = 'block';
            }
            container.innerHTML = '<div class="relative z-10 max-w-4xl"><div class="space-y-4 md:space-y-6"><h1 class="text-3xl md:text-5xl lg:text-6xl font-black text-white uppercase tracking-tighter italic leading-none animate-slide-up">ยินดีต้อนรับสู่ <span class="text-brand-primary">DUYดูDEE</span></h1><p class="text-sm md:text-base text-gray-300 max-w-2xl animate-slide-up" style="animation-delay: 0.1s">สัมผัสประสบการณ์การรับชมภาพยนตร์และซีรีส์คุณภาพสูงระดับ 4K HDR</p></div></div>';
            return;
        }

        try {
            const q = query(
                collection(db, SCHEMA.COLLECTIONS.HERO),
                orderBy('order', 'asc')
            );
            const snap = await getDocs(q);
            const slides = snap.docs.map(d => ({ id: d.id, ...d.data() }));

            if (slides.length === 0) {
                if (backgroundImage) {
                    backgroundImage.style.display = 'block';
                }
                container.innerHTML = `
                    <div class="relative z-10 max-w-4xl">
                        <div class="space-y-4 md:space-y-6">
                            <h1 class="text-3xl md:text-5xl lg:text-6xl font-black text-white uppercase tracking-tighter italic leading-none animate-slide-up">
                                ยินดีต้อนรับสู่ <span class="text-brand-primary">DUYดูDEE</span>
                            </h1>
                            <p class="text-sm md:text-base text-gray-300 max-w-2xl animate-slide-up" style="animation-delay: 0.1s">
                                สัมผัสประสบการณ์การรับชมภาพยนตร์และซีรีส์คุณภาพสูงระดับ 4K HDR
                            </p>
                        </div>
                    </div>`;
                return;
            }

            if (backgroundImage) {
                backgroundImage.style.display = 'none';
            }
            HeroSlider.renderHeroSlider(container, slides, UI);
        } catch (error) {
            console.error('Hero Slides Load Error:', error);
            if (backgroundImage) {
                backgroundImage.style.display = 'block';
            }
            container.innerHTML = `
                <div class="relative z-10 max-w-4xl">
                    <h1 class="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter italic">
                        ยินดีต้อนรับสู่ <span class="text-brand-primary">DUYดูDEE</span>
                    </h1>
                </div>`;
        }
    },

    renderHeroSlider: (container, slides, UI) => {
        let currentSlide = 0;
        let slideInterval;

        const createSlideHTML = (slide, index) => {
            const safeTitle = UIUtils.escapeHTML(slide.title || '');
            const safeDesc = UIUtils.escapeHTML(slide.description || '');
            const safeImage = UIUtils.getSafePoster(slide.imageUrl || '/assets/B1.png');
            const safeLink = UIUtils.escapeHTML(slide.targetUrl || '#');

            return `
                <div class="hero-slide absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === 0 ? 'opacity-100' : 'opacity-0'}" data-index="${index}">
                    <img src="${safeImage}" class="w-full h-full object-cover object-center" alt="${safeTitle}" loading="eager">
                    <div class="absolute inset-0 bg-gradient-to-t from-brand-black/90 via-brand-black/40 to-transparent"></div>
                    <div class="absolute inset-0 flex items-center">
                        <div class="container mx-auto px-6 relative z-10">
                            <div class="max-w-4xl space-y-4 md:space-y-6">
                                <h1 class="text-3xl md:text-4xl lg:text-6xl font-black text-white uppercase tracking-tighter italic leading-none animate-slide-up">
                                    ${safeTitle}
                                </h1>
                                ${safeDesc ? `<p class="text-sm md:text-base text-gray-300 max-w-2xl animate-slide-up" style="animation-delay: 0.1s">${safeDesc}</p>` : ''}
                                ${safeLink !== '#' ? `
                                    <a href="${safeLink}" class="inline-flex items-center gap-3 px-8 py-4 bg-brand-primary text-black text-xs font-black uppercase tracking-widest rounded-2xl shadow-[0_15px_30px_rgba(251,191,36,0.3)] hover:scale-105 transition-all animate-slide-up Thai-font" style="animation-delay: 0.2s">
                                        <i data-lucide="play" class="w-4 h-4"></i> รับชมเลย
                                    </a>` : ''}
                            </div>
                        </div>
                    </div>
                </div>`;
        };

        const sliderHTML = `
            <div class="hero-slider-container relative w-full h-full">
                ${slides.map((slide, index) => createSlideHTML(slide, index)).join('')}
                ${slides.length > 1 ? `
                    <div class="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-3 z-20">
                        ${slides.map((_, index) => `<button class="hero-dot w-3 h-3 rounded-full transition-all ${index === 0 ? 'bg-brand-primary w-8' : 'bg-white/30 hover:bg-white/50'}" data-slide="${index}"></button>`).join('')}
                    </div>
                    <button class="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 border border-white/10 flex items-center justify-center text-white hover:bg-brand-primary transition-all z-20 hero-nav hero-prev">
                        <i data-lucide="chevron-left" class="w-6 h-6"></i>
                    </button>
                    <button class="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 border border-white/10 flex items-center justify-center text-white hover:bg-brand-primary transition-all z-20 hero-nav hero-next">
                        <i data-lucide="chevron-right" class="w-6 h-6"></i>
                    </button>` : ''}
            </div>`;

        container.innerHTML = sliderHTML;
        UI.refreshIcons();

        if (slides.length > 1) {
            const slideElements = container.querySelectorAll('.hero-slide');
            const dots = container.querySelectorAll('.hero-dot');
            const prevBtn = container.querySelector('.hero-prev');
            const nextBtn = container.querySelector('.hero-next');

            const goToSlide = (index) => {
                currentSlide = index;
                slideElements.forEach((slide, i) => {
                    slide.classList.toggle('opacity-100', i === index);
                    slide.classList.toggle('opacity-0', i !== index);
                });
                dots.forEach((dot, i) => {
                    dot.classList.toggle('bg-brand-primary', i === index);
                    dot.classList.toggle('w-8', i === index);
                    dot.classList.toggle('bg-white/30', i !== index);
                });
            };

            const startAutoPlay = () => {
                slideInterval = setInterval(() => {
                    goToSlide((currentSlide + 1) % slides.length);
                }, 5000);
            };

            const stopAutoPlay = () => clearInterval(slideInterval);

            dots.forEach((dot, index) => {
                dot.addEventListener('click', () => {
                    stopAutoPlay();
                    goToSlide(index);
                    startAutoPlay();
                });
            });

            prevBtn?.addEventListener('click', () => {
                stopAutoPlay();
                goToSlide((currentSlide - 1 + slides.length) % slides.length);
                startAutoPlay();
            });

            nextBtn?.addEventListener('click', () => {
                stopAutoPlay();
                goToSlide((currentSlide + 1) % slides.length);
                startAutoPlay();
            });

            startAutoPlay();
            container.addEventListener('mouseenter', stopAutoPlay);
            container.addEventListener('mouseleave', startAutoPlay);
        }
    }
};
