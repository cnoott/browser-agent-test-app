import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { dbGet } from '../utils/database.js';
import { User } from '../types/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'local-test-only-jwt-secret';

// Simple in-memory token blacklist
const blacklistedTokens = new Set<string>();

export interface AuthRequest extends Request {
  user?: User;
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ success: false, error: 'Access token required' });
    return;
  }

  // Check if token is blacklisted
  if (blacklistedTokens.has(token)) {
    res.status(401).json({ success: false, error: 'Token has been invalidated' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; username: string };
    const user = await dbGet<User>('SELECT * FROM users WHERE id = ?', [decoded.id]);

    if (!user) {
      res.status(401).json({ success: false, error: 'Invalid token' });
      return;
    }

    req.user = user;
    next();
  } catch {
    res.status(403).json({ success: false, error: 'Invalid token' });
  }
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ success: false, error: 'Admin access required' });
    return;
  }
  next();
};

export const generateToken = (user: User) => {
  return jwt.sign(
    { id: user.id, username: user.username },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

export const invalidateToken = (token: string) => {
  blacklistedTokens.add(token);
  console.log(`Token invalidated. Total blacklisted tokens: ${blacklistedTokens.size}`);
};
