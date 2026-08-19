import express from 'express';
import bcrypt from 'bcryptjs';
import { dbGet, dbRun } from '../utils/database.js';
import { generateToken, authenticateToken, invalidateToken, AuthRequest } from '../middleware/auth.js';
import { User, LoginRequest, RegisterRequest } from '../types/index.js';

const router = express.Router();

// Login route
router.post('/login', async (req, res) => {
  try {
    const { username, password, rememberMe }: LoginRequest = req.body;

    if (!username || !password) {
      res.status(400).json({
        success: false,
        error: 'Username and password are required'
      });
      return;
    }

    const user = await dbGet<User>('SELECT * FROM users WHERE username = ?', [username]);

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
      return;
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
      return;
    }

    const token = generateToken(user);

    // Set cookie if remember me is checked
    if (rememberMe) {
      res.cookie('authToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });
    }

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Register route
router.post('/register', async (req, res) => {
  try {
    const { username, email, password }: RegisterRequest = req.body;

    if (!username || !email || !password) {
      res.status(400).json({
        success: false,
        error: 'Username, email, and password are required'
      });
      return;
    }

    // Check if user already exists
    const existingUser = await dbGet('SELECT * FROM users WHERE username = ? OR email = ?', [username, email]);

    if (existingUser) {
      res.status(409).json({
        success: false,
        error: 'User already exists'
      });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    await dbRun(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );

    const newUser = await dbGet<User>('SELECT * FROM users WHERE username = ?', [username]);

    if (!newUser) {
      throw new Error('Newly registered user could not be loaded');
    }
    const token = generateToken(newUser);

    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role
        }
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get current user
router.get('/me', authenticateToken, async (req: AuthRequest, res) => {
  res.json({
    success: true,
    data: {
      user: {
        id: req.user!.id,
        username: req.user!.username,
        email: req.user!.email,
        role: req.user!.role
      }
    }
  });
});

// Logout route
router.post('/logout', (req, res) => {
  // Get token from Authorization header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    // Invalidate the token so it can't be used again
    invalidateToken(token);
  }

  res.clearCookie('authToken');
  res.json({ success: true, message: 'Logged out successfully' });
});

export default router;
