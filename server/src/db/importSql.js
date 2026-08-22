import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = process.env.DB_PATH || path.join(__dirname, '../../dayflow.db');
const schemaPath = path.join(__dirname, 'schema.sql');
const seedPath = path.join(__dirname, 'seed.sql');

console.log('🔄 Executing offline DB import (schema.sql & seed.sql)...');

const db = new DatabaseSync(dbPath);

const schemaSql = fs.readFileSync(schemaPath, 'utf8');
const seedSql = fs.readFileSync(seedPath, 'utf8');

db.exec(schemaSql);
db.exec(seedSql);

console.log(`✅ Fully offline DB import complete! Database created at: ${dbPath}`);
