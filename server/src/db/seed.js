import { db, initDb } from './index.js';

export function seedDatabase() {
  console.log('🌱 Seeding Dayflow HRMS Database...');
  
  // Ensure schema exists
  initDb();

  // Clear existing records to ensure idempotent seed
  db.exec('PRAGMA foreign_keys = OFF;');
  db.exec('DELETE FROM attendance;');
  db.exec('DELETE FROM employees;');
  db.exec('DELETE FROM users;');
  db.exec('PRAGMA foreign_keys = ON;');

  // 1. Insert Users (Admin + Employees)
  const insertUser = db.prepare(`
    INSERT INTO users (id, name, email, role, avatar)
    VALUES (?, ?, ?, ?, ?)
  `);

  const usersData = [
    [1, 'Sarah Jenkins', 'sarah.jenkins@dayflow.io', 'admin', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'],
    [2, 'Alex Chen', 'alex.chen@dayflow.io', 'employee', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'],
    [3, 'Priya Patel', 'priya.patel@dayflow.io', 'employee', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'],
    [4, 'Marcus Vance', 'marcus.vance@dayflow.io', 'employee', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'],
    [5, 'Elena Rostova', 'elena.rostova@dayflow.io', 'employee', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'],
    [6, 'David Kim', 'david.kim@dayflow.io', 'employee', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'],
    [7, 'Fatima Al-Mansoor', 'fatima.m@dayflow.io', 'employee', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80']
  ];

  for (const u of usersData) {
    insertUser.run(...u);
  }

  // 2. Insert Employees (Stub for Member 1: {id, user_id, employee_code, department, designation, joining_date})
  const insertEmployee = db.prepare(`
    INSERT INTO employees (id, user_id, employee_code, department, designation, joining_date)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const employeesData = [
    [1, 1, 'DF-1001', 'HR & People', 'VP of People / Admin', '2022-01-10'],
    [2, 2, 'DF-1002', 'Engineering', 'Senior Full Stack Engineer', '2022-03-15'],
    [3, 3, 'DF-1003', 'Engineering', 'Frontend Architect', '2022-06-01'],
    [4, 4, 'DF-1004', 'Design', 'Lead Product Designer', '2023-01-20'],
    [5, 5, 'DF-1005', 'HR & People', 'Talent Acquisition Partner', '2023-04-10'],
    [6, 6, 'DF-1006', 'Sales', 'Enterprise Account Executive', '2023-08-01'],
    [7, 7, 'DF-1007', 'Engineering', 'Staff Cloud & DevOps Engineer', '2023-11-15']
  ];

  for (const e of employeesData) {
    insertEmployee.run(...e);
  }

  // 3. Generate Historical Attendance Records (Past 30 days)
  const insertAttendance = db.prepare(`
    INSERT INTO attendance (employee_id, date, check_in, check_out, status, work_hours, late_minutes, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const today = new Date();
  const formatYMD = (d) => d.toISOString().split('T')[0];

  // Populate last 28 days for each employee
  for (let empId = 1; empId <= 7; empId++) {
    for (let daysAgo = 28; daysAgo >= 1; daysAgo--) {
      const dateObj = new Date();
      dateObj.setDate(today.getDate() - daysAgo);
      const dayOfWeek = dateObj.getDay();
      
      // Skip weekends (0 = Sunday, 6 = Saturday)
      if (dayOfWeek === 0 || dayOfWeek === 6) continue;

      const dateStr = formatYMD(dateObj);

      // Deterministic pseudo-random generation based on empId and daysAgo
      const seed = (empId * 13 + daysAgo * 7) % 100;
      
      let status = 'present';
      let checkIn = null;
      let checkOut = null;
      let workHours = 0.0;
      let lateMinutes = 0;
      let notes = 'Regular workday';

      if (seed < 4) {
        // Leave
        status = 'leave';
        notes = 'Approved PTO / Leave';
      } else if (seed < 8) {
        // Absent
        status = 'absent';
        notes = 'Unplanned absence';
      } else if (seed < 16) {
        // Half day
        status = 'half_day';
        const inHour = 9;
        const inMin = 15 + (seed % 15);
        checkIn = `${dateStr} ${String(inHour).padStart(2, '0')}:${String(inMin).padStart(2, '0')}:00`;
        checkOut = `${dateStr} 13:30:00`;
        workHours = 4.25;
        notes = 'Half day afternoon off';
      } else {
        // Present
        const isLate = seed % 5 === 0;
        const inHour = isLate ? 9 : 8;
        const inMin = isLate ? 35 + (seed % 20) : 45 + (seed % 15);
        
        if (isLate) {
          lateMinutes = (inHour * 60 + inMin) - (9 * 60 + 30);
          notes = `Late arrival (+${lateMinutes}m)`;
        }

        const outHour = 17 + (seed % 2);
        const outMin = 30 + (seed % 25);

        checkIn = `${dateStr} ${String(inHour).padStart(2, '0')}:${String(inMin).padStart(2, '0')}:00`;
        checkOut = `${dateStr} ${String(outHour).padStart(2, '0')}:${String(outMin).padStart(2, '0')}:00`;
        
        const inMs = new Date(checkIn).getTime();
        const outMs = new Date(checkOut).getTime();
        workHours = Number(((outMs - inMs) / (1000 * 60 * 60)).toFixed(2));
      }

      insertAttendance.run(empId, dateStr, checkIn, checkOut, status, workHours, lateMinutes, notes);
    }
  }

  // 4. Seed Today's Attendance for Demo
  const todayStr = formatYMD(today);

  // Priya Patel (empId 3) checked in early
  insertAttendance.run(
    3, 
    todayStr, 
    `${todayStr} 08:50:00`, 
    null, 
    'incomplete', 
    0.0, 
    0, 
    'Active shift in progress'
  );

  // Marcus Vance (empId 4) checked in and completed half day
  insertAttendance.run(
    4, 
    todayStr, 
    `${todayStr} 09:00:00`, 
    `${todayStr} 13:15:00`, 
    'half_day', 
    4.25, 
    0, 
    'Medical appointment in afternoon'
  );

  // Elena Rostova (empId 5) on leave
  insertAttendance.run(
    5, 
    todayStr, 
    null, 
    null, 
    'leave', 
    0.0, 
    0, 
    'Approved Sick Leave'
  );

  // David Kim (empId 6) checked in late
  insertAttendance.run(
    6, 
    todayStr, 
    `${todayStr} 09:48:00`, 
    null, 
    'incomplete', 
    0.0, 
    18, 
    'Client commute delay'
  );

  // Fatima Al-Mansoor (empId 7) checked in on time
  insertAttendance.run(
    7, 
    todayStr, 
    `${todayStr} 08:55:00`, 
    null, 
    'incomplete', 
    0.0, 
    0, 
    'Active shift'
  );

  // Note: Sarah Jenkins (emp 1) & Alex Chen (emp 2) are left NOT checked-in today, so the user/judge can test punching in & out live!

  console.log('✅ Database seeded successfully!');
}

// Run if called directly
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seedDatabase();
}
