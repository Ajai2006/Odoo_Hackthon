import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/server.js';
import { seedDatabase } from '../src/db/seed.js';
import { generateToken } from '../src/middleware/auth.js';
import { dbHelper } from '../src/db/index.js';

test.beforeEach(() => {
  seedDatabase();
});

test('SQL Injection - Login endpoint rejects injection payloads safely', async () => {
  const injectionPayloads = [
    "' OR '1'='1",
    "admin' --",
    "' OR 1=1 --",
    "'; DROP TABLE users; --",
    "1 UNION SELECT 1, 'hacked', 'hacked@hacked.com', 'admin', null, null"
  ];

  for (const payload of injectionPayloads) {
    const res = await request(app)
      .post('/api/users/login')
      .send({ email: payload, password: 'wrongpassword' });

    assert.notStrictEqual(res.status, 500, `Injection payload "${payload}" caused server crash or 500`);
    assert.strictEqual(res.status === 400 || res.status === 401 || res.status === 404, true);

    // Assert users table still exists and headcount is unchanged
    const users = dbHelper.query('SELECT COUNT(*) as count FROM users');
    assert.strictEqual(users[0].count, 20, 'Users table headcount should remain intact');
  }
});

test('SQL Injection - Search and filter query parameters treat injection as literal strings', async () => {
  const adminToken = generateToken({ id: 1, role: 'admin' });

  const injectionQueries = [
    "' OR '1'='1",
    "'; DROP TABLE attendance;--",
    "1' UNION SELECT 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16--",
    "1; DELETE FROM employees WHERE '1'='1"
  ];

  for (const query of injectionQueries) {
    const res = await request(app)
      .get(`/api/attendance/all?search=${encodeURIComponent(query)}`)
      .set('Authorization', `Bearer ${adminToken}`);

    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.body.records));

    // Verify database tables were not modified by payload
    const count = dbHelper.get('SELECT COUNT(*) as count FROM employees');
    assert.strictEqual(count.count, 20, 'Employee count should remain unchanged after injection attempt');
  }
});

test('SQL Injection - Department and status filters treat malicious strings as literal filters', async () => {
  const adminToken = generateToken({ id: 1, role: 'admin' });
  const maliciousFilter = "Design' OR '1'='1";

  const res = await request(app)
    .get(`/api/attendance/all?department=${encodeURIComponent(maliciousFilter)}`)
    .set('Authorization', `Bearer ${adminToken}`);

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.records.length, 0, 'Literal filter matching nonexistent dept name should return empty array');
});
