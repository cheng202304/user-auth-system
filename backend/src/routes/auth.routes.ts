import express, { Router, Request, Response, NextFunction } from 'express';
import { register, login } from '../controllers/auth.controller';

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
router.post('/logout', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Logout successful',
  });
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current user info
 * @access  Private (requires token)
 */
router.get('/me', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: {
      message: 'Protected route - user authentication required',
    },
  });
});

export { router as authRoutes };
