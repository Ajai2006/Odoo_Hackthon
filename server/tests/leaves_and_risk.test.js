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

test('User Registration - POST /api/users/register creates real user, employee, and leave balances', async () => {
  const res = await request(app)
    .post('/api/users/register')
    .send({
      name: 'Jordan Miller',
      email: 'jordan.miller@dayflow.io',
      password: 'Password123!',
      role: 'employee',
      department: 'Engineering',
      designation: 'Backend Developer'
    });

  assert.strictEqual(res.status, 201);
  assert.strictEqual(res.body.success, true);
  assert.strictEqual(res.body.user.email, 'jordan.miller@dayflow.io');
  assert.ok(res.body.token);

  // Check database persistence
  const user = dbHelper.get('SELECT * FROM users WHERE email = ?', ['jordan.miller@dayflow.io']);
  assert.ok(user);
  assert.strictEqual(user.role, 'employee');

  const emp = dbHelper.get('SELECT * FROM employees WHERE user_id = ?', [user.id]);
  assert.ok(emp);
  assert.strictEqual(emp.department, 'Engineering');

  const balance = dbHelper.get('SELECT * FROM leave_balances WHERE employee_id = ?', [emp.id]);
  assert.ok(balance);
  assert.strictEqual(balance.paid_balance, 20.0);
});

test('Leave Module - Employee can view leave balance and apply for leave', async () => {
  const token = generateToken({ id: 2, role: 'employee' }); // Alex Chen (emp #2)

  // 1. Get balance
  const balRes = await request(app)
    .get('/api/leaves/balance')
    .set('Authorization', `Bearer ${token}`);

  assert.strictEqual(balRes.status, 200);
  assert.strictEqual(balRes.body.balance.employee_id, 2);

  // 2. Submit leave request
  const applyRes = await request(app)
    .post('/api/leaves')
    .set('Authorization', `Bearer ${token}`)
    .send({
      leave_type: 'paid',
      start_date: '2026-09-01',
      end_date: '2026-09-03',
      reason: 'Vacation'
    });

  assert.strictEqual(applyRes.status, 201);
  assert.strictEqual(applyRes.body.leave.status, 'pending');
  assert.strictEqual(applyRes.body.leave.total_days, 3);
});

test('Leave Module - Rejects application if leave balance is insufficient', async () => {
  const token = generateToken({ id: 2, role: 'employee' });

  const applyRes = await request(app)
    .post('/api/leaves')
    .set('Authorization', `Bearer ${token}`)
    .send({
      leave_type: 'paid',
      start_date: '2026-09-01',
      end_date: '2026-10-15', // Exceeds balance
      reason: 'Long Sabbatical'
    });

  assert.strictEqual(applyRes.status, 400);
  assert.ok(applyRes.body.error.includes('Insufficient paid leave balance'));
});

test('Leave Approval - Admin approval auto-updates attendance records', async () => {
  const adminToken = generateToken({ id: 1, role: 'admin' });

  // Leave request #1 (pending in seed)
  const approveRes = await request(app)
    .patch('/api/leaves/1/approve')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ reviewer_comments: 'Have fun on your road trip!' });

  assert.strictEqual(approveRes.status, 200);
  assert.strictEqual(approveRes.body.leave.status, 'approved');

  // Verify attendance table auto-updated for approved dates
  const leave = dbHelper.get('SELECT * FROM leave_requests WHERE id = 1');
  const attRecord = dbHelper.get('SELECT * FROM attendance WHERE employee_id = ? AND date = ?', [leave.employee_id, leave.start_date]);

  assert.ok(attRecord, 'Attendance record should be created/updated for approved leave');
  assert.strictEqual(attRecord.status, 'leave');
});

test('Workforce Risk Engine - GET /api/attendance/analytics/workforce-risk evaluates risk indicators', async () => {
  const adminToken = generateToken({ id: 1, role: 'admin' });

  const res = await request(app)
    .get('/api/attendance/analytics/workforce-risk?department=Engineering')
    .set('Authorization', `Bearer ${adminToken}`);

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.ok(res.body.overall_risk);
  assert.ok(Array.isArray(res.body.indicators));
  assert.ok(res.body.recommendation);
});
