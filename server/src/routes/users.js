import express from 'express';
import { dbHelper } from '../db/index.js';
import { authContext, requireRole, generateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/users/login
 * Public login endpoint — authenticates user, generates signed JWT, and sets httpOnly cookie.
 */
router.post('/login', (req, res) => {
  const { userId, email } = req.body;
  const targetId = userId || (email ? dbHelper.get('SELECT id FROM users WHERE email = ?', [email])?.id : null);

  if (!targetId) {
    return res.status(400).json({ error: 'Valid userId or email is required for login' });
  }

  const user = dbHelper.get('SELECT id, name, email, role, avatar FROM users WHERE id = ?', [targetId]);
  if (!user) {
    return res.status(404).json({ error: 'User account not found' });
  }

  const employee = dbHelper.get('SELECT id, user_id, employee_code, department, designation, joining_date FROM employees WHERE user_id = ?', [user.id]);
  const token = generateToken(user);

  // Set signed JWT as httpOnly cookie
  res.cookie('auth_token', token, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 8 * 60 * 60 * 1000 // 8 hours
  });

  return res.json({
    success: true,
    message: `Authenticated as ${user.name} (${user.role})`,
    token,
    user,
    employee: employee || null
  });
});

/**
 * POST /api/users/logout
 * Clears httpOnly auth cookie.
 */
router.post('/logout', (req, res) => {
  res.clearCookie('auth_token');
  return res.json({ success: true, message: 'Signed out successfully' });
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
 * Returns full user roster.
 * ADMIN ONLY guard applied.
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

export default router;
