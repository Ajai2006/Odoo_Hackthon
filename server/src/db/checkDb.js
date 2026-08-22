import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = process.env.DB_PATH || path.join(__dirname, '../../dayflow.db');

console.log(`🔍 Verifying SQLite database connection at: ${dbPath}`);

try {
  let db;
  try {
    const { DatabaseSync } = await import('node:sqlite');
    db = new DatabaseSync(dbPath);
  } catch (e) {
    const Database = (await import('better-sqlite3')).default;
    db = new Database(dbPath);
  }

  // 1. Run basic connectivity test
  const testRes = db.prepare('SELECT 1 as connected').get();
  if (!testRes || testRes.connected !== 1) {
    throw new Error('Database connection failed: SELECT 1 returned unexpected output.');
  }

  // 2. Verify mandatory tables exist
  const expectedTables = ['users', 'employees', 'attendance', 'leave_requests', 'leave_balances', 'audit_logs'];
  const tablesInDb = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(r => r.name);

  const missingTables = expectedTables.filter(t => !tablesInDb.includes(t));

  if (missingTables.length > 0) {
    console.error(`❌ DATABASE CHECK FAILED! Missing expected tables: ${missingTables.join(', ')}`);
    console.error('👉 Run "npm run db:import" or "npm run seed" to initialize the database schema.');
    process.exit(1);
  }

  // 3. Verify user headcount
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get()?.count || 0;
  const empCount = db.prepare('SELECT COUNT(*) as count FROM employees').get()?.count || 0;

  console.log('✅ DATABASE VERIFICATION SUCCESSFUL!');
  console.log(`   - Connected to SQLite DB: ${dbPath}`);
  console.log(`   - Verified Tables: ${expectedTables.join(', ')}`);
  console.log(`   - Seeded Records: ${userCount} users, ${empCount} employees`);

} catch (err) {
  console.error(`❌ CRITICAL DATABASE ERROR: ${err.message}`);
  process.exit(1);
}
