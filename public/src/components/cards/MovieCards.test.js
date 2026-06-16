/**
 * 🧪 MovieCards Tests
 * Tests for movie/series card components
 */

// Mock UIUtils
jest.mock('../../utils/ui-utils.js', () => ({
    UIUtils: {
        escapeHTML: jest.fn((str) => str),
        getMediaWatchPath: jest.fn((cat, type, id) => `/watch-${type}.html?id=${id}`),
        getSafePoster: jest.fn((url, quality) => url || '/assets/logo/DUYDODEE.png')
    }
}));

import { MovieCards } from './MovieCards.js';
import { UIUtils } from '../../utils/ui-utils.js';

describe('MovieCards', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createMovieCard', () => {
        it('should create valid movie card HTML', () => {
            const item = {
                id: 'movie123',
                title: 'Test Movie',
                category: 'Action',
                type: 'movie',
                poster: 'https://example.com/poster.jpg'
            };

            const html = MovieCards.createMovieCard(item);

            expect(html).toContain('movie-card');
            expect(html).toContain('Test Movie');
            expect(html).toContain('poster.jpg');
            expect(html).toContain('/watch-movie.html?id=movie123');
        });

        it('should handle missing poster URL', () => {
            const item = {
                id: 'movie123',
                title: 'Test Movie',
                category: 'Action',
                type: 'movie'
            };

            const html = MovieCards.createMovieCard(item);

            expect(html).toContain('movie-card');
            expect(UIUtils.getSafePoster).toHaveBeenCalled();
        });

        it('should use medium quality for YouTube URLs', () => {
            const item = {
                id: 'movie123',
                title: 'YouTube Movie',
                category: 'Action',
                type: 'movie',
                videoUrl: 'https://youtube.com/watch?v=dQw4w9WgXcQ'
            };

            const html = MovieCards.createMovieCard(item);

            expect(UIUtils.getSafePoster).toHaveBeenCalledWith('https://youtube.com/watch?v=dQw4w9WgXcQ', 'medium');
        });

        it('should escape HTML in title', () => {
            const item = {
                id: 'movie123',
                title: '<script>alert("xss")</script>',
                category: 'Action',
                type: 'movie',
                poster: 'https://example.com/poster.jpg'
            };

            const html = MovieCards.createMovieCard(item);

            expect(UIUtils.escapeHTML).toHaveBeenCalledWith('<script>alert("xss")</script>');
        });

        it('should handle vertical category', () => {
            const item = {
                id: 'movie123',
                title: 'Vertical Movie',
                category: 'แนวตั้ง',
                type: 'movie',
                poster: 'https://example.com/poster.jpg'
            };

            const html = MovieCards.createMovieCard(item);

            expect(html).toContain('movie-card');
            expect(UIUtils.getMediaWatchPath).toHaveBeenCalledWith('แนวตั้ง', 'movie', 'movie123');
        });

        it('should handle series type', () => {
            const item = {
                id: 'series123',
                title: 'Test Series',
                category: 'Drama',
                type: 'series',
                poster: 'https://example.com/poster.jpg'
            };

            const html = MovieCards.createMovieCard(item);

            expect(html).toContain('movie-card');
            expect(UIUtils.getMediaWatchPath).toHaveBeenCalledWith('Drama', 'series', 'series123');
        });

        it('should include premium badge', () => {
            const item = {
                id: 'movie123',
                title: 'Premium Movie',
                category: 'Premium',
                type: 'movie',
                poster: 'https://example.com/poster.jpg'
            };

            const html = MovieCards.createMovieCard(item);

            expect(html).toContain('badge-premium');
            expect(html).toContain('Premium');
        });

        it('should have play button', () => {
            const item = {
                id: 'movie123',
                title: 'Test Movie',
                category: 'Action',
                type: 'movie',
                poster: 'https://example.com/poster.jpg'
            };

            const html = MovieCards.createMovieCard(item);

            expect(html).toContain('play-button-container');
            expect(html).toContain('รับชมเลย');
        });
    });

    describe('createTrendingCard', () => {
        it('should create trending card with rank', () => {
            const movie = {
                id: 'movie123',
                title: 'Trending Movie',
                category: 'Trending',
                type: 'movie',
                poster: 'https://example.com/poster.jpg'
            };
            const rank = 1;

            const html = MovieCards.createTrendingCard(movie, rank);

            expect(html).toContain('Trending Movie');
            expect(html).toContain('1');
            expect(html).toContain('poster.jpg');
        });

        it('should use high quality for trending cards', () => {
            const movie = {
                id: 'movie123',
                title: 'Trending Movie',
                category: 'Trending',
                type: 'movie',
                poster: 'https://example.com/poster.jpg'
            };

            const html = MovieCards.createTrendingCard(movie, 1);

            expect(UIUtils.getSafePoster).toHaveBeenCalledWith('https://example.com/poster.jpg', 'high');
        });

        it('should escape HTML in title', () => {
            const movie = {
                id: 'movie123',
                title: '<script>alert("xss")</script>',
                category: 'Trending',
                type: 'movie',
                poster: 'https://example.com/poster.jpg'
            };

            const html = MovieCards.createTrendingCard(movie, 1);

            expect(UIUtils.escapeHTML).toHaveBeenCalledWith('<script>alert("xss")</script>');
        });

        it('should have aspect video for trending cards', () => {
            const movie = {
                id: 'movie123',
                title: 'Trending Movie',
                category: 'Trending',
                type: 'movie',
                poster: 'https://example.com/poster.jpg'
            };

            const html = MovieCards.createTrendingCard(movie, 1);

            expect(html).toContain('aspect-video');
        });

        it('should include rank badge with gradient', () => {
            const movie = {
                id: 'movie123',
                title: 'Trending Movie',
                category: 'Trending',
                type: 'movie',
                poster: 'https://example.com/poster.jpg'
            };

            const html = MovieCards.createTrendingCard(movie, 5);

            expect(html).toContain('5');
            expect(html).toContain('bg-gradient-to-r');
        });
    });

    describe('createAdminAssetCard', () => {
        it('should create admin asset card', () => {
            const data = {
                id: 'movie123',
                title: 'Admin Movie',
                category: 'Action',
                type: 'movie',
                poster: 'https://example.com/poster.jpg'
            };

            const html = MovieCards.createAdminAssetCard(data);

            expect(html).toContain('movie-card');
            expect(html).toContain('Admin Movie');
            expect(html).toContain('ภาพยนตร์');
        });

        it('should show ซีรีส์ label for series', () => {
            const data = {
                id: 'series123',
                title: 'Admin Series',
                category: 'Drama',
                type: 'series',
                poster: 'https://example.com/poster.jpg'
            };

            const html = MovieCards.createAdminAssetCard(data);

            expect(html).toContain('ซีรีส์');
        });

        it('should include edit and preview buttons', () => {
            const data = {
                id: 'movie123',
                title: 'Admin Movie',
                category: 'Action',
                type: 'movie',
                poster: 'https://example.com/poster.jpg'
            };

            const html = MovieCards.createAdminAssetCard(data);

            expect(html).toContain('edit-3');
            expect(html).toContain('external-link');
        });

        it('should generate correct edit URL', () => {
            const data = {
                id: 'movie123',
                title: 'Admin Movie',
                category: 'Action',
                type: 'movie',
                poster: 'https://example.com/poster.jpg'
            };

            const html = MovieCards.createAdminAssetCard(data);

            expect(html).toContain('/admin/admin-edit-movie.html?id=movie123');
        });

        it('should escape HTML in title', () => {
            const data = {
                id: 'movie123',
                title: '<script>alert("xss")</script>',
                category: 'Action',
                type: 'movie',
                poster: 'https://example.com/poster.jpg'
            };

            const html = MovieCards.createAdminAssetCard(data);

            expect(UIUtils.escapeHTML).toHaveBeenCalledWith('<script>alert("xss")</script>');
        });

        it('should use medium quality for admin cards', () => {
            const data = {
                id: 'movie123',
                title: 'Admin Movie',
                category: 'Action',
                type: 'movie',
                poster: 'https://example.com/poster.jpg'
            };

            const html = MovieCards.createAdminAssetCard(data);

            expect(UIUtils.getSafePoster).toHaveBeenCalledWith('https://example.com/poster.jpg', 'medium');
        });
    });

    describe('createHistoryCard', () => {
        it('should create history card with progress', () => {
            const item = {
                id: 'movie123',
                title: 'Watched Movie',
                category: 'Drama',
                type: 'movie',
                poster: 'https://example.com/poster.jpg',
                progress: 50
            };

            const html = MovieCards.createHistoryCard(item);

            expect(html).toContain('Watched Movie');
            expect(html).toContain('50%');
            expect(html).toContain('รับชมค้างไว้');
        });

        it('should return empty string for invalid item', () => {
            const html = MovieCards.createHistoryCard(null);
            expect(html).toBe('');
        });

        it('should return empty string for item without id', () => {
            const html = MovieCards.createHistoryCard({ title: 'Test' });
            expect(html).toBe('');
        });

        it('should handle zero progress', () => {
            const item = {
                id: 'movie123',
                title: 'New Movie',
                category: 'Action',
                type: 'movie',
                poster: 'https://example.com/poster.jpg',
                progress: 0
            };

            const html = MovieCards.createHistoryCard(item);

            expect(html).toContain('New Movie');
            expect(html).toContain('0%');
        });

        it('should handle full progress', () => {
            const item = {
                id: 'movie123',
                title: 'Completed Movie',
                category: 'Action',
                type: 'movie',
                poster: 'https://example.com/poster.jpg',
                progress: 100
            };

            const html = MovieCards.createHistoryCard(item);

            expect(html).toContain('Completed Movie');
            expect(html).toContain('100%');
        });

        it('should escape HTML in title', () => {
            const item = {
                id: 'movie123',
                title: '<script>alert("xss")</script>',
                category: 'Action',
                type: 'movie',
                poster: 'https://example.com/poster.jpg',
                progress: 25
            };

            const html = MovieCards.createHistoryCard(item);

            expect(UIUtils.escapeHTML).toHaveBeenCalledWith('<script>alert("xss")</script>');
        });

        it('should show progress bar', () => {
            const item = {
                id: 'movie123',
                title: 'Movie',
                category: 'Action',
                type: 'movie',
                poster: 'https://example.com/poster.jpg',
                progress: 75
            };

            const html = MovieCards.createHistoryCard(item);

            expect(html).toContain('bg-brand-primary');
            expect(html).toContain('75%');
        });

        it('should handle missing poster URL', () => {
            const item = {
                id: 'movie123',
                title: 'Movie',
                category: 'Action',
                type: 'movie',
                poster: '',
                progress: 25
            };

            const html = MovieCards.createHistoryCard(item);

            expect(UIUtils.getSafePoster).toHaveBeenCalled();
        });
    });
});
