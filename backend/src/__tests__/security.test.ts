import app from '../app';
import request from 'supertest';
import * as db from '../db';
import bcrypt from 'bcryptjs';

jest.mock('../db', () => ({
  query: jest.fn()
}));

describe('Security Verification', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should allow login with legacy plaintext password and migrate it', async () => {
    const mockUser = {
      id: 1,
      username: 'legacy_user',
      plain_password: 'old_password',
      password: null,
      balance: 100,
      vault_balance: 0,
      is_admin: false
    };

    (db.query as jest.Mock).mockResolvedValueOnce({ rows: [mockUser] }); // Select user
    (db.query as jest.Mock).mockResolvedValueOnce({ rows: [] }); // Update password

    const response = await request(app)
      .post('/api/auth/login')
      .send({ username: 'legacy_user', password: 'old_password' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');

    // Verify migration query was called
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE users SET password = $1, plain_password = NULL'),
      expect.any(Array)
    );

    const updateArgs = (db.query as jest.Mock).mock.calls[1][1];
    const isBcryptHash = await bcrypt.compare('old_password', updateArgs[0]);
    expect(isBcryptHash).toBe(true);
  });

  it('should allow login with hashed password', async () => {
    const hashedPassword = await bcrypt.hash('secret123', 10);
    const mockUser = {
      id: 2,
      username: 'secure_user',
      plain_password: null,
      password: hashedPassword,
      balance: 50,
      vault_balance: 10,
      is_admin: false
    };

    (db.query as jest.Mock).mockResolvedValueOnce({ rows: [mockUser] });

    const response = await request(app)
      .post('/api/auth/login')
      .send({ username: 'secure_user', password: 'secret123' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    // Ensure no update was called since it's already hashed
    expect(db.query).not.toHaveBeenCalledWith(expect.stringContaining('UPDATE'), expect.any(Array));
  });

  it('should reject invalid login', async () => {
    (db.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

    const response = await request(app)
      .post('/api/auth/login')
      .send({ username: 'wrong', password: 'wrong' });

    expect(response.status).toBe(401);
  });
});
