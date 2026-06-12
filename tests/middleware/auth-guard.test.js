import { checkAdminAccess } from '../../public/src/middleware/auth-guard.js';
import { AuthService } from '../../public/src/services/auth-service.js';

jest.mock('../../public/src/services/auth-service.js', () => ({
  AuthService: {
    onStateChanged: jest.fn(),
    checkIsAdmin: jest.fn(),
  },
}));

describe('AuthGuard', () => {
  test('should redirect to login if no user', async () => {
    AuthService.onStateChanged.mockImplementation((cb) => {
      setTimeout(() => cb(null), 0);
      return jest.fn();
    });

    await expect(checkAdminAccess()).rejects.toMatch('Unauthorized');
  });

  test('should redirect to home if user is not admin', async () => {
    const mockUser = { uid: '123' };
    AuthService.onStateChanged.mockImplementation((cb) => {
      setTimeout(() => cb(mockUser), 0);
      return jest.fn();
    });
    AuthService.checkIsAdmin.mockResolvedValue(false);

    await expect(checkAdminAccess()).rejects.toMatch('Access Denied');
  });

  test('should resolve if user is admin', async () => {
    const mockUser = { uid: '123' };
    AuthService.onStateChanged.mockImplementation((cb) => {
      setTimeout(() => cb(mockUser), 0);
      return jest.fn();
    });
    AuthService.checkIsAdmin.mockResolvedValue(true);

    const result = await checkAdminAccess();
    expect(result.user).toBe(mockUser);
  });
});
