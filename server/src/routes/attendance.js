import express from 'express';
import { db, dbHelper } from '../db/index.js';
import { authContext, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Apply authContext to all attendance routes
router.use(authContext);

/**
 * Utility: Auto-flag past incomplete attendance records
 * Finds past records where check_in was made but check_out was missing, marking them as 'incomplete'
 */
export function autoFlagPastIncomplete() {
  const todayStr = new Date().toISOString().split('T')[0];
  dbHelper.run(`
    UPDATE attendance 
    SET status = 'incomplete'
    WHERE date < ? 
      AND check_in IS NOT NULL 
      AND check_out IS NULL 
      AND status NOT IN ('leave', 'absent')
  `, [todayStr]);
}

/**
 * GET /api/attendance/today
 * Retrieve authenticated employee's attendance record for today
 */
router.get('/today', (req, res) => {
  if (!req.employee) {
    return res.status(400).json({ error: 'Employee profile not associated with this user' });
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const record = dbHelper.get(
    'SELECT * FROM attendance WHERE employee_id = ? AND date = ?',
    [req.employee.id, todayStr]
  );

  return res.json({
    success: true,
    today: todayStr,
    record: record || null
  });
});

/**
 * POST /api/attendance/checkin
 * Clock in for the current day.
 * Rejects duplicate check-ins on the same day.
 */
router.post('/checkin', (req, res) => {
  if (!req.employee) {
    return res.status(400).json({ error: 'Employee record required to check in' });
  }

  const now = new Date();
  const dateStr = req.body.date || now.toISOString().split('T')[0];
  
  // Format check-in timestamp YYYY-MM-DD HH:MM:SS
  const timeStr = req.body.timestamp || now.toTimeString().split(' ')[0];
  const fullCheckIn = `${dateStr} ${timeStr}`;

  // Server-Side Validation: Reject duplicate check-in on the same day
  const existing = dbHelper.get(
    'SELECT * FROM attendance WHERE employee_id = ? AND date = ?',
    [req.employee.id, dateStr]
  );

  if (existing) {
    if (existing.check_in) {
      return res.status(409).json({ 
        error: 'Duplicate Check-In: You have already clocked in for today.',
        existingCheckIn: existing.check_in,
        status: existing.status
      });
    }
  }

  // Calculate late arrival: expected shift start is 09:30:00
  const [hours, minutes] = timeStr.split(':').map(Number);
  const checkInMinutes = hours * 60 + minutes;
  const shiftStartMinutes = 9 * 60 + 30; // 09:30 AM
  const lateMinutes = Math.max(0, checkInMinutes - shiftStartMinutes);

  try {
    let result;
    if (existing) {
      // Update record if an empty row or leave draft existed
      dbHelper.run(`
        UPDATE attendance 
        SET check_in = ?, status = 'incomplete', late_minutes = ?, notes = ?
        WHERE id = ?
      `, [fullCheckIn, lateMinutes, lateMinutes > 0 ? `Late arrival (+${lateMinutes}m)` : 'On time', existing.id]);
      result = { id: existing.id };
    } else {
      const stmt = db.prepare(`
        INSERT INTO attendance (employee_id, date, check_in, check_out, status, work_hours, late_minutes, notes)
        VALUES (?, ?, ?, NULL, 'incomplete', 0.0, ?, ?)
      `);
      result = stmt.run(
        req.employee.id,
        dateStr,
        fullCheckIn,
        lateMinutes,
        lateMinutes > 0 ? `Late arrival (+${lateMinutes}m)` : 'On time'
      );
    }

    const inserted = dbHelper.get('SELECT * FROM attendance WHERE id = ?', [result.id || result.lastInsertRowid]);

    return res.status(201).json({
      success: true,
      message: 'Check-in successful! Have a productive shift.',
      attendance: inserted
    });
  } catch (err) {
    if (err.message && err.message.includes('UNIQUE constraint')) {
      return res.status(409).json({ error: 'Duplicate Check-In: A record already exists for this date.' });
    }
    return res.status(500).json({ error: 'Failed to record check-in', details: err.message });
  }
});

/**
 * POST /api/attendance/checkout
 * Clock out for the current day.
 * Validates check_out > check_in timestamp and calculates work hours.
 */
router.post('/checkout', (req, res) => {
  if (!req.employee) {
    return res.status(400).json({ error: 'Employee record required to check out' });
  }

  const now = new Date();
  const dateStr = req.body.date || now.toISOString().split('T')[0];
  
  // Format check-out timestamp YYYY-MM-DD HH:MM:SS
  const timeStr = req.body.timestamp || now.toTimeString().split(' ')[0];
  const fullCheckOut = `${dateStr} ${timeStr}`;

  // Find today's check-in record
  const record = dbHelper.get(
    'SELECT * FROM attendance WHERE employee_id = ? AND date = ?',
    [req.employee.id, dateStr]
  );

  if (!record || !record.check_in) {
    return res.status(400).json({ 
      error: 'Cannot Check-Out: No check-in record found for today. Please clock in first.' 
    });
  }

  if (record.check_out) {
    return res.status(400).json({
      error: 'Already Checked Out: You have already completed check-out for today.',
      check_out: record.check_out,
      work_hours: record.work_hours
    });
  }

  // Server-Side Validation: check-out timestamp must be > check-in timestamp
  const inDate = new Date(record.check_in.replace(' ', 'T'));
  const outDate = new Date(fullCheckOut.replace(' ', 'T'));

  if (isNaN(inDate.getTime()) || isNaN(outDate.getTime())) {
    return res.status(400).json({ error: 'Invalid timestamp format provided' });
  }

  const diffMs = outDate.getTime() - inDate.getTime();
  if (diffMs <= 0) {
    return res.status(400).json({ 
      error: 'Validation Error: Check-out timestamp must be strictly later than check-in timestamp.',
      check_in: record.check_in,
      attempted_check_out: fullCheckOut
    });
  }

  // Calculate work hours with 2 decimal precision
  const hours = Number((diffMs / (1000 * 60 * 60)).toFixed(2));

  // Determine attendance status based on hours worked:
  // >= 8 hours -> present
  // >= 4 hours and < 8 hours -> half_day
  // < 4 hours -> incomplete
  let finalStatus = 'present';
  if (hours < 4.0) {
    finalStatus = 'incomplete';
  } else if (hours < 8.0) {
    finalStatus = 'half_day';
  }

  try {
    dbHelper.run(`
      UPDATE attendance 
      SET check_out = ?, 
          work_hours = ?, 
          status = ?,
          notes = CASE 
            WHEN notes IS NULL OR notes = 'On time' THEN ?
            ELSE notes || ' | ' || ?
          END
      WHERE id = ?
    `, [
      fullCheckOut, 
      hours, 
      finalStatus, 
      `Shift completed (${hours}h)`, 
      `Shift completed (${hours}h)`, 
      record.id
    ]);

    const updated = dbHelper.get('SELECT * FROM attendance WHERE id = ?', [record.id]);

    return res.json({
      success: true,
      message: 'Check-out recorded successfully! Great work today.',
      attendance: updated
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to record check-out', details: err.message });
  }
});

/**
 * GET /api/attendance
 * Retrieve authenticated employee's own attendance history with filtering
 */
router.get('/', (req, res) => {
  if (!req.employee) {
    return res.status(400).json({ error: 'Employee profile not associated with this user' });
  }

  // Auto-flag past incomplete shifts
  autoFlagPastIncomplete();

  const { month, year, status, limit = 50, offset = 0 } = req.query;
  
  let query = 'SELECT * FROM attendance WHERE employee_id = ?';
  const params = [req.employee.id];

  if (month && year) {
    const monthFormatted = String(month).padStart(2, '0');
    query += ` AND strftime('%Y-%m', date) = ?`;
    params.push(`${year}-${monthFormatted}`);
  } else if (year) {
    query += ` AND strftime('%Y', date) = ?`;
    params.push(String(year));
  }

  if (status) {
    query += ` AND status = ?`;
    params.push(status);
  }

  query += ' ORDER BY date DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit, 10), parseInt(offset, 10));

  const records = dbHelper.query(query, params);

  // Total count
  const countRow = dbHelper.get(
    'SELECT COUNT(*) as total FROM attendance WHERE employee_id = ?',
    [req.employee.id]
  );

  return res.json({
    success: true,
    total: countRow ? countRow.total : records.length,
    records
  });
});

/**
 * GET /api/attendance/weekly
 * Returns current week (Mon-Sun) breakdown for authenticated employee
 */
router.get('/weekly', (req, res) => {
  if (!req.employee) {
    return res.status(400).json({ error: 'Employee profile not associated with this user' });
  }

  const now = new Date();
  const currentDay = now.getDay(); // 0 is Sunday, 1 is Monday...
  
  // Calculate Monday of current week
  const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;
  const monday = new Date(now);
  monday.setDate(now.getDate() + distanceToMonday);

  const daysOfWeek = [];
  const formatYMD = (d) => d.toISOString().split('T')[0];
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    daysOfWeek.push({
      dayName: dayNames[i],
      date: formatYMD(d),
      isToday: formatYMD(d) === formatYMD(now)
    });
  }

  const startDate = daysOfWeek[0].date;
  const endDate = daysOfWeek[6].date;

  const records = dbHelper.query(`
    SELECT * FROM attendance 
    WHERE employee_id = ? AND date BETWEEN ? AND ?
    ORDER BY date ASC
  `, [req.employee.id, startDate, endDate]);

  const recordMap = new Map();
  records.forEach(r => recordMap.set(r.date, r));

  let totalWeeklyHours = 0;
  let presentDays = 0;

  const weeklyBreakdown = daysOfWeek.map(item => {
    const record = recordMap.get(item.date) || null;
    const hours = record ? record.work_hours : 0;
    totalWeeklyHours += hours;
    if (record && (record.status === 'present' || record.status === 'half_day')) {
      presentDays += 1;
    }

    return {
      ...item,
      record,
      work_hours: hours,
      status: record ? record.status : (item.dayName === 'Sat' || item.dayName === 'Sun' ? 'weekend' : 'not_recorded')
    };
  });

  return res.json({
    success: true,
    weekStartDate: startDate,
    weekEndDate: endDate,
    totalWeeklyHours: Number(totalWeeklyHours.toFixed(2)),
    averageDailyHours: presentDays > 0 ? Number((totalWeeklyHours / presentDays).toFixed(2)) : 0,
    presentDays,
    breakdown: weeklyBreakdown
  });
});

/**
 * GET /api/attendance/all
 * Attendance monitor endpoint — accessible to Admin (all depts) and Manager (own dept).
 * Supports filters: date, department, status, search
 */
router.get('/all', requireRole('admin', 'manager'), (req, res) => {
  autoFlagPastIncomplete();

  const { date, department, status, search, limit = 100, offset = 0 } = req.query;

  // If role is manager, enforce their own department
  const isManager = req.user.role === 'manager';
  const effectiveDept = isManager ? (req.employee?.department || 'Design') : department;

  let query = `
    SELECT 
      a.id as attendance_id,
      a.date,
      a.check_in,
      a.check_out,
      a.status,
      a.work_hours,
      a.late_minutes,
      a.notes,
      e.id as employee_id,
      e.employee_code,
      e.department,
      e.designation,
      u.id as user_id,
      u.name as employee_name,
      u.email as employee_email,
      u.avatar as employee_avatar
    FROM employees e
    JOIN users u ON e.user_id = u.id
    LEFT JOIN attendance a ON a.employee_id = e.id ${date ? 'AND a.date = ?' : ''}
    WHERE 1=1
  `;

  const params = [];
  if (date) {
    params.push(date);
  }

  if (effectiveDept && effectiveDept !== 'all') {
    query += ` AND e.department = ?`;
    params.push(effectiveDept);
  }

  if (status && status !== 'all') {
    if (status === 'not_marked') {
      query += ` AND a.id IS NULL`;
    } else {
      query += ` AND a.status = ?`;
      params.push(status);
    }
  }

  if (search) {
    query += ` AND (u.name LIKE ? OR e.employee_code LIKE ? OR e.designation LIKE ?)`;
    const searchParam = `%${search}%`;
    params.push(searchParam, searchParam, searchParam);
  }

  query += ` ORDER BY u.name ASC LIMIT ? OFFSET ?`;
  params.push(parseInt(limit, 10), parseInt(offset, 10));

  const records = dbHelper.query(query, params);

  // Aggregated quick stats for today/selected date
  const targetDate = date || new Date().toISOString().split('T')[0];
  
  let summaryQuery = `
    SELECT 
      (SELECT COUNT(*) FROM employees WHERE 1=1 ${effectiveDept && effectiveDept !== 'all' ? 'AND department = ?' : ''}) as totalEmployees,
      (SELECT COUNT(*) FROM attendance a JOIN employees e ON a.employee_id = e.id WHERE a.date = ? AND (a.status = 'present' OR a.check_in IS NOT NULL) ${effectiveDept && effectiveDept !== 'all' ? 'AND e.department = ?' : ''}) as checkedInCount,
      (SELECT COUNT(*) FROM attendance a JOIN employees e ON a.employee_id = e.id WHERE a.date = ? AND a.late_minutes > 0 ${effectiveDept && effectiveDept !== 'all' ? 'AND e.department = ?' : ''}) as lateCount,
      (SELECT COUNT(*) FROM attendance a JOIN employees e ON a.employee_id = e.id WHERE a.date = ? AND a.status = 'leave' ${effectiveDept && effectiveDept !== 'all' ? 'AND e.department = ?' : ''}) as leaveCount,
      (SELECT COUNT(*) FROM attendance a JOIN employees e ON a.employee_id = e.id WHERE a.date = ? AND a.status = 'absent' ${effectiveDept && effectiveDept !== 'all' ? 'AND e.department = ?' : ''}) as absentCount
  `;

  const summaryParams = [];
  if (effectiveDept && effectiveDept !== 'all') {
    summaryParams.push(effectiveDept, targetDate, effectiveDept, targetDate, effectiveDept, targetDate, effectiveDept, targetDate, effectiveDept);
  } else {
    summaryParams.push(targetDate, targetDate, targetDate, targetDate);
  }

  const summaryStats = dbHelper.get(summaryQuery, summaryParams);

  return res.json({
    success: true,
    date: targetDate,
    summary: summaryStats,
    departmentScope: isManager ? effectiveDept : 'all',
    role: req.user.role,
    records
  });
});

/**
 * GET /api/attendance/analytics
 * Attendance Analytics Differentiator Endpoint
 * Generates overall attendance %, present/absent/leave counts, late-arrival metrics, and monthly trend.
 */
router.get('/analytics', (req, res) => {
  const { department, month, year } = req.query;
  const isManager = req.user.role === 'manager';
  const effectiveDept = isManager ? (req.employee?.department || 'Design') : department;

  // 1. Overall stats across all historical records
  let filterClause = '';
  const filterParams = [];

  if (effectiveDept && effectiveDept !== 'all') {
    filterClause += ` AND e.department = ?`;
    filterParams.push(effectiveDept);
  }

  const totals = dbHelper.get(`
    SELECT 
      COUNT(*) as totalRecords,
      SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as presentCount,
      SUM(CASE WHEN a.status = 'half_day' THEN 1 ELSE 0 END) as halfDayCount,
      SUM(CASE WHEN a.status = 'leave' THEN 1 ELSE 0 END) as leaveCount,
      SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) as absentCount,
      SUM(CASE WHEN a.status = 'incomplete' THEN 1 ELSE 0 END) as incompleteCount,
      SUM(CASE WHEN a.late_minutes > 0 THEN 1 ELSE 0 END) as lateArrivalsCount,
      ROUND(AVG(CASE WHEN a.work_hours > 0 THEN a.work_hours ELSE NULL END), 2) as avgWorkHours
    FROM attendance a
    JOIN employees e ON a.employee_id = e.id
    WHERE 1=1 ${filterClause}
  `, filterParams);

  const totalEffective = (totals.presentCount || 0) + (totals.halfDayCount || 0) * 0.5;
  const totalConsidered = (totals.totalRecords || 0) - (totals.leaveCount || 0);
  const attendanceRate = totalConsidered > 0 
    ? Number(((totalEffective / totalConsidered) * 100).toFixed(1)) 
    : 0;

  // 2. Department-wise breakdown
  const deptStats = dbHelper.query(`
    SELECT 
      e.department,
      COUNT(DISTINCT e.id) as employeeCount,
      COUNT(a.id) as totalLogs,
      SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as presentLogs,
      SUM(CASE WHEN a.late_minutes > 0 THEN 1 ELSE 0 END) as lateLogs,
      ROUND(AVG(CASE WHEN a.work_hours > 0 THEN a.work_hours ELSE NULL END), 2) as deptAvgHours
    FROM employees e
    LEFT JOIN attendance a ON e.id = a.employee_id
    GROUP BY e.department
  `);

  // 3. Weekly/Monthly Trend (last 4 weeks)
  const trend = dbHelper.query(`
    SELECT 
      strftime('%Y-%W', date) as week_number,
      MIN(date) as week_start,
      COUNT(*) as total_records,
      SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_count,
      SUM(CASE WHEN late_minutes > 0 THEN 1 ELSE 0 END) as late_count,
      ROUND(AVG(CASE WHEN work_hours > 0 THEN work_hours ELSE NULL END), 2) as avg_hours
    FROM attendance
    GROUP BY strftime('%Y-%W', date)
    ORDER BY week_start ASC
    LIMIT 6
  `);

  return res.json({
    success: true,
    metrics: {
      attendancePercentage: attendanceRate,
      presentCount: totals.presentCount || 0,
      halfDayCount: totals.halfDayCount || 0,
      leaveCount: totals.leaveCount || 0,
      absentCount: totals.absentCount || 0,
      incompleteCount: totals.incompleteCount || 0,
      lateArrivalCount: totals.lateArrivalsCount || 0,
      avgDailyWorkHours: totals.avgWorkHours || 0.0
    },
    departmentBreakdown: deptStats,
    monthlyTrend: trend
  });
});

export default router;
