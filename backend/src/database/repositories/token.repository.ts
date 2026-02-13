import { Database } from 'sqlite3';

/**
 * Token Repository - handles all database operations for refresh_tokens table
 */
export class TokenRepository {
  constructor(private db: Database) {}

  /**
   * Delete all refresh tokens for a user
   * Used during logout to invalidate all sessions
   */
  async deleteByUserId(userId: number): Promise<number> {
    return new Promise((resolve, reject) => {
      this.db.run(
        'DELETE FROM refresh_tokens WHERE user_id = ?',
        [userId],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.changes);
          }
        }
      );
    });
  }

  /**
   * Delete a specific refresh token
   */
  async deleteByToken(token: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.db.run(
        'DELETE FROM refresh_tokens WHERE token = ?',
        [token],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.changes > 0);
          }
        }
      );
    });
  }

  /**
   * Find a refresh token by token string
   */
  async findByToken(token: string): Promise<{ id: number; user_id: number; token: string; expires_at: string } | null> {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT id, user_id, token, expires_at FROM refresh_tokens WHERE token = ?',
        [token],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row as { id: number; user_id: number; token: string; expires_at: string } | null);
          }
        }
      );
    });
  }

  /**
   * Find all refresh tokens for a user
   */
  async findByUserId(userId: number): Promise<Array<{ id: number; token: string; expires_at: string; created_at: string }>> {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT id, token, expires_at, created_at FROM refresh_tokens WHERE user_id = ?',
        [userId],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows as Array<{ id: number; token: string; expires_at: string; created_at: string }>);
          }
        }
      );
    });
  }

  /**
   * Delete expired refresh tokens
   */
  async deleteExpired(): Promise<number> {
    return new Promise((resolve, reject) => {
      this.db.run(
        'DELETE FROM refresh_tokens WHERE expires_at < datetime("now")',
        [],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.changes);
          }
        }
      );
    });
  }
}
