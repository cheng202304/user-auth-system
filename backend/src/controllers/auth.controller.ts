import { Request, Response, NextFunction } from 'express';
import { getDatabase } from '../database/connection';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '../config';

interface RegisterRequestBody {
  email: string;
  password: string;
  username?: string;
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
    const { email, password, username } = req.body as RegisterRequestBody;

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

    // Check if user already exists
    db.get('SELECT id FROM users WHERE email = ?', [email], async (err: Error | null, row: any) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: 'Database error',
        });
      }

      if (row) {
        return res.status(409).json({
          success: false,
          error: 'User already exists with this email',
        });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, config.bcryptRounds);

      // Insert new user
      db.run(
        'INSERT INTO users (email, password_hash, username) VALUES (?, ?, ?)',
        [email, passwordHash, username || null],
        function (err: Error | null) {
          if (err) {
            return res.status(500).json({
              success: false,
              error: 'Failed to create user',
            });
          }

          // Get the newly created user
          db.get('SELECT id, email, username, email_verified, role, status, created_at FROM users WHERE id = ?', [this.lastID], (err: Error | null, user: any) => {
            if (err || !user) {
              return res.status(500).json({
                success: false,
                error: 'User created but failed to retrieve',
              });
            }

            res.status(201).json({
              success: true,
              message: 'User registered successfully',
              data: user,
            });
          });
        }
      );
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

    // Find user by email
    db.get(
      'SELECT id, email, password_hash, username, email_verified, role, status FROM users WHERE email = ?',
      [email],
      async (err: Error | null, user: any) => {
        if (err) {
          return res.status(500).json({
            success: false,
            error: 'Database error',
          });
        }

        if (!user) {
          return res.status(401).json({
            success: false,
            error: 'Invalid email or password',
          });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordValid) {
          return res.status(401).json({
            success: false,
            error: 'Invalid email or password',
          });
        }

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

        // Remove password from response
        const { password_hash: _, ...userWithoutPassword } = user;

        res.status(200).json({
          success: true,
          message: 'Login successful',
          data: {
            accessToken,
            refreshToken,
            user: userWithoutPassword,
          },
        });
      }
    );
  } catch (error) {
    next(error);
  }
}
