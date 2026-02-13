import { Router } from 'express';
import { getProfile, updateProfile, changePassword } from '../controllers/profile.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

/**
 * @route   GET /api/profile
 * @desc    Get current user profile
 * @access  Private (requires token)
 */
router.get('/', authenticateToken, getProfile);

/**
 * @route   PUT /api/profile
 * @desc    Update current user profile
 * @access  Private (requires token)
 */
router.put('/', authenticateToken, updateProfile);

/**
 * @route   PUT /api/profile/password
 * @desc    Change user password
 * @access  Private (requires token)
 */
router.put('/password', authenticateToken, changePassword);

export { router as profileRoutes };
