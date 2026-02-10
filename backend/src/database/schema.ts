import { Database } from 'sqlite3';

// SQL queries for database schema
export const schema = {
  createUsersTable: `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      username TEXT,
      email_verified BOOLEAN DEFAULT 0,
      role TEXT DEFAULT 'user',
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `,

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

  // Indexes for better query performance
  createEmailIndex: `CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`,
  createUserIdIndex: `CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id)`,
  createSessionUserIdIndex: `CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id)`,
  createPasswordResetUserIdIndex: `CREATE INDEX IF NOT EXISTS idx_password_resets_user_id ON password_resets(user_id)`,
};

// Migration function to set up database schema
export function runMigrations(db: Database): Promise<void> {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run(schema.createUsersTable, (err) => {
        if (err) return reject(err);
      });

      db.run(schema.createRefreshTokensTable, (err) => {
        if (err) return reject(err);
      });

      db.run(schema.createPasswordResetsTable, (err) => {
        if (err) return reject(err);
      });

      db.run(schema.createSessionsTable, (err) => {
        if (err) return reject(err);
      });

      db.run(schema.createEmailIndex, (err) => {
        if (err) return reject(err);
      });

      db.run(schema.createUserIdIndex, (err) => {
        if (err) return reject(err);
      });

      db.run(schema.createSessionUserIdIndex, (err) => {
        if (err) return reject(err);
      });

      db.run(schema.createPasswordResetUserIdIndex, (err) => {
        if (err) return reject(err);
        console.log('Database migrations completed successfully');
        resolve();
      });
    });
  });
}
