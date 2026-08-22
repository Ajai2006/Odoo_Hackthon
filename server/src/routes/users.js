import express from 'express';
import { dbHelper } from '../db/index.js';
import { authContext, requireRole } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authContext);

/**
 * GET /api/users/me
 * Returns the currently authenticated user's own profile.
 * Available to every authenticated role.
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
 * Returns the full user+employee roster.
 * ADMIN ONLY — never expose this to regular employees.
 *
 * RECONCILE NOTE (Member 1): Replace this stub with your auth-protected
 * admin endpoint once the shared auth module is integrated.
 */
router.get('/', requireRole('admin'), (req, res) => {
  const users = dbHelper.query(`
    SELECT
      u.id,
      u.name,
      u.email,
      u.role,
      u.avatar,
      e.id         AS employee_id,
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
 * GET /api/users/demo-personas
 * Development-only shortcut for hackathon judges to switch personas.
 * Returns ONLY (id, name, role, avatar, department) — no emails, no codes.
 * BLOCKED in production (NODE_ENV=production).
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
      u.role,
      u.avatar,
      e.department
    FROM users u
    LEFT JOIN employees e ON u.id = e.user_id
    ORDER BY u.id ASC
  `);

  return res.json({ success: true, personas });
});

export default router;
