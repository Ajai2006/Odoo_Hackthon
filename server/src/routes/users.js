import express from 'express';
import { dbHelper } from '../db/index.js';
import { authContext } from '../middleware/auth.js';

const router = express.Router();

// GET /api/users - List all users & employees for role switching in demo
router.get('/', (req, res) => {
  const users = dbHelper.query(`
    SELECT 
      u.id, 
      u.name, 
      u.email, 
      u.role, 
      u.avatar,
      e.id as employee_id,
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

// GET /api/users/me - Get current authenticated user profile
router.get('/me', authContext, (req, res) => {
  return res.json({
    success: true,
    user: req.user,
    employee: req.employee
  });
});

export default router;
