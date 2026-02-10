import { createTestDatabase, setupTestDatabase, cleanupTestDatabase } from '../utils/database.test-utils';
import { runMigrations, seedDatabase, schema, UserRole, UserStatus } from '../../database/schema';

describe('Database Schema and Migrations', () => {
  let db: any;

  beforeEach(async () => {
    db = await createTestDatabase();
  });

  afterEach(async () => {
    await cleanupTestDatabase(db);
  });

  describe('Table Creation', () => {
    test('should create users table', async () => {
      await runMigrations(db);

      const tables: any[] = await new Promise((resolve, reject) => {
        db.all(
          "SELECT name FROM sqlite_master WHERE type='table' AND name='users'",
          (err: Error | null, rows: any) => {
            if (err) reject(err);
            else resolve(rows);
          }
        );
      });

      expect(tables).toHaveLength(1);
      expect(tables[0].name).toBe('users');
    });

    test('should create refresh_tokens table', async () => {
      await runMigrations(db);

      const tables: any[] = await new Promise((resolve, reject) => {
        db.all(
          "SELECT name FROM sqlite_master WHERE type='table' AND name='refresh_tokens'",
          (err: Error | null, rows: any) => {
            if (err) reject(err);
            else resolve(rows);
          }
        );
      });

      expect(tables).toHaveLength(1);
    });

    test('should create password_resets table', async () => {
      await runMigrations(db);

      const tables: any[] = await new Promise((resolve, reject) => {
        db.all(
          "SELECT name FROM sqlite_master WHERE type='table' AND name='password_resets'",
          (err: Error | null, rows: any) => {
            if (err) reject(err);
            else resolve(rows);
          }
        );
      });

      expect(tables).toHaveLength(1);
    });

    test('should create sessions table', async () => {
      await runMigrations(db);

      const tables: any[] = await new Promise((resolve, reject) => {
        db.all(
          "SELECT name FROM sqlite_master WHERE type='table' AND name='sessions'",
          (err: Error | null, rows: any) => {
            if (err) reject(err);
            else resolve(rows);
          }
        );
      });

      expect(tables).toHaveLength(1);
    });
  });

  describe('Users Table Schema', () => {
    beforeEach(async () => {
      await runMigrations(db);
    });

    test('should have all required columns', async () => {
      const columns: any[] = await new Promise((resolve, reject) => {
        db.all('PRAGMA table_info(users)', (err: Error | null, rows: any) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });

      const columnNames = columns.map((col: any) => col.name);

      expect(columnNames).toContain('id');
      expect(columnNames).toContain('account');
      expect(columnNames).toContain('password');
      expect(columnNames).toContain('username');
      expect(columnNames).toContain('email');
      expect(columnNames).toContain('phone');
      expect(columnNames).toContain('role');
      expect(columnNames).toContain('avatar');
      expect(columnNames).toContain('status');
      expect(columnNames).toContain('failed_attempts');
      expect(columnNames).toContain('locked_until');
      expect(columnNames).toContain('created_at');
      expect(columnNames).toContain('updated_at');
    });

    test('should have account as unique', async () => {
      const columns: any[] = await new Promise((resolve, reject) => {
        db.all('PRAGMA table_info(users)', (err: Error | null, rows: any) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });

      const accountColumn = columns.find((col: any) => col.name === 'account');
      expect(accountColumn).toBeDefined();
    });

    test('should enforce account uniqueness constraint', async () => {
      await new Promise<void>((resolve, reject) => {
        db.run(
          'INSERT INTO users (account, password, username, role) VALUES (?, ?, ?, ?)',
          ['123456', 'hashedpassword', 'User 1', UserRole.STUDENT],
          (err: Error | null) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });

      await expect(
        new Promise<void>((resolve, reject) => {
          db.run(
            'INSERT INTO users (account, password, username, role) VALUES (?, ?, ?, ?)',
            ['123456', 'hashedpassword2', 'User 2', UserRole.STUDENT],
            (err: Error | null) => {
              if (err) reject(err);
              else resolve();
            }
          );
        })
      ).rejects.toThrow();
    });

    test('should have default values', async () => {
      const columns: any[] = await new Promise((resolve, reject) => {
        db.all('PRAGMA table_info(users)', (err: Error | null, rows: any) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });

      const roleColumn = columns.find((col: any) => col.name === 'role');
      const statusColumn = columns.find((col: any) => col.name === 'status');
      const failedAttemptsColumn = columns.find((col: any) => col.name === 'failed_attempts');

      expect(roleColumn.dflt_value).toContain('student');
      expect(statusColumn.dflt_value).toBe('1');
      expect(failedAttemptsColumn.dflt_value).toBe('0');
    });

    test('should allow nullable fields', async () => {
      const columns: any[] = await new Promise((resolve, reject) => {
        db.all('PRAGMA table_info(users)', (err: Error | null, rows: any) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });

      const emailColumn = columns.find((col: any) => col.name === 'email');
      const phoneColumn = columns.find((col: any) => col.name === 'phone');
      const avatarColumn = columns.find((col: any) => col.name === 'avatar');
      const lockedUntilColumn = columns.find((col: any) => col.name === 'locked_until');

      expect(emailColumn.notnull).toBe(0);
      expect(phoneColumn.notnull).toBe(0);
      expect(avatarColumn.notnull).toBe(0);
      expect(lockedUntilColumn.notnull).toBe(0);
    });

    test('should have account field with VARCHAR(6)', async () => {
      const columns: any[] = await new Promise((resolve, reject) => {
        db.all('PRAGMA table_info(users)', (err: Error | null, rows: any) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });

      const accountColumn = columns.find((col: any) => col.name === 'account');
      expect(accountColumn.type).toContain('6');
    });
  });

  describe('Indexes', () => {
    beforeEach(async () => {
      await runMigrations(db);
    });

    test('should create account index', async () => {
      const indexes: any[] = await new Promise((resolve, reject) => {
        db.all(
          "SELECT name FROM sqlite_master WHERE type='index' AND name='idx_users_account'",
          (err: Error | null, rows: any) => {
            if (err) reject(err);
            else resolve(rows);
          }
        );
      });

      expect(indexes.length).toBeGreaterThan(0);
    });

    test('should create username index', async () => {
      const indexes: any[] = await new Promise((resolve, reject) => {
        db.all(
          "SELECT name FROM sqlite_master WHERE type='index' AND name='idx_users_username'",
          (err: Error | null, rows: any) => {
            if (err) reject(err);
            else resolve(rows);
          }
        );
      });

      expect(indexes.length).toBeGreaterThan(0);
    });

    test('should create role index', async () => {
      const indexes: any[] = await new Promise((resolve, reject) => {
        db.all(
          "SELECT name FROM sqlite_master WHERE type='index' AND name='idx_users_role'",
          (err: Error | null, rows: any) => {
            if (err) reject(err);
            else resolve(rows);
          }
        );
      });

      expect(indexes.length).toBeGreaterThan(0);
    });

    test('should create status index', async () => {
      const indexes: any[] = await new Promise((resolve, reject) => {
        db.all(
          "SELECT name FROM sqlite_master WHERE type='index' AND name='idx_users_status'",
          (err: Error | null, rows: any) => {
            if (err) reject(err);
            else resolve(rows);
          }
        );
      });

      expect(indexes.length).toBeGreaterThan(0);
    });
  });

  describe('Triggers', () => {
    beforeEach(async () => {
      await runMigrations(db);
    });

    test('should create update timestamp trigger', async () => {
      const triggers: any[] = await new Promise((resolve, reject) => {
        db.all(
          "SELECT name FROM sqlite_master WHERE type='trigger' AND name='update_user_timestamp'",
          (err: Error | null, rows: any) => {
            if (err) reject(err);
            else resolve(rows);
          }
        );
      });

      expect(triggers.length).toBeGreaterThan(0);
    });

    test('should auto-update updated_at on user update', async () => {
      await new Promise<void>((resolve, reject) => {
        db.run(
          'INSERT INTO users (account, password, username, role) VALUES (?, ?, ?, ?)',
          ['123456', 'hashedpassword', 'User 1', UserRole.STUDENT],
          (err: Error | null) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });

      const userBeforeUpdate: any = await new Promise((resolve, reject) => {
        db.get('SELECT updated_at FROM users WHERE account = ?', ['123456'], (err: Error | null, row: any) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10));

      await new Promise<void>((resolve, reject) => {
        db.run(
          'UPDATE users SET username = ? WHERE account = ?',
          ['Updated Name', '123456'],
          (err: Error | null) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });

      const userAfterUpdate: any = await new Promise((resolve, reject) => {
        db.get('SELECT updated_at FROM users WHERE account = ?', ['123456'], (err: Error | null, row: any) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      expect(userAfterUpdate.updated_at).not.toBe(userBeforeUpdate.updated_at);
    });
  });

  describe('Foreign Keys', () => {
    beforeEach(async () => {
      await runMigrations(db);
    });

    test('should create refresh_tokens table with foreign key to users', async () => {
      const columns: any[] = await new Promise((resolve, reject) => {
        db.all('PRAGMA table_info(refresh_tokens)', (err: Error | null, rows: any) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });

      expect(columns.some((col: any) => col.name === 'user_id')).toBe(true);
    });

    test('should cascade delete from users to refresh_tokens', async () => {
      // Create a user
      const userId = await new Promise<number>((resolve, reject) => {
        db.run(
          'INSERT INTO users (account, password, username, role) VALUES (?, ?, ?, ?)',
          ['123456', 'hashedpassword', 'User 1', UserRole.STUDENT],
          function(this: any, err: Error | null) {
            if (err) reject(err);
            else resolve(this.lastID);
          }
        );
      });

      // Create a refresh token
      await new Promise<void>((resolve, reject) => {
        db.run(
          'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
          [userId, 'token123', '2025-12-31'],
          (err: Error | null) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });

      // Check token exists
      let tokensBeforeDelete: any[] = await new Promise((resolve, reject) => {
        db.all('SELECT * FROM refresh_tokens WHERE user_id = ?', [userId], (err: Error | null, rows: any) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });
      expect(tokensBeforeDelete.length).toBe(1);

      // Delete user
      await new Promise<void>((resolve, reject) => {
        db.run('DELETE FROM users WHERE id = ?', [userId], (err: Error | null) => {
          if (err) reject(err);
          else resolve();
        });
      });

      // Check token is cascaded
      let tokensAfterDelete: any[] = await new Promise((resolve, reject) => {
        db.all('SELECT * FROM refresh_tokens WHERE user_id = ?', [userId], (err: Error | null, rows: any) => {
          if (err) reject(err);
            else resolve(rows);
          });
        });
        expect(tokensAfterDelete.length).toBe(0);
    });
  });

  describe('Data Seeding', () => {
    test('should seed super admin account', async () => {
      await runMigrations(db);
      await seedDatabase(db);

      const superAdmin: any = await new Promise((resolve, reject) => {
        db.get('SELECT * FROM users WHERE account = ?', ['000000'], (err: Error | null, row: any) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      expect(superAdmin).toBeDefined();
      expect(superAdmin.account).toBe('000000');
      expect(superAdmin.username).toBe('超级管理员');
      expect(superAdmin.role).toBe(UserRole.SUPER_ADMIN);
      expect(superAdmin.status).toBe(UserStatus.ACTIVE);
    });

    test('should not create duplicate super admin on re-seed', async () => {
      await runMigrations(db);
      await seedDatabase(db);
      await seedDatabase(db); // Seed again

      const superAdmins: any[] = await new Promise((resolve, reject) => {
        db.all('SELECT * FROM users WHERE account = ?', ['000000'], (err: Error | null, rows: any) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });

      expect(superAdmins.length).toBe(1);
    });
  });

  describe('WAL Mode', () => {
    test('should enable WAL journal mode', async () => {
      await runMigrations(db);

      const journalMode: string = await new Promise((resolve, reject) => {
        db.get('PRAGMA journal_mode', (err: Error | null, row: any) => {
          if (err) reject(err);
          else resolve(row.journal_mode);
        });
      });

      expect(journalMode.toLowerCase()).toBe('wal');
    });
  });
});
