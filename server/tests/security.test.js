import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/server.js';
import { seedDatabase } from '../src/db/seed.js';
import { generateToken } from '../src/middleware/auth.js';

test.beforeEach(() => {
  seedDatabase();
});

test('Security - Unauthenticated requests without valid JWT are rejected with 401', async () => {
  // Request without any token/cookie
  const resNoAuth = await request(app).get('/api/attendance/today');
  assert.strictEqual(resNoAuth.status, 401);
  assert.ok(resNoAuth.body.error.includes('Unauthorized'));

  // Request with raw x-user-id spoofing attempt
  const resHeaderSpoof = await request(app)
    .get('/api/attendance/today')
    .set('x-user-id', '1');
  assert.strictEqual(resHeaderSpoof.status, 401);

  // Request with fake/invalid JWT token
  const resInvalidToken = await request(app)
    .get('/api/attendance/today')
    .set('Authorization', 'Bearer invalid.jwt.token');
  assert.strictEqual(resInvalidToken.status, 401);
});

test('Security - Valid JWT login sets httpOnly cookie and grants authenticated access', async () => {
  // Login as Employee (Alex Chen, user ID 2)
  const loginRes = await request(app)
    .post('/api/users/login')
    .send({ userId: 2 });

  assert.strictEqual(loginRes.status, 200);
  assert.ok(loginRes.body.token);

  const cookies = loginRes.headers['set-cookie'];
  assert.ok(cookies, 'set-cookie header should be present');
  assert.ok(cookies[0].includes('auth_token='), 'auth_token cookie should be set');
  assert.ok(cookies[0].includes('HttpOnly'), 'auth_token cookie must be HttpOnly');

  // Perform authenticated check for /api/users/me using cookie
  const meRes = await request(app)
    .get('/api/users/me')
    .set('Cookie', cookies);

  assert.strictEqual(meRes.status, 200);
  assert.strictEqual(meRes.body.user.id, 2);
  assert.strictEqual(meRes.body.user.name, 'Alex Chen');
});

test('Security - Role-based route protection enforces admin privileges', async () => {
  // Employee token
  const employeeToken = generateToken({ id: 2, role: 'employee' });
  const empRes = await request(app)
    .get('/api/users')
    .set('Authorization', `Bearer ${employeeToken}`);
  assert.strictEqual(empRes.status, 403, 'Regular employee must be forbidden from accessing admin roster');

  // Admin token
  const adminToken = generateToken({ id: 1, role: 'admin' });
  const adminRes = await request(app)
    .get('/api/users')
    .set('Authorization', `Bearer ${adminToken}`);
  assert.strictEqual(adminRes.status, 200, 'Admin must be granted access to roster');
});

test('Security - Timestamp spoofing on check-in is blocked for non-admin requests', async () => {
  const employeeToken = generateToken({ id: 2, role: 'employee' });

  // Attempt check-in with spoofed timestamp
  const spoofRes = await request(app)
    .post('/api/attendance/checkin')
    .set('Authorization', `Bearer ${employeeToken}`)
    .send({
      date: '2026-01-01',
      timestamp: '08:00:00'
    });

  assert.strictEqual(spoofRes.status, 403, 'Client-supplied timestamp overrides must be rejected with 403');
  assert.ok(spoofRes.body.error.includes('Timestamp spoofing is disabled'));
});

test('Security - Admin debug flag allows controlled timestamp overrides for testing', async () => {
  const adminToken = generateToken({ id: 1, role: 'admin' });

  const adminDebugRes = await request(app)
    .post('/api/attendance/checkin?debug=true')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      date: '2026-08-22',
      timestamp: '09:00:00'
    });

  assert.strictEqual(adminDebugRes.status, 201, 'Admin debug mode allows timestamp override for testing');
  assert.strictEqual(adminDebugRes.body.attendance.date, '2026-08-22');
});

test('Security - Password verification with bcrypt succeeds for correct password and fails for incorrect', async () => {
  // Correct password
  const validRes = await request(app)
    .post('/api/users/login')
    .send({ email: 'alex.chen@dayflow.io', password: 'Password123!' });

  assert.strictEqual(validRes.status, 200);
  assert.strictEqual(validRes.body.user.email, 'alex.chen@dayflow.io');

  // Incorrect password
  const invalidRes = await request(app)
    .post('/api/users/login')
    .send({ email: 'alex.chen@dayflow.io', password: 'WrongPassword99!' });

  assert.strictEqual(invalidRes.status, 401);
  assert.ok(invalidRes.body.error.includes('Password verification failed'));
});

test('Security - Account lockout triggers after 5 consecutive failed login attempts', async () => {
  const targetEmail = 'lockout.test@dayflow.io';

  // 5 failed attempts
  for (let i = 0; i < 5; i++) {
    const res = await request(app)
      .post('/api/users/login')
      .send({ email: targetEmail, password: 'WrongPassword' });

    assert.strictEqual(res.status, 401);
  }

  // 6th attempt must be locked out with 429
  const lockedRes = await request(app)
    .post('/api/users/login')
    .send({ email: targetEmail, password: 'Password123!' });

  assert.strictEqual(lockedRes.status, 429);
  assert.ok(lockedRes.body.error.includes('Account locked'));
});
