import { dbHelper } from '../db/index.js';

/**
 * Auth Middleware & Context Stub (Owned by Member 1)
 * Extracts authenticated user & employee record from headers/session.
 * Contract: employee has { id, user_id, department, designation, employee_code }
 */
export function authContext(req, res, next) {
  // Support header-based user switching for quick multi-role hackathon demo testing
  const userIdHeader = req.headers['x-user-id'] || req.headers['authorization'];
  let userId = userIdHeader ? parseInt(userIdHeader.replace('Bearer ', ''), 10) : 2; // Default to Alex Chen (Employee)

  if (isNaN(userId)) {
    userId = 2;
  }

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
