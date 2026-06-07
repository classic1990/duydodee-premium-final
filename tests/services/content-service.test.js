import { ContentService } from '../../public/js/services/content-service.js';
import { getDocs, collection, query } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

// Mock firebase-config.js
jest.mock('../../public/js/services/firebase-config.js', () => ({
  db: {},
}));

describe('ContentService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should return correct collection names', () => {
    expect(ContentService._getCollection('movie')).toBe('movies');
    expect(ContentService._getCollection('series')).toBe('series');
  });

  test('should throw error for invalid types', () => {
    expect(() => ContentService._getCollection('')).toThrow('Invalid content type: Type is null or undefined.');
  });

  test('getEpisodes should query the episodes subcollection and return sorted episodes', async () => {
    const mockDocs = [
      { id: 'ep1', data: () => ({ episodeNumber: 1, title: 'Episode 1' }) },
      { id: 'ep2', data: () => ({ episodeNumber: 2, title: 'Episode 2' }) }
    ];
    getDocs.mockResolvedValueOnce({ docs: mockDocs });
    
    const result = await ContentService.getEpisodes('series123');
    expect(collection).toHaveBeenCalledWith(expect.any(Object), 'series', 'series123', 'episodes');
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('ep1');
    expect(result[0].title).toBe('Episode 1');
  });

  test('searchItems should return filtered items based on search term', async () => {
    const mockDocs = [
      { id: '1', data: () => ({ title: 'Arsenal vs Chelsea Highlights', category: 'Sports' }) },
      { id: '2', data: () => ({ title: 'Liverpool Training', category: 'Vlog' }) }
    ];
    getDocs.mockResolvedValueOnce({ docs: mockDocs });

    const result = await ContentService.searchItems('movie', 'Arsenal');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
    expect(result[0].title).toBe('Arsenal vs Chelsea Highlights');
  });

  test('fetchItemsByCategory should fetch from single collection', async () => {
    const mockDocs = [
      { id: '1', data: () => ({ title: 'Movie 1', category: 'Action' }) }
    ];
    getDocs.mockResolvedValueOnce({ docs: mockDocs, empty: false });

    const result = await ContentService.fetchItemsByCategory(['movie'], 'Action', { isAllCategories: false });
    expect(result.items).toHaveLength(1);
    expect(result.items[0].title).toBe('Movie 1');
    expect(result.empty).toBe(false);
  });
});
