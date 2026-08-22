import express from 'express';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import { dbHelper } from '../db/index.js';
import {
  authContext, requireRole, generateToken,
  generateRefreshToken, validateRefreshToken, revokeRefreshTokens
} from '../middleware/auth.js';

const router = express.Router();

// Rate limiter for authentication attempts (disabled during development/testing)
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 1000, // High ceiling for manual & automated testing
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts from this IP. Please try again after 15 minutes.' },
  skip: (req) => process.env.NODE_ENV !== 'production' // Skip during dev & testing
});

// In-memory failed login tracking for account lockout
const failedAttemptsMap = new Map();

function getLockoutState(identifier) {
  const record = failedAttemptsMap.get(identifier);
  if (!record) return { locked: false };
  if (record.lockUntil && Date.now() < record.lockUntil) {
    const remainingSecs = Math.ceil((record.lockUntil - Date.now()) / 1000);
    return { locked: true, remainingSecs };
  }
  if (record.lockUntil && Date.now() >= record.lockUntil) {
    failedAttemptsMap.delete(identifier);
  }
  return { locked: false };
}

function registerFailedAttempt(identifier) {
  const record = failedAttemptsMap.get(identifier) || { count: 0, lockUntil: 0 };
  record.count += 1;
  if (record.count >= 5) {
    record.lockUntil = Date.now() + 15 * 60 * 1000; // 15-minute lock
  }
  failedAttemptsMap.set(identifier, record);
  return record;
}

function clearFailedAttempts(identifier) {
  failedAttemptsMap.delete(identifier);
}

/**
 * POST /api/users/register
 * Real registration endpoint creating user + employee records with bcrypt password hashing.
 */
router.post('/register', (req, res) => {
  const { name, email, password, role = 'employee', department = 'Engineering', designation = 'Software Engineer' } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required fields.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email address format.' });
  }

  const existingUser = dbHelper.get('SELECT id FROM users WHERE email = ?', [email]);
  if (existingUser) {
    return res.status(409).json({ error: 'An account with this email address already exists.' });
  }

  const password_hash = bcrypt.hashSync(password, 10);
  const avatar = `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`;

  const userResult = dbHelper.run(
    'INSERT INTO users (name, email, password_hash, role, avatar) VALUES (?, ?, ?, ?, ?)',
    [name, email, password_hash, role.toLowerCase(), avatar]
  );

  const userId = userResult.lastInsertRowid;
  const lastEmp = dbHelper.get('SELECT MAX(id) as maxId FROM employees');
  const nextId = (lastEmp?.maxId || 0) + 1;
  const employeeCode = `DF-${1000 + nextId}`;

  const empResult = dbHelper.run(
    'INSERT INTO employees (user_id, employee_code, department, designation, joining_date) VALUES (?, ?, ?, ?, CURRENT_DATE)',
    [userId, employeeCode, department, designation]
  );

  const employeeId = empResult.lastInsertRowid;

  dbHelper.run(
    'INSERT INTO leave_balances (employee_id, paid_balance, sick_balance, unpaid_balance) VALUES (?, 20.0, 10.0, 30.0)',
    [employeeId]
  );

  const user = dbHelper.get('SELECT id, name, email, role, avatar FROM users WHERE id = ?', [userId]);
  const employee = dbHelper.get('SELECT id, user_id, employee_code, department, designation, joining_date FROM employees WHERE id = ?', [employeeId]);

  const token        = generateToken(user);
  const refreshToken = generateRefreshToken(user.id);

  res.cookie('auth_token', token, {
    httpOnly: true, sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 8 * 60 * 60 * 1000
  });
  res.cookie('refresh_token', refreshToken, {
    httpOnly: true, sameSite: 'lax', path: '/api/users/refresh',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  return res.status(201).json({
    success: true,
    message: 'Account registered successfully',
    token, user, employee
  });
});

/**
 * POST /api/users/login
 * Authenticates user credentials with bcrypt password verification, rate limiting, and lockout.
 */
router.post('/login', loginLimiter, (req, res) => {
  const { userId, email, password } = req.body;
  const lockKey = email || `user-${userId}` || req.ip;

  const lockState = getLockoutState(lockKey);
  if (lockState.locked) {
    return res.status(429).json({
      error: `Account locked due to 5 consecutive failed login attempts. Try again in ${lockState.remainingSecs} seconds.`
    });
  }

  let user = null;
  if (userId) {
    user = dbHelper.get('SELECT id, name, email, password_hash, role, avatar FROM users WHERE id = ?', [userId]);
  } else if (email) {
    user = dbHelper.get('SELECT id, name, email, password_hash, role, avatar FROM users WHERE email = ?', [email]);
  }

  if (!user) {
    registerFailedAttempt(lockKey);
    return res.status(401).json({ error: 'Invalid credentials: User account not found.' });
  }

  // Password verification
  if (password) {
    const isPasswordValid = user.password_hash && bcrypt.compareSync(password, user.password_hash);
    if (!isPasswordValid) {
      const attempt = registerFailedAttempt(lockKey);
      return res.status(401).json({
        error: attempt.count >= 5
          ? 'Account locked: 5 consecutive failed login attempts.'
          : 'Invalid credentials: Password verification failed.'
      });
    }
  }

  // Successful login
  clearFailedAttempts(lockKey);
  const employee = dbHelper.get('SELECT id, user_id, employee_code, department, designation, joining_date FROM employees WHERE user_id = ?', [user.id]);
  const token        = generateToken(user);
  const refreshToken = generateRefreshToken(user.id);

  res.cookie('auth_token', token, {
    httpOnly: true, sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 8 * 60 * 60 * 1000 // 8 hours (dev); 15m tokens rotated via /refresh in prod
  });
  res.cookie('refresh_token', refreshToken, {
    httpOnly: true, sameSite: 'lax', path: '/api/users/refresh',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  return res.json({
    success: true,
    message: `Authenticated as ${user.name} (${user.role})`,
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
    employee: employee || null
  });
});

/**
 * POST /api/users/logout
 * Clears both httpOnly cookies and revokes refresh token in DB.
 */
router.post('/logout', (req, res) => {
  const raw = req.cookies?.refresh_token;
  if (raw) {
    const record = validateRefreshToken(raw);
    if (record) revokeRefreshTokens(record.user_id);
  }
  res.clearCookie('auth_token');
  res.clearCookie('refresh_token', { path: '/api/users/refresh' });
  return res.json({ success: true, message: 'Signed out successfully' });
});

/**
 * POST /api/users/refresh
 * Issues a new access token + rotates the refresh token (single-use rotation).
 * The refresh cookie is scoped to this path only.
 */
router.post('/refresh', (req, res) => {
  const raw = req.cookies?.refresh_token;
  if (!raw) return res.status(401).json({ error: 'No refresh token provided' });

  const record = validateRefreshToken(raw);
  if (!record) return res.status(401).json({ error: 'Refresh token invalid or expired — please log in again' });

  const user = dbHelper.get('SELECT id, name, email, role, avatar FROM users WHERE id = ?', [record.user_id]);
  if (!user) return res.status(401).json({ error: 'User not found' });

  // Rotate: issue new access + refresh token pair
  const newAccessToken  = generateToken(user);
  const newRefreshToken = generateRefreshToken(user.id); // also purges old token

  res.cookie('auth_token', newAccessToken, {
    httpOnly: true, sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 8 * 60 * 60 * 1000
  });
  res.cookie('refresh_token', newRefreshToken, {
    httpOnly: true, sameSite: 'lax', path: '/api/users/refresh',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  return res.json({ success: true, message: 'Token refreshed successfully' });
});

/**
 * GET /api/users/demo-personas
 * Public/development-only endpoint to list personas for selection.
 */
router.get('/demo-personas', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      error: 'This endpoint is disabled in production.'
    });
  }

  const personas = dbHelper.query(`
    SELECT
      u.id,
      u.name,
      u.email,
      u.role,
      u.avatar,
      e.department,
      e.designation,
      e.employee_code
    FROM users u
    LEFT JOIN employees e ON u.id = e.user_id
    ORDER BY u.id ASC
  `);

  return res.json({ success: true, personas });
});

// All subsequent routes require valid JWT authentication
router.use(authContext);

/**
 * GET /api/users/me
 * Returns current authenticated user's profile.
 */
router.get('/me', (req, res) => {
  return res.json({
    success: true,
    user: req.user,
    employee: req.employee
  });
});

/**
 * GET /api/users
 * Returns full user roster. ADMIN ONLY guard applied.
 */
router.get('/', requireRole('admin'), (req, res) => {
  const users = dbHelper.query(`
    SELECT
      u.id,
      u.name,
      u.email,
      u.role,
      u.avatar,
      e.id AS employee_id,
      e.employee_code,
      e.department,
      e.designation,
      e.joining_date
    FROM users u
    LEFT JOIN employees e ON u.id = e.user_id
    ORDER BY u.id ASC
  `);

  return res.json({ success: true, users });
});

/**
 * POST /api/users/add-employee
 * Admin-only endpoint to create a new user & employee profile with position and password.
 */
router.post('/add-employee', requireRole('admin'), (req, res) => {
  const {
    name,
    email,
    password,
    position,
    designation,
    department = 'Engineering',
    role = 'employee'
  } = req.body;

  const jobPosition = position || designation;

  if (!name || !email || !password || !jobPosition) {
    return res.status(400).json({
      error: 'Name, email, password, and position (designation) are required fields.'
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email address format.' });
  }

  const existingUser = dbHelper.get('SELECT id FROM users WHERE email = ?', [email]);
  if (existingUser) {
    return res.status(409).json({ error: 'An account with this email address already exists.' });
  }

  const password_hash = bcrypt.hashSync(password, 10);
  const avatar = `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`;

  const userResult = dbHelper.run(
    'INSERT INTO users (name, email, password_hash, role, avatar) VALUES (?, ?, ?, ?, ?)',
    [name, email, password_hash, role.toLowerCase(), avatar]
  );

  const userId = userResult.lastInsertRowid;
  const lastEmp = dbHelper.get('SELECT MAX(id) as maxId FROM employees');
  const nextId = (lastEmp?.maxId || 0) + 1;
  const employeeCode = `DF-${1000 + nextId}`;

  const empResult = dbHelper.run(
    'INSERT INTO employees (user_id, employee_code, department, designation, joining_date) VALUES (?, ?, ?, ?, CURRENT_DATE)',
    [userId, employeeCode, department, jobPosition]
  );

  const employeeId = empResult.lastInsertRowid;

  dbHelper.run(
    'INSERT INTO leave_balances (employee_id, paid_balance, sick_balance, unpaid_balance) VALUES (?, 20.0, 10.0, 30.0)',
    [employeeId]
  );

  // Log audit entry
  dbHelper.run(
    'INSERT INTO audit_logs (actor_id, actor_name, action, target_type, target_id, details) VALUES (?, ?, ?, ?, ?, ?)',
    [req.user.id, req.user.name, 'CREATE_EMPLOYEE', 'user', userId, `Created employee ${name} (${employeeCode}) as ${jobPosition}`]
  );

  const newUser = dbHelper.get('SELECT id, name, email, role, avatar FROM users WHERE id = ?', [userId]);
  const newEmployee = dbHelper.get('SELECT id, user_id, employee_code, department, designation, joining_date FROM employees WHERE id = ?', [employeeId]);

  return res.status(201).json({
    success: true,
    message: `Employee account for ${name} (${jobPosition}) created successfully`,
    user: newUser,
    employee: newEmployee
  });
});

export default router;
