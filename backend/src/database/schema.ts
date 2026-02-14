import { Database } from 'sqlite3';

/**
 * Database schema SQL queries based on requirements v2.1
 * Uses 6-digit account system with role-based access control
 */
export const schema = {
  /**
   * Users table - main user data
   */
  createUsersTable: `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      account VARCHAR(6) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      username VARCHAR(20) NOT NULL,
      email VARCHAR(100),
      phone VARCHAR(11),
      role TEXT NOT NULL DEFAULT 'student',
      avatar VARCHAR(255),
      status INTEGER NOT NULL DEFAULT 1,
      failed_attempts INTEGER NOT NULL DEFAULT 0,
      locked_until DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `,

  /**
   * Refresh tokens table for JWT refresh token management
   */
  createRefreshTokensTable: `
    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `,

  /**
   * Password reset tokens table
   */
  createPasswordResetsTable: `
    CREATE TABLE IF NOT EXISTS password_resets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expires_at DATETIME NOT NULL,
      used_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `,

  /**
   * User sessions table for session management
   */
  createSessionsTable: `
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      session_token TEXT UNIQUE NOT NULL,
      user_agent TEXT,
      ip_address TEXT,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `,

  /**
   * Indexes for better query performance
   */
  indexes: {
    account: `CREATE INDEX IF NOT EXISTS idx_users_account ON users(account)`,
    username: `CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)`,
    email: `CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`,
    phone: `CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone)`,
    role: `CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)`,
    status: `CREATE INDEX IF NOT EXISTS idx_users_status ON users(status)`,
    refreshTokenUserId: `CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id)`,
    sessionUserId: `CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id)`,
    passwordResetUserId: `CREATE INDEX IF NOT EXISTS idx_password_resets_user_id ON password_resets(user_id)`,
  },

  /**
   * Triggers for automatic timestamp updates
   */
  triggers: {
    updateUserTimestamp: `
      CREATE TRIGGER IF NOT EXISTS update_user_timestamp
      AFTER UPDATE ON users
      BEGIN
        UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
      END
    `,
  },

  /**
   * Default data - insert super admin account
   */
  seedSuperAdmin: `
    INSERT OR IGNORE INTO users (account, password_hash, username, role, status)
    VALUES ('000000', '$2b$10$rKZy3Jq6V8jXv5jYy8vX.OX5YQ5jYy8vX.OX5YQ5jYy8vX.OX5YQ5', '超级管理员', 'super_admin', 1)
  `,
};

/**
 * Run database migrations to create tables, indexes, and triggers
 */
export async function runMigrations(db: Database): Promise<void> {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Enable foreign keys
      db.run('PRAGMA foreign_keys = ON');

      // Create tables
      const tables = [
        schema.createUsersTable,
        schema.createRefreshTokensTable,
        schema.createPasswordResetsTable,
        schema.createSessionsTable,
      ];

      let completed = 0;
      const total = tables.length + Object.keys(schema.indexes).length + Object.keys(schema.triggers).length;

      const checkComplete = () => {
        completed++;
        if (completed === total) {
          console.log('Database migrations completed successfully');
          resolve();
        }
      };

      const handleError = (err: Error | null) => {
        if (err) return reject(err);
        checkComplete();
      };

      // Execute table creation
      tables.forEach(sql => {
        db.run(sql, handleError);
      });

      // Create indexes
      Object.values(schema.indexes).forEach(sql => {
        db.run(sql, handleError);
      });

      // Create triggers
      Object.values(schema.triggers).forEach(sql => {
        db.run(sql, handleError);
      });
    });
  });
}

/**
 * Seed database with initial data
 */
export async function seedDatabase(db: Database): Promise<void> {
  return new Promise((resolve, reject) => {
    db.run(schema.seedSuperAdmin, (err) => {
      if (err) {
        reject(err);
      } else {
        console.log('Database seeded with initial data');
        resolve();
      }
    });
  });
}

/**
 * Role enum values
 */
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  TEACHER = 'teacher',
  STUDENT = 'student',
}

/**
 * User status enum values
 */
export enum UserStatus {
  DISABLED = 0,
  ACTIVE = 1,
}
