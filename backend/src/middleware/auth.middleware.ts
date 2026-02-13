import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';

/**
 * Extended Request interface with user data
 */
export interface AuthRequest extends Request {
  user?: {
    userId: number;
    email: string;
    role: string;
  };
}

/**
 * Verify JWT token and authenticate request
 */
export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction): void {
  // Get token from Authorization header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN format

  if (!token) {
    res.status(401).json({
      success: false,
      error: 'Access token is required',
    });
    return;
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, config.jwtSecret as jwt.Secret) as {
      userId: number;
      email: string;
      role: string;
    };

    // Attach user info to request
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        error: 'Access token has expired',
      });
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        error: 'Invalid access token',
      });
      return;
    }

    res.status(401).json({
      success: false,
      error: 'Authentication failed',
    });
  }
}

/**
 * Optional authentication - doesn't fail if no token
 * Useful for routes that work both for authenticated and unauthenticated users
 */
export function optionalAuthenticate(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    next();
    return;
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret as jwt.Secret) as {
      userId: number;
      email: string;
      role: string;
    };
    req.user = decoded;
  } catch (error) {
    // Ignore token errors for optional authentication
  }

  next();
}

/**
 * Check if user has required role
 */
export function requireRole(...allowedRoles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
      });
      return;
    }

    next();
  };
}
