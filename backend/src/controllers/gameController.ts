import { Request, Response } from 'express';
import { query } from '../db';
export const handleVault = async (req: any, res: Response) => {
  const { amount, action } = req.body;
  if (action === 'deposit') {
    await query('UPDATE users SET balance = balance - $1, vault_balance = vault_balance + $1 WHERE id = $2', [amount, req.user.id]);
  } else {
    await query('UPDATE users SET balance = balance + $1, vault_balance = vault_balance - $1 WHERE id = $2', [amount, req.user.id]);
  }
  res.json({ message: 'Success' });
};
export const logGameResult = async (req: any, res: Response) => {
  const { gameType, betAmount, winAmount } = req.body;
  await query('INSERT INTO game_sessions (user_id, game_type, bet_amount, win_amount) VALUES ($1, $2, $3, $4)', [req.user.id, gameType, betAmount, winAmount]);
  await query('UPDATE users SET balance = balance + $1 WHERE id = $2', [winAmount - betAmount, req.user.id]);
  res.json({ message: 'Logged' });
};
