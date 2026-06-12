import { AuthService } from '../services/auth-service.js';
import { getDoc } from '../services/firebase.js';

// Mocking Firebase dependencies
jest.mock('../services/firebase.js', () => ({
    auth: { currentUser: null },
    db: {},
    doc: jest.fn(),
    getDoc: jest.fn(),
}));

describe('Security: Admin Access Authorization Logic', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('ควรอนุญาตให้ Super Admin (Hardcoded UID) เข้าถึงได้ทันที', async () => {
        const superAdminUser = { uid: 'fpjTWGXIFCYZNWIubqhUGuSFvZk1', email: 'any@test.com' };
        const isAdmin = await AuthService.checkIsAdmin(superAdminUser);
        expect(isAdmin).toBe(true);
    });

    test('ควรอนุญาตให้เจ้าของอีเมลหลักเข้าถึงได้ทันที', async () => {
        const ownerUser = { uid: 'random-uid', email: 'duyclassic191@gmail.com' };
        const isAdmin = await AuthService.checkIsAdmin(ownerUser);
        expect(isAdmin).toBe(true);
    });

    test('ควรอนุญาตให้ผู้ใช้ที่มี role เป็น "admin" ในฐานข้อมูลเข้าถึงได้', async () => {
        const adminUser = { uid: 'staff-uid', email: 'staff@test.com' };
        getDoc.mockResolvedValue({
            exists: () => true,
            data: () => ({ role: 'admin' })
        });

        const isAdmin = await AuthService.checkIsAdmin(adminUser);
        expect(isAdmin).toBe(true);
    });

    test('ควรปฏิเสธการเข้าถึงสำหรับผู้ใช้ที่มี role เป็น "Member"', async () => {
        const normalUser = { uid: 'member-uid', email: 'user@test.com' };
        getDoc.mockResolvedValue({
            exists: () => true,
            data: () => ({ role: 'Member' })
        });

        const isAdmin = await AuthService.checkIsAdmin(normalUser);
        expect(isAdmin).toBe(false);
    });

    test('ควรปฏิเสธการเข้าถึงหากไม่มีข้อมูลผู้ใช้ (Not logged in)', async () => {
        const isAdmin = await AuthService.checkIsAdmin(null);
        expect(isAdmin).toBe(false);
    });
});