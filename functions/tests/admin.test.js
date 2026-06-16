const fft = require('firebase-functions-test')();
const admin = require('firebase-admin');

// Mock Firestore
jest.mock('firebase-admin', () => {
  const firestoreMock = {
    collection: jest.fn().mockReturnThis(),
    doc: jest.fn().mockReturnThis(),
    update: jest.fn().mockResolvedValue(),
    add: jest.fn().mockResolvedValue({ id: 'log-id' }),
  };
  return {
    initializeApp: jest.fn(),
    firestore: () => firestoreMock,
    FieldValue: {
      serverTimestamp: jest.fn(() => 'timestamp'),
      delete: jest.fn(() => 'delete'),
    },
  };
});

const { banUser } = require('../src/admin');

describe('banUser Function', () => {
  afterAll(() => {
    fft.cleanup();
  });

  test('should ban a user when called by admin', async () => {
    const wrapped = fft.wrap(banUser);
    const data = { userId: 'user123', isBanned: true, reason: 'spam' };
    const auth = { uid: 'admin-uid', email: 'admin@example.com' };

    // Pass data and auth in a way the function can extract them
    await expect(wrapped({ data, auth })).resolves.toEqual({ success: true });
  });

  test('should throw error when called by non-admin', async () => {
    const wrapped = fft.wrap(banUser);
    const data = { userId: 'user123', isBanned: true };
    const context = { auth: { uid: 'user-uid', email: 'user@example.com' } };

    await expect(wrapped({ data }, context)).rejects.toThrow();
  });

});
