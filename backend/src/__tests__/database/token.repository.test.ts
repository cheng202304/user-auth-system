import sqlite3 from 'sqlite3';
import { TokenRepository } from '../../database/repositories/token.repository';
import { runMigrations } from '../../database/schema';

describe('TokenRepository Tests', () => {
  let db: sqlite3.Database;
  let tokenRepository: TokenRepository;

  // Helper to create a test user
  const createTestUser = (userId: number, email: string = 'test@example.com'): Promise<void> => {
    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO users (account, password_hash, username, email, phone, role, status)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          userId.toString().padStart(6, '0'),
          'hashed_password',
          `User ${userId}`,
          email,
          '13800138000',
          'student',
          1
        ],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  };

  beforeEach(async () => {
    // Create in-memory database
    db = await new Promise<sqlite3.Database>((resolve, reject) => {
      const database = new sqlite3.Database(':memory:', (err) => {
        if (err) reject(err);
        else resolve(database);
      });
    });

    // Enable foreign keys
    await new Promise<void>((resolve, reject) => {
      db.run('PRAGMA foreign_keys = ON', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Run migrations
    await runMigrations(db);

    // Initialize repository
    tokenRepository = new TokenRepository(db);
  });

  afterEach(async () => {
    await new Promise<void>((resolve, reject) => {
      db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });

  describe('findByToken', () => {
    it('should return null for non-existent token', async () => {
      const result = await tokenRepository.findByToken('non-existent-token');
      expect(result).toBeFalsy(); // Returns undefined or null
    });

    it('should find existing token', async () => {
      // Create user first
      await createTestUser(1);

      // Insert a test token
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      await new Promise<void>((resolve, reject) => {
        db.run(
          'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
          [1, 'test-token-123', expiresAt],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });

      const result = await tokenRepository.findByToken('test-token-123');

      expect(result).not.toBeNull();
      expect(result?.token).toBe('test-token-123');
      expect(result?.user_id).toBe(1);
    });
  });

  describe('findByUserId', () => {
    it('should return empty array for user with no tokens', async () => {
      await createTestUser(999);
      const result = await tokenRepository.findByUserId(999);
      expect(result).toEqual([]);
    });

    it('should find all tokens for a user', async () => {
      // Create users first
      await createTestUser(1, 'user1@example.com');
      await createTestUser(2, 'user2@example.com');

      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

      // Insert multiple tokens for users
      await new Promise<void>((resolve, reject) => {
        db.run(
          'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?), (?, ?, ?), (?, ?, ?)',
          [
            1, 'token-user1-1', expiresAt,
            1, 'token-user1-2', expiresAt,
            2, 'token-user2-1', expiresAt,
          ],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });

      const user1Tokens = await tokenRepository.findByUserId(1);
      const user2Tokens = await tokenRepository.findByUserId(2);

      expect(user1Tokens).toHaveLength(2);
      expect(user2Tokens).toHaveLength(1);
    });
  });

  describe('deleteByToken', () => {
    it('should return false for non-existent token', async () => {
      const result = await tokenRepository.deleteByToken('non-existent');
      expect(result).toBe(false);
    });

    it('should delete existing token and return true', async () => {
      // Create user first
      await createTestUser(1);

      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      await new Promise<void>((resolve, reject) => {
        db.run(
          'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
          [1, 'token-to-delete', expiresAt],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });

      const result = await tokenRepository.deleteByToken('token-to-delete');

      expect(result).toBe(true);

      // Verify token is deleted
      const deletedToken = await tokenRepository.findByToken('token-to-delete');
      expect(deletedToken).toBeFalsy();
    });
  });

  describe('deleteByUserId', () => {
    it('should return 0 for user with no tokens', async () => {
      await createTestUser(999);
      const result = await tokenRepository.deleteByUserId(999);
      expect(result).toBe(0);
    });

    it('should delete all tokens for a user', async () => {
      // Create users first
      await createTestUser(1, 'user1@example.com');
      await createTestUser(2, 'user2@example.com');

      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

      // Insert tokens for multiple users
      await new Promise<void>((resolve, reject) => {
        db.run(
          'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?), (?, ?, ?), (?, ?, ?)',
          [
            1, 'token1', expiresAt,
            1, 'token2', expiresAt,
            2, 'token3', expiresAt,
          ],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });

      const deletedCount = await tokenRepository.deleteByUserId(1);

      expect(deletedCount).toBe(2);

      // Verify only user 1's tokens are deleted
      const user1Tokens = await tokenRepository.findByUserId(1);
      const user2Tokens = await tokenRepository.findByUserId(2);

      expect(user1Tokens).toHaveLength(0);
      expect(user2Tokens).toHaveLength(1);
    });
  });

  describe('deleteExpired', () => {
    it('should return 0 when no expired tokens', async () => {
      // Create user first
      await createTestUser(1);

      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      await new Promise<void>((resolve, reject) => {
        db.run(
          'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
          [1, 'valid-token', expiresAt],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });

      const deletedCount = await tokenRepository.deleteExpired();

      expect(deletedCount).toBe(0);
    });

    it('should delete expired tokens', async () => {
      // Create user first
      await createTestUser(1);

      // Insert an expired token
      const expiredDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      await new Promise<void>((resolve, reject) => {
        db.run(
          'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
          [1, 'expired-token', expiredDate],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });

      const deletedCount = await tokenRepository.deleteExpired();

      expect(deletedCount).toBe(1);

      // Verify token is deleted
      const token = await tokenRepository.findByToken('expired-token');
      expect(token).toBeFalsy();
    });

    it('should only delete expired tokens, keep valid ones', async () => {
      // Create user first
      await createTestUser(1);

      const expiredDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const validDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

      await new Promise<void>((resolve, reject) => {
        db.run(
          'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?), (?, ?, ?)',
          [1, 'expired-token', expiredDate, 1, 'valid-token', validDate],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });

      const deletedCount = await tokenRepository.deleteExpired();

      expect(deletedCount).toBe(1);

      // Verify only expired token is deleted
      const expiredToken = await tokenRepository.findByToken('expired-token');
      const validToken = await tokenRepository.findByToken('valid-token');

      expect(expiredToken).toBeFalsy();
      expect(validToken).not.toBeFalsy();
    });
  });
});
