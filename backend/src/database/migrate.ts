import { initializeDatabase } from './connection';
import { config } from '../config';

async function main() {
  try {
    console.log('Initializing database...');
    const db = await initializeDatabase();
    console.log('Database initialized successfully!');
    console.log(`Database location: ${config.dbPath}`);

    // Close database connection
    db.close((err: Error | null) => {
      if (err) {
        console.error('Error closing database:', err);
        process.exit(1);
      }
      console.log('Database migration completed. Exiting...');
      process.exit(0);
    });
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

main();
