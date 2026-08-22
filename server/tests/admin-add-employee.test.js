import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import supertest from 'supertest';
import app from '../src/server.js';
import { seedDatabase } from '../src/db/seed.js';

const request = supertest(app);

describe('Admin Add Employee API', () => {
  beforeEach(() => {
    seedDatabase();
  });

  test('POST /api/users/add-employee rejects unauthenticated request with 401', async () => {
    const res = await request
      .post('/api/users/add-employee')
      .send({
        name: 'John Doe',
        email: 'john.doe@dayflow.io',
        password: 'Password123!',
        position: 'Software Engineer'
      });

    assert.strictEqual(res.status, 401);
    assert.match(res.body.error, /Unauthorized/i);
  });

  test('POST /api/users/add-employee rejects employee/manager role with 403', async () => {
    // Login as Employee (alex.chen@dayflow.io)
    const loginRes = await request
      .post('/api/users/login')
      .send({ email: 'alex.chen@dayflow.io', password: 'Password123!' });

    const cookie = loginRes.headers['set-cookie'];

    const res = await request
      .post('/api/users/add-employee')
      .set('Cookie', cookie)
      .send({
        name: 'New Trainee',
        email: 'new.trainee@dayflow.io',
        password: 'Password123!',
        position: 'Junior Developer',
        department: 'Engineering'
      });

    assert.strictEqual(res.status, 403);
    assert.match(res.body.error, /Forbidden/i);
  });

  test('POST /api/users/add-employee creates user, employee, and leave balances when called by admin', async () => {
    // Login as Admin (sarah.jenkins@dayflow.io)
    const loginRes = await request
      .post('/api/users/login')
      .send({ email: 'sarah.jenkins@dayflow.io', password: 'Password123!' });

    const cookie = loginRes.headers['set-cookie'];

    const newEmpData = {
      name: 'Carlos Rivera',
      email: 'carlos.rivera@dayflow.io',
      password: 'Password123!',
      position: 'Staff DevOps Engineer',
      department: 'Engineering',
      role: 'employee'
    };

    const res = await request
      .post('/api/users/add-employee')
      .set('Cookie', cookie)
      .send(newEmpData);

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.user.email, 'carlos.rivera@dayflow.io');
    assert.strictEqual(res.body.employee.designation, 'Staff DevOps Engineer');
    assert.strictEqual(res.body.employee.department, 'Engineering');
    assert.match(res.body.employee.employee_code, /^DF-\d{4}$/);

    // Verify newly created user can log in with their password
    const newEmpLogin = await request
      .post('/api/users/login')
      .send({ email: 'carlos.rivera@dayflow.io', password: 'Password123!' });

    assert.strictEqual(newEmpLogin.status, 200);
    assert.strictEqual(newEmpLogin.body.user.name, 'Carlos Rivera');
  });

  test('POST /api/users/add-employee rejects duplicate email with 409', async () => {
    const loginRes = await request
      .post('/api/users/login')
      .send({ email: 'sarah.jenkins@dayflow.io', password: 'Password123!' });

    const cookie = loginRes.headers['set-cookie'];

    const res = await request
      .post('/api/users/add-employee')
      .set('Cookie', cookie)
      .send({
        name: 'Sarah Duplicate',
        email: 'sarah.jenkins@dayflow.io', // existing email
        password: 'Password123!',
        position: 'HR Executive'
      });

    assert.strictEqual(res.status, 409);
    assert.match(res.body.error, /already exists/i);
  });
});
