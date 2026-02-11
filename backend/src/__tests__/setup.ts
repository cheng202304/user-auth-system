import { initializeDatabase, closeDatabase } from '../database/connection';

declare global {
  var clearDatabase: () => Promise<void>;
}

let db: any;

beforeAll(async () => {
  // Initialize database for testing
  try {
    db = await initializeDatabase();
  } catch (error) {
    console.warn('Failed to initialize file-based database, tests may use in-memory databases');
  }
});

afterAll(async () => {
  // Close database connection after tests
  if (db) {
    await closeDatabase(db);
  }
});

// Global test utilities
global.clearDatabase = async () => {
  if (!db) return;

  const tables = ['password_resets', 'refresh_tokens', 'sessions', 'users'];

  for (const table of tables) {
    await new Promise<void>((resolve, reject) => {
      db.run(`DELETE FROM ${table}`, (err: Error | null) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
};

// Export for TypeScript usage in test files
export {};
