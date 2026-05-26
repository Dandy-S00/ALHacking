import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { query } from '../db';
export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  const result = await query('SELECT * FROM users WHERE username = $1', [username]);
  const user = result.rows[0];
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  let isValid = false;
  if (user.password) {
    isValid = await bcrypt.compare(password, user.password);
  } else if (user.plain_password) {
    // Lazy migration: check plaintext and migrate to hash
    isValid = password === user.plain_password;
    if (isValid) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await query('UPDATE users SET password = $1, plain_password = NULL WHERE id = $2', [hashedPassword, user.id]);
    }
  }

  if (!isValid) return res.status(401).json({ message: 'Invalid credentials' });

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error('JWT_SECRET not configured');
    return res.status(500).json({ message: 'Internal server error' });
  }

  const token = jwt.sign({ id: user.id, username: user.username, isAdmin: user.is_admin }, secret);
  res.json({ token, user: { id: user.id, username: user.username, balance: user.balance, vaultBalance: user.vault_balance, isAdmin: user.is_admin } });
};
export const changePassword = async (req: any, res: Response) => {
  const hashedPassword = await bcrypt.hash(req.body.newPassword, 10);
  await query('UPDATE users SET password = $1, plain_password = NULL, password_changed_by_user = TRUE WHERE id = $2', [hashedPassword, req.user.id]);
  res.json({ message: 'Updated' });
};
export const getMe = async (req: any, res: Response) => {
  const result = await query('SELECT id, username, balance, vault_balance, is_admin FROM users WHERE id = $1', [req.user.id]);
  res.json(result.rows[0]);
};
