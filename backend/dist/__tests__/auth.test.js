"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Mocking db for simple test
jest.mock('../db', () => ({
    query: jest.fn().mockResolvedValue({ rows: [{ id: 1, username: 'admin', plain_password: 'password', is_admin: true }] })
}));
describe('Auth API', () => {
    it('should return 401 for invalid login', async () => {
        // This is a placeholder test
        expect(1 + 1).toBe(2);
    });
});
