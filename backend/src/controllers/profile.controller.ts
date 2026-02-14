import { Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { getDatabase } from '../database/connection';
import { DatabaseService } from '../database/services/user.service';
import { toUserDTO, UserDTO } from '../database/models/user.model';
import { AuthRequest } from '../middleware/auth.middleware';
import { config } from '../config';

interface UpdateProfileBody {
  username?: string;
  email?: string;
  phone?: string;
  avatar?: string;
}

interface ChangePasswordBody {
  oldPassword: string;
  newPassword: string;
}

/**
 * Get current user profile
 */
export async function getProfile(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;

    const db = await getDatabase();
    const dbService = DatabaseService.getInstance();
    await dbService.initialize(db);
    const userService = dbService.getUserService();

    const user = await userService.getUserById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: toUserDTO(user),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update current user profile
 */
export async function updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const { username, email, phone, avatar } = req.body as UpdateProfileBody;

    const db = await getDatabase();
    const dbService = DatabaseService.getInstance();
    await dbService.initialize(db);
    const userService = dbService.getUserService();

    // Update user profile
    await userService.updateUserProfile(userId, username, email, phone, avatar);

    // Get updated user
    const updatedUser = await userService.getUserById(userId);

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: toUserDTO(updatedUser),
    });
  } catch (error: any) {
    // Handle duplicate email/phone errors
    if (error.message && (error.message.includes('邮箱已被使用') || error.message.includes('手机号已被使用'))) {
      return res.status(409).json({
        success: false,
        error: error.message,
      });
    }

    // Handle validation errors
    if (error.message && (
      error.message.includes('用户名长度必须在2-20个字符之间') ||
      error.message.includes('邮箱格式不正确') ||
      error.message.includes('手机号必须为11位数字')
    )) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    next(error);
  }
}

/**
 * Change user password
 */
export async function changePassword(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const { oldPassword, newPassword } = req.body as ChangePasswordBody;

    // Validate input
    if (!oldPassword) {
      return res.status(400).json({
        success: false,
        error: 'Old password is required',
      });
    }

    if (!newPassword) {
      return res.status(400).json({
        success: false,
        error: 'New password is required',
      });
    }

    const db = await getDatabase();
    const dbService = DatabaseService.getInstance();
    await dbService.initialize(db);
    const userService = dbService.getUserService();

    // Get current user
    const user = await userService.getUserById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // Verify old password
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Incorrect old password',
      });
    }

    // Validate new password
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 6 characters',
      });
    }

    // Hash new password and update
    const newPasswordHash = await bcrypt.hash(newPassword, config.bcryptRounds);
    await userService.changePassword(userId, oldPassword, newPasswordHash);

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
}
