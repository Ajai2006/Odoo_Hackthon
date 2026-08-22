import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { dbHelper } from '../db/index.js';

export const JWT_SECRET         = process.env.JWT_SECRET         || 'dayflow-jwt-secret-key-2026';
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dayflow-refresh-secret-key-2026';

/** Access token — short-lived (15 min in production, 8 h in dev/test for ergonomics) */
const ACCESS_TOKEN_TTL  = process.env.NODE_ENV === 'production' ? '15m' : '8h';
/** Refresh token — long-lived opaque token stored hashed in DB (7 days) */
const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Generate a signed JWT access token for a user.
 */
export function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_TTL }
  );
}

/**
 * Generate a cryptographically random opaque refresh token,
 * store its SHA-256 hash in the database, and return the raw token.
 */
export function generateRefreshToken(userId) {
  const raw  = crypto.randomBytes(48).toString('hex');  // 96-char hex string
  const hash = crypto.createHash('sha256').update(raw).digest('hex');
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS).toISOString();

  // Purge any previous refresh tokens for this user (single session per user)
  dbHelper.run('DELETE FROM refresh_tokens WHERE user_id = ?', [userId]);

  dbHelper.run(
    'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)',
    [userId, hash, expiresAt]
  );

  return raw;
}

/**
 * Validate a raw refresh token against the DB.
 * Returns the matching DB row or null.
 */
export function validateRefreshToken(raw) {
  const hash = crypto.createHash('sha256').update(raw).digest('hex');
  const record = dbHelper.get(
    "SELECT * FROM refresh_tokens WHERE token_hash = ? AND expires_at > datetime('now')",
    [hash]
  );
  return record || null;
}

/**
 * Revoke all refresh tokens for a user (used on logout).
 */
export function revokeRefreshTokens(userId) {
  dbHelper.run('DELETE FROM refresh_tokens WHERE user_id = ?', [userId]);
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
    const employee = dbHelper.get(
      'SELECT id, user_id, employee_code, department, designation, joining_date FROM employees WHERE user_id = ?',
      [user.id]
    );

    req.user     = user;
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
