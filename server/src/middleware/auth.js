import jwt from 'jsonwebtoken';
import { dbHelper } from '../db/index.js';

export const JWT_SECRET = process.env.JWT_SECRET || 'dayflow-jwt-secret-key-2026';

/**
 * Generate a signed JWT token for a user.
 */
export function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: '8h' }
  );
}

/**
 * Auth Middleware — Verifies signed JWT from httpOnly cookie or Authorization header.
 * Attaches user and employee records to req.
 */
export function authContext(req, res, next) {
  let token = null;

  // 1. Extract from httpOnly cookie
  if (req.cookies && req.cookies.auth_token) {
    token = req.cookies.auth_token;
  }

  // 2. Extract from Authorization header (Bearer <jwt>)
  if (!token && req.headers['authorization']) {
    const authHeader = req.headers['authorization'];
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    }
  }

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: Valid authentication token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id;

    // Fetch User
    const user = dbHelper.get('SELECT id, name, email, role, avatar FROM users WHERE id = ?', [userId]);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized: User account not found' });
    }

    // Fetch Employee profile
    const employee = dbHelper.get('SELECT id, user_id, employee_code, department, designation, joining_date FROM employees WHERE user_id = ?', [user.id]);

    req.user = user;
    req.employee = employee || null;

    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired authentication token' });
  }
}

/**
 * Role-Based Access Control Guard
 * @param  {...string} roles Allowed roles ('admin', 'employee', 'manager')
 */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Forbidden: Access requires one of [${roles.join(', ')}] role(s). Current role: '${req.user.role}'`
      });
    }

    next();
  };
}
