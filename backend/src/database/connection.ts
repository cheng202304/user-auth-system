import sqlite3 from 'sqlite3';
import { runMigrations } from './schema';
import path from 'path';

// Database file path
const DB_PATH = path.join(__dirname, '../../data/auth.db');

/**
 * Get database instance
 * @returns Promise<Database>
 */
export function getDatabase(): Promise<sqlite3.Database> {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Error opening database:', err);
        reject(err);
      } else {
        console.log('Connected to SQLite database');
        resolve(db);
      }
    });
  });
}

/**
 * Initialize database with schema
 */
export async function initializeDatabase(): Promise<sqlite3.Database> {
  try {
    const db = await getDatabase();
    await runMigrations(db);
    return db;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

/**
 * Close database connection
 */
export function closeDatabase(db: sqlite3.Database): Promise<void> {
  return new Promise((resolve, reject) => {
    db.close((err) => {
      if (err) {
        reject(err);
      } else {
        console.log('Database connection closed');
        resolve();
      }
    });
  });
}
