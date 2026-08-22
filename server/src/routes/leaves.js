import express from 'express';
import { db, dbHelper } from '../db/index.js';
import { authContext, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Require valid JWT authentication for all leave routes
router.use(authContext);

/**
 * Utility: Calculate inclusive working days between start and end date (skipping weekends)
 */
function calculateLeaveDays(startDateStr, endDateStr) {
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) {
    return -1;
  }

  let count = 0;
  const current = new Date(start);
  while (current <= end) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Skip weekends
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  return count > 0 ? count : 1;
}

/**
 * GET /api/leaves/balance
 * Returns authenticated employee's leave balance.
 */
router.get('/balance', (req, res) => {
  if (!req.employee) {
    return res.status(400).json({ error: 'Employee profile not found' });
  }

  let balance = dbHelper.get('SELECT * FROM leave_balances WHERE employee_id = ?', [req.employee.id]);
  if (!balance) {
    // Initialize default balance
    dbHelper.run('INSERT INTO leave_balances (employee_id, paid_balance, sick_balance, unpaid_balance) VALUES (?, 20.0, 10.0, 30.0)', [req.employee.id]);
    balance = { employee_id: req.employee.id, paid_balance: 20.0, sick_balance: 10.0, unpaid_balance: 30.0 };
  }

  return res.json({ success: true, balance });
});

/**
 * GET /api/leaves/my
 * Returns authenticated employee's personal leave requests.
 */
router.get('/my', (req, res) => {
  if (!req.employee) {
    return res.status(400).json({ error: 'Employee profile not found' });
  }

  const requests = dbHelper.query(`
    SELECT l.*, u.name as reviewer_name 
    FROM leave_requests l
    LEFT JOIN users u ON l.reviewed_by = u.id
    WHERE l.employee_id = ?
    ORDER BY l.created_at DESC
  `, [req.employee.id]);

  return res.json({ success: true, requests });
});

/**
 * POST /api/leaves
 * Employee submits a new leave application.
 */
router.post('/', (req, res) => {
  if (!req.employee) {
    return res.status(400).json({ error: 'Employee profile not found' });
  }

  const { leave_type, start_date, end_date, reason } = req.body;

  if (!leave_type || !start_date || !end_date) {
    return res.status(400).json({ error: 'Missing required fields: leave_type, start_date, and end_date are required' });
  }

  const validTypes = ['paid', 'sick', 'unpaid'];
  if (!validTypes.includes(leave_type.toLowerCase())) {
    return res.status(400).json({ error: `Invalid leave_type. Must be one of: [${validTypes.join(', ')}]` });
  }

  const totalDays = calculateLeaveDays(start_date, end_date);
  if (totalDays <= 0) {
    return res.status(400).json({ error: 'Invalid date range: end_date must be greater than or equal to start_date' });
  }

  // Check leave balance
  let balance = dbHelper.get('SELECT * FROM leave_balances WHERE employee_id = ?', [req.employee.id]);
  if (!balance) {
    dbHelper.run('INSERT INTO leave_balances (employee_id, paid_balance, sick_balance, unpaid_balance) VALUES (?, 20.0, 10.0, 30.0)', [req.employee.id]);
    balance = { paid_balance: 20.0, sick_balance: 10.0, unpaid_balance: 30.0 };
  }

  const balanceKey = `${leave_type.toLowerCase()}_balance`;
  const currentAvailable = balance[balanceKey] || 0;

  if (totalDays > currentAvailable) {
    return res.status(400).json({
      error: `Insufficient ${leave_type} leave balance. Requested: ${totalDays} day(s), Available: ${currentAvailable} day(s).`
    });
  }

  const stmt = db.prepare(`
    INSERT INTO leave_requests (employee_id, leave_type, start_date, end_date, total_days, reason, status)
    VALUES (?, ?, ?, ?, ?, ?, 'pending')
  `);
  const result = stmt.run(req.employee.id, leave_type.toLowerCase(), start_date, end_date, totalDays, reason || '');

  const inserted = dbHelper.get('SELECT * FROM leave_requests WHERE id = ?', [result.lastInsertRowid]);

  // Log audit event
  dbHelper.run(`
    INSERT INTO audit_logs (actor_id, actor_name, action, target_type, target_id, details)
    VALUES (?, ?, 'LEAVE_SUBMIT', 'leave_requests', ?, ?)
  `, [req.user.id, req.user.name, result.lastInsertRowid, `Submitted ${leave_type} leave from ${start_date} to ${end_date} (${totalDays}d)`]);

  return res.status(201).json({
    success: true,
    message: 'Leave application submitted successfully',
    leave: inserted
  });
});

/**
 * GET /api/leaves
 * Admin/Manager endpoint to list all leave requests with filters.
 */
router.get('/', requireRole('admin', 'manager'), (req, res) => {
  const { status, department } = req.query;
  const isManager = req.user.role === 'manager';
  const effectiveDept = isManager ? (req.employee?.department || 'Design') : department;

  let query = `
    SELECT 
      l.*,
      e.employee_code,
      e.department,
      e.designation,
      u.name as employee_name,
      u.email as employee_email,
      u.avatar as employee_avatar,
      rev.name as reviewer_name
    FROM leave_requests l
    JOIN employees e ON l.employee_id = e.id
    JOIN users u ON e.user_id = u.id
    LEFT JOIN users rev ON l.reviewed_by = rev.id
    WHERE 1=1
  `;

  const params = [];
  if (status && status !== 'all') {
    query += ' AND l.status = ?';
    params.push(status);
  }

  if (effectiveDept && effectiveDept !== 'all') {
    query += ' AND e.department = ?';
    params.push(effectiveDept);
  }

  query += ' ORDER BY l.created_at DESC';

  const requests = dbHelper.query(query, params);

  return res.json({ success: true, requests });
});

/**
 * PATCH /api/leaves/:id/approve
 * Admin/Manager approves a leave request and auto-syncs attendance records.
 */
router.patch('/:id/approve', requireRole('admin', 'manager'), (req, res) => {
  const leaveId = parseInt(req.params.id, 10);
  const { reviewer_comments } = req.body;

  const leave = dbHelper.get('SELECT * FROM leave_requests WHERE id = ?', [leaveId]);
  if (!leave) {
    return res.status(404).json({ error: 'Leave request not found' });
  }

  if (leave.status !== 'pending') {
    return res.status(400).json({ error: `Cannot approve leave request that is already ${leave.status}` });
  }

  // Update status to approved
  dbHelper.run(`
    UPDATE leave_requests 
    SET status = 'approved', reviewed_by = ?, reviewer_comments = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `, [req.user.id, reviewer_comments || 'Approved', leaveId]);

  // Deduct balance
  const balanceCol = `${leave.leave_type}_balance`;
  dbHelper.run(`
    UPDATE leave_balances 
    SET ${balanceCol} = MAX(0, ${balanceCol} - ?)
    WHERE employee_id = ?
  `, [leave.total_days, leave.employee_id]);

  // AUTO ATTENDANCE SYNC: Sync dates to attendance table
  const start = new Date(leave.start_date);
  const end = new Date(leave.end_date);
  const current = new Date(start);

  while (current <= end) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Skip weekends
      const dateStr = current.toISOString().split('T')[0];
      const existingAtt = dbHelper.get('SELECT id FROM attendance WHERE employee_id = ? AND date = ?', [leave.employee_id, dateStr]);

      if (existingAtt) {
        dbHelper.run(`
          UPDATE attendance 
          SET status = 'leave', notes = ?
          WHERE id = ?
        `, [`Approved ${leave.leave_type.toUpperCase()} Leave (#${leave.id})`, existingAtt.id]);
      } else {
        dbHelper.run(`
          INSERT INTO attendance (employee_id, date, status, notes)
          VALUES (?, ?, 'leave', ?)
        `, [leave.employee_id, dateStr, `Approved ${leave.leave_type.toUpperCase()} Leave (#${leave.id})`]);
      }
    }
    current.setDate(current.getDate() + 1);
  }

  // Audit log
  dbHelper.run(`
    INSERT INTO audit_logs (actor_id, actor_name, action, target_type, target_id, details)
    VALUES (?, ?, 'LEAVE_APPROVE', 'leave_requests', ?, ?)
  `, [req.user.id, req.user.name, leaveId, `Approved leave #${leaveId} for employee #${leave.employee_id}`]);

  const updated = dbHelper.get('SELECT * FROM leave_requests WHERE id = ?', [leaveId]);

  return res.json({
    success: true,
    message: 'Leave request approved and attendance records updated',
    leave: updated
  });
});

/**
 * PATCH /api/leaves/:id/reject
 * Admin/Manager rejects a leave request with mandatory reviewer comment.
 */
router.patch('/:id/reject', requireRole('admin', 'manager'), (req, res) => {
  const leaveId = parseInt(req.params.id, 10);
  const { reviewer_comments } = req.body;

  if (!reviewer_comments) {
    return res.status(400).json({ error: 'Reviewer comment is required when rejecting a leave request' });
  }

  const leave = dbHelper.get('SELECT * FROM leave_requests WHERE id = ?', [leaveId]);
  if (!leave) {
    return res.status(404).json({ error: 'Leave request not found' });
  }

  if (leave.status !== 'pending') {
    return res.status(400).json({ error: `Cannot reject leave request that is already ${leave.status}` });
  }

  dbHelper.run(`
    UPDATE leave_requests 
    SET status = 'rejected', reviewed_by = ?, reviewer_comments = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `, [req.user.id, reviewer_comments, leaveId]);

  // Audit log
  dbHelper.run(`
    INSERT INTO audit_logs (actor_id, actor_name, action, target_type, target_id, details)
    VALUES (?, ?, 'LEAVE_REJECT', 'leave_requests', ?, ?)
  `, [req.user.id, req.user.name, leaveId, `Rejected leave #${leaveId}. Comment: ${reviewer_comments}`]);

  const updated = dbHelper.get('SELECT * FROM leave_requests WHERE id = ?', [leaveId]);

  return res.json({
    success: true,
    message: 'Leave request rejected',
    leave: updated
  });
});

export default router;
