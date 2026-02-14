import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authenticateToken, optionalAuthenticate, requireRole, AuthRequest } from '../../middleware/auth.middleware';
import { config } from '../../config';

// Mock config for testing
jest.mock('../../config', () => ({
  config: {
    jwtSecret: 'test-secret-key',
  },
}));

describe('Auth Middleware Tests', () => {
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock<NextFunction>;

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis() as any,
      json: jest.fn().mockReturnThis() as any,
    };
    nextFunction = jest.fn();
  });

  describe('authenticateToken', () => {
    it('should return 401 if no token provided', () => {
      mockRequest.headers = {};

      authenticateToken(
        mockRequest as AuthRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Access token is required',
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 401 if token format is invalid', () => {
      mockRequest.headers = {
        authorization: 'InvalidFormat token',
      };

      authenticateToken(
        mockRequest as AuthRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 401 for invalid token', () => {
      mockRequest.headers = {
        authorization: 'Bearer invalid-token',
      };

      authenticateToken(
        mockRequest as AuthRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid access token',
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 401 for expired token', () => {
      const expiredToken = jwt.sign(
        { userId: 1, email: 'test@example.com', role: 'student' },
        config.jwtSecret as string,
        { expiresIn: '-1s' } // Expired
      );

      mockRequest.headers = {
        authorization: `Bearer ${expiredToken}`,
      };

      authenticateToken(
        mockRequest as AuthRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Access token has expired',
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should call next() and attach user for valid token', () => {
      const validToken = jwt.sign(
        { userId: 1, email: 'test@example.com', role: 'student' },
        config.jwtSecret as string,
        { expiresIn: '1h' }
      );

      mockRequest.headers = {
        authorization: `Bearer ${validToken}`,
      };

      authenticateToken(
        mockRequest as AuthRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalled();
      expect(mockRequest.user).toMatchObject({
        userId: 1,
        email: 'test@example.com',
        role: 'student',
      });
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should handle different user roles in token', () => {
      const roles = ['student', 'teacher', 'admin', 'super_admin'];

      roles.forEach((role) => {
        const token = jwt.sign(
          { userId: 1, email: 'test@example.com', role },
          config.jwtSecret as string,
          { expiresIn: '1h' }
        );

        mockRequest.headers = {
          authorization: `Bearer ${token}`,
        };

        // Reset mocks
        nextFunction.mockClear();

        authenticateToken(
          mockRequest as AuthRequest,
          mockResponse as Response,
          nextFunction
        );

        expect(nextFunction).toHaveBeenCalled();
        expect(mockRequest.user?.role).toBe(role);
      });
    });
  });

  describe('optionalAuthenticate', () => {
    it('should call next() without token', () => {
      mockRequest.headers = {};

      optionalAuthenticate(
        mockRequest as AuthRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalled();
      expect(mockRequest.user).toBeUndefined();
    });

    it('should call next() with invalid token (optional)', () => {
      mockRequest.headers = {
        authorization: 'Bearer invalid-token',
      };

      optionalAuthenticate(
        mockRequest as AuthRequest,
        mockResponse as Response,
        nextFunction
      );

      // Optional auth should still call next() even with invalid token
      expect(nextFunction).toHaveBeenCalled();
      expect(mockRequest.user).toBeUndefined();
    });

    it('should attach user for valid token', () => {
      const validToken = jwt.sign(
        { userId: 1, email: 'test@example.com', role: 'student' },
        config.jwtSecret as string,
        { expiresIn: '1h' }
      );

      mockRequest.headers = {
        authorization: `Bearer ${validToken}`,
      };

      optionalAuthenticate(
        mockRequest as AuthRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalled();
      expect(mockRequest.user).toMatchObject({
        userId: 1,
        email: 'test@example.com',
        role: 'student',
      });
    });
  });

  describe('requireRole', () => {
    it('should return 401 if no user attached', () => {
      mockRequest.user = undefined;

      const middleware = requireRole('admin');

      middleware(
        mockRequest as AuthRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Authentication required',
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 403 if user role not allowed', () => {
      mockRequest.user = {
        userId: 1,
        email: 'test@example.com',
        role: 'student',
      };

      const middleware = requireRole('admin', 'super_admin');

      middleware(
        mockRequest as AuthRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Insufficient permissions',
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should call next() if user role is allowed', () => {
      mockRequest.user = {
        userId: 1,
        email: 'test@example.com',
        role: 'admin',
      };

      const middleware = requireRole('admin', 'super_admin');

      middleware(
        mockRequest as AuthRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should work with single role', () => {
      mockRequest.user = {
        userId: 1,
        email: 'test@example.com',
        role: 'student',
      };

      const middleware = requireRole('student');

      middleware(
        mockRequest as AuthRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalled();
    });

    it('should work with multiple allowed roles', () => {
      const testCases = [
        { userRole: 'student', allowedRoles: ['student', 'teacher'] },
        { userRole: 'teacher', allowedRoles: ['student', 'teacher'] },
        { userRole: 'admin', allowedRoles: ['admin', 'super_admin'] },
      ];

      testCases.forEach(({ userRole, allowedRoles }) => {
        mockRequest.user = {
          userId: 1,
          email: 'test@example.com',
          role: userRole,
        };

        const middleware = requireRole(...allowedRoles);

        nextFunction.mockClear();
        (mockResponse.status as jest.Mock).mockClear();

        middleware(
          mockRequest as AuthRequest,
          mockResponse as Response,
          nextFunction
        );

        expect(nextFunction).toHaveBeenCalled();
      });
    });
  });
});
