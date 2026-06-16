const { isAdmin } = require('../src/utils/auth');

describe('isAdmin Utility', () => {
  test('should return true for admin emails', () => {
    // Note: Assuming ADMIN_EMAILS environment variable is set
    // For testing purposes, we might need to mock config
    expect(isAdmin('admin@example.com')).toBe(true);
  });

  test('should return false for non-admin emails', () => {
    expect(isAdmin('user@example.com')).toBe(false);
  });

  test('should return false for empty/undefined email', () => {
    expect(isAdmin('')).toBe(false);
    expect(isAdmin(null)).toBe(false);
    expect(isAdmin(undefined)).toBe(false);
  });
});
