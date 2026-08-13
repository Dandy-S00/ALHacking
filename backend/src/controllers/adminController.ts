import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../db';
export const createPlayer = async (req: Request, res: Response) => {
  const { username, initialPassword } = req.body;
  const hashedPassword = await bcrypt.hash(initialPassword, 10);
  // Security fix: do not store initialPassword in plain_password
  const result = await query('INSERT INTO users (username, password, plain_password, balance) VALUES ($1, $2, NULL, 0) RETURNING id, username', [username, hashedPassword]);
  res.status(201).json(result.rows[0]);
};
export const updatePlayerBalance = async (req: Request, res: Response) => {
  const { userId, amount, type } = req.body;
  const adjustment = type === 'load' ? amount : -amount;
  await query('UPDATE users SET balance = balance + $1 WHERE id = $2', [adjustment, userId]);
  await query('INSERT INTO transactions (user_id, amount, type, description) VALUES ($1, $2, $3, \'Admin adjustment\')', [userId, amount, type]);
  res.json({ message: 'Updated' });
};
export const getAllPlayers = async (req: Request, res: Response) => {
  const result = await query('SELECT * FROM users WHERE is_admin = FALSE');
  res.json(result.rows);
};
export const getTransactions = async (req: Request, res: Response) => {
  const result = await query('SELECT t.*, u.username FROM transactions t JOIN users u ON t.user_id = u.id ORDER BY t.created_at DESC');
  res.json(result.rows);
};
