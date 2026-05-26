import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
export const authenticateToken = (req: any, res: Response, next: NextFunction) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.sendStatus(401);
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error('JWT_SECRET not configured');
    return res.sendStatus(500);
  }
  jwt.verify(token, secret, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};
export const isAdmin = (req: any, res: Response, next: NextFunction) => {
  if (!req.user?.isAdmin) return res.status(403).json({ message: 'Admin required' });
  next();
};
