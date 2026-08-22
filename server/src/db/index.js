import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = process.env.NODE_ENV === 'test' 
  ? ':memory:' 
  : (process.env.DB_PATH || path.join(__dirname, '../../dayflow.db'));

const schemaPath = path.join(__dirname, 'schema.sql');

export const db = new DatabaseSync(dbPath);

// Enable Foreign Keys, WAL mode, and busy timeout for concurrent safety
db.exec('PRAGMA foreign_keys = ON;');
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA busy_timeout = 5000;');

export function initDb() {
  try {
    const tableCheck = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'").get();
    if (!tableCheck) {
      const schema = fs.readFileSync(schemaPath, 'utf8');
      db.exec(schema);
    } else {
      // Auto-migration check: ensure refresh_tokens table exists for JWT rotation
      db.exec(`
        CREATE TABLE IF NOT EXISTS refresh_tokens (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          token_hash TEXT UNIQUE NOT NULL,
          expires_at DATETIME NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
      `);
    }
  } catch (e) {
    // Fallback if check fails
    const schema = fs.readFileSync(schemaPath, 'utf8');
    db.exec(schema);
  }
  return db;
}

// Database helper utilities for clean queries
export const dbHelper = {
  query: (sql, params = []) => {
    const stmt = db.prepare(sql);
    return stmt.all(...params);
  },
  get: (sql, params = []) => {
    const stmt = db.prepare(sql);
    return stmt.get(...params);
  },
  run: (sql, params = []) => {
    const stmt = db.prepare(sql);
    return stmt.run(...params);
  }
};

// Initialize schema on load
initDb();

export default db;
