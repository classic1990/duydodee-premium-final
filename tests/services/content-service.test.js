import { ContentService } from '../../public/src/services/content-service.js';
import * as firebase from '../../public/src/services/firebase.js';

// Mock firebase
jest.mock('../../public/src/services/firebase.js', () => ({
  db: {},
  collection: jest.fn(),
  getDocs: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  startAfter: jest.fn(),
  serverTimestamp: jest.fn(),
  increment: jest.fn(),
}));

describe('ContentService', () => {
  test('should return correct collection names', () => {
    // Testing _getCollection private-like method (we might need to export it for testing or test indirectly)
    // Since it's a method on an exported object, let's test it directly
    expect(ContentService._getCollection('movie')).toBe('movies');
    expect(ContentService._getCollection('series')).toBe('series');
  });

  test('should throw error for invalid types', () => {
    expect(() => ContentService._getCollection('')).toThrow('Invalid content type: Type is null or undefined.');
  });
});
