import app from '../app';
import request from 'supertest';
import * as db from '../db';
import bcrypt from 'bcryptjs';

jest.mock('../db', () => ({
  query: jest.fn()
}));

describe('Auth API', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv, JWT_SECRET: 'testsecret' };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should return 200 and a token for valid login (hashed password)', async () => {
    const password = 'testpassword';
    const hashedPassword = await bcrypt.hash(password, 10);

    (db.query as jest.Mock).mockResolvedValueOnce({
      rows: [{
        id: 1,
        username: 'testuser',
        password: hashedPassword,
        is_admin: false,
        balance: 100,
        vault_balance: 50
      }]
    });

    const response = await request(app)
      .post('/api/auth/login')
      .send({ username: 'testuser', password });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
  });

  it('should return 200 and migrate for valid legacy login', async () => {
    const password = 'legacypassword';

    (db.query as jest.Mock).mockResolvedValueOnce({
      rows: [{
        id: 2,
        username: 'legacyuser',
        plain_password: password,
        is_admin: false
      }]
    });

    (db.query as jest.Mock).mockResolvedValueOnce({ rows: [] }); // For the update query

    const response = await request(app)
      .post('/api/auth/login')
      .send({ username: 'legacyuser', password });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');

    // Verify migration query was called
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE users SET password = $1, plain_password = NULL'),
      expect.any(Array)
    );
  });

  it('should return 401 for invalid password', async () => {
    const hashedPassword = await bcrypt.hash('correctpassword', 10);

    (db.query as jest.Mock).mockResolvedValueOnce({
      rows: [{
        id: 1,
        username: 'testuser',
        password: hashedPassword,
        is_admin: false
      }]
    });

    const response = await request(app)
      .post('/api/auth/login')
      .send({ username: 'testuser', password: 'wrongpassword' });

    expect(response.status).toBe(401);
  });

  it('should return 500 if JWT_SECRET is missing', async () => {
    delete process.env.JWT_SECRET;

    (db.query as jest.Mock).mockResolvedValueOnce({
      rows: [{
        id: 1,
        username: 'testuser',
        password: await bcrypt.hash('password', 10),
        is_admin: false
      }]
    });

    const response = await request(app)
      .post('/api/auth/login')
      .send({ username: 'testuser', password: 'password' });

    expect(response.status).toBe(500);
  });
});
