import express, { Router, Request, Response, NextFunction } from 'express';
import { register, login, logout } from '../controllers/auth.controller';
import { authenticateToken, AuthRequest } from '../middleware/auth.middleware';
import { getDatabase } from '../database/connection';
import { DatabaseService } from '../database/services/user.service';

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', login);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private (requires token)
 */
router.post('/logout', authenticateToken, logout);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user info
 * @access  Private (requires token)
 */
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
    }

    const db = await getDatabase();
    const dbService = DatabaseService.getInstance();
    await dbService.initialize(db);
    const userService = dbService.getUserService();

    const user = await userService.getUserById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        account: user.account,
        email: user.email,
        username: user.username,
        role: user.role,
        status: user.status,
        avatar: user.avatar,
        created_at: user.created_at,
      },
    });
  } catch (error) {
    next(error);
  }
});

export { router as authRoutes };
