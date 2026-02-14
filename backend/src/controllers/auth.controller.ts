import { Request, Response, NextFunction } from 'express';
import { getDatabase } from '../database/connection';
import { DatabaseService } from '../database/services/user.service';
import { TokenRepository } from '../database/repositories/token.repository';
import { AuthRequest } from '../middleware/auth.middleware';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '../config';

interface RegisterRequestBody {
  email: string;
  password: string;
  username?: string;
  phone?: string;
}

interface LoginRequestBody {
  email: string;
  password: string;
}

/**
 * Register a new user
 */
export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password, username, phone } = req.body as RegisterRequestBody;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required',
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format',
      });
    }

    // Validate password strength (minimum 8 characters)
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters long',
      });
    }

    const db = await getDatabase();
    const dbService = DatabaseService.getInstance();
    await dbService.initialize(db);
    const userService = dbService.getUserService();

    // Check if email already exists
    const existingUser = await userService.repository.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'User already exists with this email',
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, config.bcryptRounds);

    // Create user with generated account
    const user = await userService.registerUser(
      username || email.split('@')[0],
      passwordHash,
      email,
      phone
    );

    // Return created user without password
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        id: user.id,
        account: user.account,
        email: user.email,
        username: user.username,
        role: user.role,
        status: user.status,
        created_at: user.created_at,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Login user
 */
export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body as LoginRequestBody;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required',
      });
    }

    const db = await getDatabase();
    const dbService = DatabaseService.getInstance();
    await dbService.initialize(db);
    const userService = dbService.getUserService();

    // Find user by email
    const user = await userService.repository.findByEmail(email);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

    // Check if account is locked
    const isLocked = await userService.checkAccountLock(user.account);
    if (isLocked) {
      return res.status(401).json({
        success: false,
        error: 'Account is temporarily locked due to too many failed attempts',
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      await userService.handleFailedLogin(user.account);
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

    // Reset failed attempts on successful login
    await userService.handleSuccessfulLogin(user.account);

    // Generate JWT tokens
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      config.jwtSecret as jwt.Secret,
      { expiresIn: config.jwtExpiresIn as string }
    );

    const refreshToken = jwt.sign(
      { userId: user.id, type: 'refresh' },
      config.jwtSecret as jwt.Secret,
      { expiresIn: config.refreshTokenExpiresIn as string }
    );

    // Store refresh token in database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    db.run(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
      [user.id, refreshToken, expiresAt.toISOString()],
      (err: Error | null) => {
        if (err) {
          console.error('Failed to store refresh token:', err);
        }
      }
    );

    // Return user without password
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          account: user.account,
          email: user.email,
          username: user.username,
          role: user.role,
          status: user.status,
          avatar: user.avatar,
          created_at: user.created_at,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Logout user
 */
export async function logout(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    // User should be authenticated via middleware
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
    }

    const db = await getDatabase();
    const tokenRepository = new TokenRepository(db);

    // Delete all refresh tokens for this user
    await tokenRepository.deleteByUserId(req.user.userId);

    res.status(200).json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    next(error);
  }
}
