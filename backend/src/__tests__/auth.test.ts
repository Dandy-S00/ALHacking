import app from '../app';
import request from 'supertest';
import * as db from '../db';
import bcrypt from 'bcryptjs';

jest.mock('../db', () => ({
  query: jest.fn()
}));

describe('Auth API - Hashed Passwords and Lazy Migration', () => {
  const password = 'test_password';
  let hashedPassword: string;

  beforeAll(async () => {
    hashedPassword = await bcrypt.hash(password, 10);
  });

  it('should login with hashed password', async () => {
    (db.query as jest.Mock).mockResolvedValue({
      rows: [{
        id: 1,
        username: 'testuser',
        password: hashedPassword,
        is_admin: false,
        balance: 100,
        vault_balance: 0
      }]
    });

    const response = await request(app)
      .post('/api/auth/login')
      .send({ username: 'testuser', password: password });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
  });

  it('should login with plaintext password and migrate (Lazy Migration)', async () => {
    (db.query as jest.Mock).mockResolvedValue({
      rows: [{
        id: 2,
        username: 'olduser',
        plain_password: 'old_plaintext_password',
        is_admin: false,
        balance: 50,
        vault_balance: 0
      }]
    });

    const response = await request(app)
      .post('/api/auth/login')
      .send({ username: 'olduser', password: 'old_plaintext_password' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');

    // Verify that UPDATE was called for migration
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE users SET password = $1, plain_password = NULL WHERE id = $2'),
      expect.any(Array)
    );
  });

  it('should fail login with wrong password', async () => {
    (db.query as jest.Mock).mockResolvedValue({
      rows: [{
        id: 1,
        username: 'testuser',
        password: hashedPassword,
        is_admin: false
      }]
    });

    const response = await request(app)
      .post('/api/auth/login')
      .send({ username: 'testuser', password: 'wrong_password' });

    expect(response.status).toBe(401);
  });
});
