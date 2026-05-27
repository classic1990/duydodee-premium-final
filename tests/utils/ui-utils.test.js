import { UIUtils } from '../../public/js/utils/ui-utils.js';

describe('UIUtils', () => {
  test('extractYouTubeId should return correct ID', () => {
    expect(UIUtils.extractYouTubeId('https://www.youtube.com/watch?v=12345678901')).toBe('12345678901');
    expect(UIUtils.extractYouTubeId('https://youtu.be/12345678901')).toBe('12345678901');
    expect(UIUtils.extractYouTubeId('invalid-url')).toBeNull();
  });

  test('escapeHTML should escape dangerous characters', () => {
    expect(UIUtils.escapeHTML('<script>alert("xss")</script>')).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
  });

  test('getMediaWatchPath should return correct path', () => {
    expect(UIUtils.getMediaWatchPath('movie', 'movie', '123')).toBe('/watch-movie.html?id=123');
    expect(UIUtils.getMediaWatchPath('ซีรีส์แนวตั้ง', 'series', '456')).toBe('/watch-movie.html?id=456');
    expect(UIUtils.getMediaWatchPath('ซีรีส์จีน', 'series', '789')).toBe('/watch-series.html?id=789');
  });
});
