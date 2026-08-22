import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = process.env.DB_PATH || path.join(__dirname, '../../dayflow.db');
const schemaPath = path.join(__dirname, 'schema.sql');

export const db = new DatabaseSync(dbPath);

// Enable Foreign Key enforcement in SQLite
db.exec('PRAGMA foreign_keys = ON;');

export function initDb() {
  const schema = fs.readFileSync(schemaPath, 'utf8');
  db.exec(schema);
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
