import sqlite3 from 'sqlite3';
import { initializeDatabase, closeDatabase, getDatabaseService } from '../../database/connection';
import { UserRepository } from '../../database/repositories/user.repository';
import { UserService, DatabaseService } from '../../database/services/user.service';
import { User, CreateUserData, UserRole, UserStatus } from '../../database/models/user.model';
import bcrypt from 'bcrypt';

/**
 * Test database utilities
 */

/**
 * Create in-memory database for testing
 */
export async function createTestDatabase(): Promise<sqlite3.Database> {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(':memory:', async (err) => {
      if (err) {
        reject(err);
      } else {
        console.log('Test database created in memory');
        resolve(db);
      }
    });
  });
}

/**
 * Setup test database with migrations
 */
export async function setupTestDatabase(db: sqlite3.Database): Promise<void> {
  const { runMigrations } = await import('../../database/schema');
  await runMigrations(db);

  // Initialize database service with test database
  const dbService = DatabaseService.getInstance();
  await dbService.initialize(db);
}

/**
 * Clean up test database
 */
export async function cleanupTestDatabase(db: sqlite3.Database): Promise<void> {
  return new Promise((resolve, reject) => {
    db.close((err) => {
      if (err) {
        reject(err);
      } else {
        console.log('Test database closed');
        resolve();
      }
    });
  });
}

/**
 * Hash password for testing
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/**
 * Create test user
 */
export async function createTestUser(
  db: sqlite3.Database,
  userData: Partial<CreateUserData> = {}
): Promise<User> {
  const hashedPassword = await hashPassword(userData.password || 'password123');

  const createData: CreateUserData = {
    account: userData.account || '123456',
    password: hashedPassword,
    username: userData.username || 'Test User',
    email: userData.email || 'test@example.com',
    phone: userData.phone || '13800138000',
    role: userData.role || UserRole.STUDENT,
    status: userData.status || UserStatus.ACTIVE,
  };

  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO users (account, password, username, email, phone, role, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [createData.account, createData.password, createData.username, createData.email, createData.phone, createData.role, createData.status],
      function(this: any, err: Error | null) {
        if (err) {
          reject(err);
        } else {
          db.get('SELECT * FROM users WHERE id = ?', [this.lastID], (err: Error | null, row: any) => {
            if (err) {
              reject(err);
            } else {
              resolve(row as User);
            }
          });
        }
      }
    );
  });
}

/**
 * Create multiple test users
 */
export async function createTestUsers(
  db: sqlite3.Database,
  count: number,
  startIndex: number = 1
): Promise<User[]> {
  const users: User[] = [];

  for (let i = 0; i < count; i++) {
    const account = (startIndex + i).toString().padStart(6, '0');
    const user = await createTestUser(db, {
      account,
      username: `Test User ${i + 1}`,
      email: `user${i + 1}@example.com`,
    });
    users.push(user);
  }

  return users;
}

/**
 * Clear all users from database
 */
export async function clearUsers(db: sqlite3.Database): Promise<void> {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM users', (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

/**
 * Get user count
 */
export async function getUserCount(db: sqlite3.Database): Promise<number> {
  return new Promise((resolve, reject) => {
    db.get('SELECT COUNT(*) as count FROM users', (err, row: any) => {
      if (err) {
        reject(err);
      } else {
        resolve(row?.count || 0);
      }
    });
  });
}
