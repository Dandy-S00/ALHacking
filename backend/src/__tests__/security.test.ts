import app from '../app';
import request from 'supertest';
import * as db from '../db';
import bcrypt from 'bcryptjs';

jest.mock('../db');

describe('Security - Password Hashing & Migration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should migrate plaintext password on successful login', async () => {
    const plainPassword = 'password123';
    const mockUser = {
      id: 1,
      username: 'testuser',
      plain_password: plainPassword,
      password: null,
      is_admin: false,
      balance: 100,
      vault_balance: 50
    };

    (db.query as jest.Mock).mockResolvedValueOnce({ rows: [mockUser] });
    (db.query as jest.Mock).mockResolvedValueOnce({ rows: [] }); // For UPDATE

    const response = await request(app)
      .post('/api/auth/login')
      .send({ username: 'testuser', password: plainPassword });

    expect(response.status).toBe(200);
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE users SET password = $1, plain_password = NULL WHERE id = $2'),
      expect.any(Array)
    );

    const updateArgs = (db.query as jest.Mock).mock.calls[1][1];
    const hashedPassword = updateArgs[0];
    expect(await bcrypt.compare(plainPassword, hashedPassword)).toBe(true);
  });

  it('should login successfully with hashed password', async () => {
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);
    const mockUser = {
      id: 1,
      username: 'testuser',
      password: hashedPassword,
      plain_password: null,
      is_admin: false,
      balance: 100,
      vault_balance: 50
    };

    (db.query as jest.Mock).mockResolvedValueOnce({ rows: [mockUser] });

    const response = await request(app)
      .post('/api/auth/login')
      .send({ username: 'testuser', password: password });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
  });

  it('should fail login with incorrect password', async () => {
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);
    const mockUser = {
      id: 1,
      username: 'testuser',
      password: hashedPassword,
      plain_password: null
    };

    (db.query as jest.Mock).mockResolvedValueOnce({ rows: [mockUser] });

    const response = await request(app)
      .post('/api/auth/login')
      .send({ username: 'testuser', password: 'wrongpassword' });

    expect(response.status).toBe(401);
  });
});
