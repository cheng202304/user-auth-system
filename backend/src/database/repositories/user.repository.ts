import { Database } from 'sqlite3';
import { User, CreateUserData, UpdateUserData, UserFilters, UserListResult, UserRole, UserStatus } from '../models/user.model';

/**
 * User Repository - handles all database operations for users table
 */
export class UserRepository {
  constructor(private db: Database) {}

  /**
   * Find user by ID
   */
  async findById(id: number): Promise<User | null> {
    return this.queryOne(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );
  }

  /**
   * Find user by account
   */
  async findByAccount(account: string): Promise<User | null> {
    return this.queryOne(
      'SELECT * FROM users WHERE account = ?',
      [account]
    );
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.queryOne(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
  }

  /**
   * Find user by phone
   */
  async findByPhone(phone: string): Promise<User | null> {
    return this.queryOne(
      'SELECT * FROM users WHERE phone = ?',
      [phone]
    );
  }

  /**
   * Search users by username (fuzzy search)
   */
  async searchByUsername(username: string): Promise<User[]> {
    return this.queryAll(
      'SELECT * FROM users WHERE username LIKE ?',
      [`%${username}%`]
    );
  }

  /**
   * Find user by username (exact match)
   */
  async findByUsername(username: string): Promise<User | null> {
    return this.queryOne(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
  }

  /**
   * Get paginated user list with filters
   */
  async findAll(
    page: number = 1,
    pageSize: number = 20,
    filters?: UserFilters
  ): Promise<UserListResult> {
    const conditions: string[] = [];
    const params: any[] = [];

    // Build WHERE clause from filters
    if (filters) {
      if (filters.account) {
        conditions.push('account = ?');
        params.push(filters.account);
      }

      if (filters.username) {
        conditions.push('username LIKE ?');
        params.push(`%${filters.username}%`);
      }

      if (filters.keyword) {
        conditions.push('username LIKE ?');
        params.push(`%${filters.keyword}%`);
      }

      if (filters.role) {
        conditions.push('role = ?');
        params.push(filters.role);
      }

      if (filters.status !== undefined) {
        conditions.push('status = ?');
        params.push(filters.status);
      }
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const offset = (page - 1) * pageSize;

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM users ${whereClause}`;
    const countResult = await this.queryOne(countQuery, params);
    const total = countResult?.total || 0;

    // Get paginated list
    const listQuery = `
      SELECT * FROM users
      ${whereClause}
      ORDER BY account ASC
      LIMIT ? OFFSET ?
    `;
    const list = await this.queryAll(listQuery, [...params, pageSize, offset]);

    return {
      list,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * Create new user
   */
  async create(userData: CreateUserData): Promise<User> {
    const query = `
      INSERT INTO users (
        account, password_hash, username, email, phone, role, avatar, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      userData.account,
      userData.password,
      userData.username,
      userData.email || null,
      userData.phone || null,
      userData.role || UserRole.STUDENT,
      userData.avatar || null,
      userData.status !== undefined ? userData.status : UserStatus.ACTIVE,
    ];

    await this.run(query, params);

    const lastId = await this.getLastInsertId();
    const user = await this.findById(lastId);

    if (!user) {
      throw new Error('Failed to create user');
    }

    return user;
  }

  /**
   * Update user by ID
   */
  async update(id: number, userData: UpdateUserData): Promise<void> {
    const updates: string[] = [];
    const params: any[] = [];

    if (userData.username !== undefined) {
      updates.push('username = ?');
      params.push(userData.username);
    }

    if (userData.email !== undefined) {
      updates.push('email = ?');
      params.push(userData.email);
    }

    if (userData.phone !== undefined) {
      updates.push('phone = ?');
      params.push(userData.phone);
    }

    if (userData.role !== undefined) {
      updates.push('role = ?');
      params.push(userData.role);
    }

    if (userData.avatar !== undefined) {
      updates.push('avatar = ?');
      params.push(userData.avatar);
    }

    if (userData.status !== undefined) {
      updates.push('status = ?');
      params.push(userData.status);
    }

    if (userData.password !== undefined) {
      updates.push('password_hash = ?');
      params.push(userData.password);
    }

    if (userData.failed_attempts !== undefined) {
      updates.push('failed_attempts = ?');
      params.push(userData.failed_attempts);
    }

    if (userData.locked_until !== undefined) {
      updates.push('locked_until = ?');
      params.push(userData.locked_until);
    } else if (userData.locked_until === null) {
      updates.push('locked_until = NULL');
    }

    if (updates.length === 0) {
      return;
    }

    params.push(id);

    const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
    await this.run(query, params);
  }

  /**
   * Delete user by ID
   */
  async delete(id: number): Promise<void> {
    await this.run('DELETE FROM users WHERE id = ?', [id]);
  }

  /**
   * Check if account exists
   */
  async accountExists(account: string): Promise<boolean> {
    const user = await this.findByAccount(account);
    return user !== null;
  }

  /**
   * Check if email exists
   */
  async emailExists(email: string, excludeId?: number): Promise<boolean> {
    const query = excludeId
      ? 'SELECT id FROM users WHERE email = ? AND id != ?'
      : 'SELECT id FROM users WHERE email = ?';

    const params = excludeId ? [email, excludeId] : [email];
    const result = await this.queryOne(query, params);
    return result !== null;
  }

  /**
   * Check if phone exists
   */
  async phoneExists(phone: string, excludeId?: number): Promise<boolean> {
    const query = excludeId
      ? 'SELECT id FROM users WHERE phone = ? AND id != ?'
      : 'SELECT id FROM users WHERE phone = ?';

    const params = excludeId ? [phone, excludeId] : [phone];
    const result = await this.queryOne(query, params);
    return result !== null;
  }

  /**
   * Increment failed login attempts
   */
  async incrementFailedAttempts(account: string): Promise<void> {
    await this.run(
      'UPDATE users SET failed_attempts = failed_attempts + 1 WHERE account = ?',
      [account]
    );
  }

  /**
   * Reset failed login attempts
   */
  async resetFailedAttempts(account: string): Promise<void> {
    await this.run(
      'UPDATE users SET failed_attempts = 0, locked_until = NULL WHERE account = ?',
      [account]
    );
  }

  /**
   * Lock user account
   */
  async lockAccount(account: string, lockDuration: number = 30): Promise<void> {
    const lockedUntil = new Date(Date.now() + lockDuration * 60 * 1000);
    await this.run(
      'UPDATE users SET locked_until = ? WHERE account = ?',
      [lockedUntil.toISOString(), account]
    );
  }

  /**
   * Check if account is locked
   */
  async isAccountLocked(account: string): Promise<boolean> {
    const user = await this.findByAccount(account);
    if (!user || !user.locked_until) {
      return false;
    }

    const lockedUntil = new Date(user.locked_until as string);
    if (lockedUntil > new Date()) {
      return true;
    }

    // Lock expired, reset it
    await this.resetFailedAttempts(account);
    return false;
  }

  /**
   * Get available account numbers (not used)
   */
  async getUsedAccounts(): Promise<string[]> {
    const result = await this.queryAll('SELECT account FROM users');
    return result.map((row: any) => row.account);
  }

  /**
   * Count users by role
   */
  async countByRole(role: UserRole): Promise<number> {
    const result = await this.queryOne(
      'SELECT COUNT(*) as count FROM users WHERE role = ?',
      [role]
    );
    return result?.count || 0;
  }

  /**
   * Count users by status
   */
  async countByStatus(status: number): Promise<number> {
    const result = await this.queryOne(
      'SELECT COUNT(*) as count FROM users WHERE status = ?',
      [status]
    );
    return result?.count || 0;
  }

  /**
   * Helper method to execute a query and return a single row
   */
  private async queryOne(sql: string, params: any[] = []): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row || null);
        }
      });
    });
  }

  /**
   * Helper method to execute a query and return all rows
   */
  private async queryAll(sql: string, params: any[] = []): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows || []);
        }
      });
    });
  }

  /**
   * Helper method to execute a query without returning results
   */
  private async run(sql: string, params: any[] = []): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Get last inserted row ID
   */
  private async getLastInsertId(): Promise<number> {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT last_insert_rowid() as id', [], (err, row: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(row?.id || 0);
        }
      });
    });
  }
}
