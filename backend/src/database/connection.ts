import sqlite3 from 'sqlite3';
import { runMigrations, seedDatabase } from './schema';
import { DatabaseService } from './services/user.service';
import path from 'path';

// Database file path
const DB_PATH = process.env.DATABASE_PATH || path.join(__dirname, '../../data/auth.db');
const DB_DIR = path.dirname(DB_PATH);

/**
 * Get database instance
 * @returns Promise<Database>
 */
export function getDatabase(): Promise<sqlite3.Database> {
  return new Promise((resolve, reject) => {
    // Create data directory if it doesn't exist
    const fs = require('fs');
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }

    const db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Error opening database:', err);
        reject(err);
      } else {
        console.log('Connected to SQLite database at:', DB_PATH);
        resolve(db);
      }
    });
  });
}

/**
 * Initialize database with schema and services
 */
export async function initializeDatabase(seed: boolean = false): Promise<sqlite3.Database> {
  try {
    const db = await getDatabase();
    await runMigrations(db);

    // Enable WAL mode for better performance
    await new Promise<void>((resolve, reject) => {
      db.run('PRAGMA journal_mode=WAL', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Seed database with initial data if requested
    if (seed) {
      await seedDatabase(db);
    }

    // Initialize database service singleton
    const dbService = DatabaseService.getInstance();
    await dbService.initialize(db);

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

/**
 * Get database service instance
 */
export function getDatabaseService(): DatabaseService {
  const dbService = DatabaseService.getInstance();
  return dbService;
}
