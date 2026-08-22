-- Dayflow HRMS Pure SQL Seed File
PRAGMA foreign_keys = OFF;
DELETE FROM attendance;
DELETE FROM employees;
DELETE FROM users;
PRAGMA foreign_keys = ON;

-- Users (Password for all personas: Password123!)
INSERT INTO users (id, name, email, password_hash, role, avatar) VALUES
(1, 'Sarah Jenkins', 'sarah.jenkins@dayflow.io', '$2b$10$cBJ4yfKqFaXduCkUANofpu1aei7rksxxXYZTfsVFitzZ/0uPX5IlK', 'admin', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'),
(2, 'Alex Chen', 'alex.chen@dayflow.io', '$2b$10$cBJ4yfKqFaXduCkUANofpu1aei7rksxxXYZTfsVFitzZ/0uPX5IlK', 'employee', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'),
(3, 'Priya Patel', 'priya.patel@dayflow.io', '$2b$10$cBJ4yfKqFaXduCkUANofpu1aei7rksxxXYZTfsVFitzZ/0uPX5IlK', 'employee', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'),
(4, 'Marcus Vance', 'marcus.vance@dayflow.io', '$2b$10$cBJ4yfKqFaXduCkUANofpu1aei7rksxxXYZTfsVFitzZ/0uPX5IlK', 'manager', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'),
(5, 'Elena Rostova', 'elena.rostova@dayflow.io', '$2b$10$cBJ4yfKqFaXduCkUANofpu1aei7rksxxXYZTfsVFitzZ/0uPX5IlK', 'employee', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'),
(6, 'David Kim', 'david.kim@dayflow.io', '$2b$10$cBJ4yfKqFaXduCkUANofpu1aei7rksxxXYZTfsVFitzZ/0uPX5IlK', 'employee', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'),
(7, 'Fatima Al-Mansoor', 'fatima.m@dayflow.io', '$2b$10$cBJ4yfKqFaXduCkUANofpu1aei7rksxxXYZTfsVFitzZ/0uPX5IlK', 'employee', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80');

-- Employees
INSERT INTO employees (id, user_id, employee_code, department, designation, joining_date) VALUES
(1, 1, 'DF-1001', 'HR & People', 'VP of People / Admin', '2022-01-10'),
(2, 2, 'DF-1002', 'Engineering', 'Senior Full Stack Engineer', '2022-03-15'),
(3, 3, 'DF-1003', 'Engineering', 'Frontend Architect', '2022-06-01'),
(4, 4, 'DF-1004', 'Design', 'Lead Product Designer', '2023-01-20'),
(5, 5, 'DF-1005', 'HR & People', 'Talent Acquisition Partner', '2023-04-10'),
(6, 6, 'DF-1006', 'Sales', 'Enterprise Account Executive', '2023-08-01'),
(7, 7, 'DF-1007', 'Engineering', 'Staff Cloud & DevOps Engineer', '2023-11-15');

-- Sample Attendance
INSERT INTO attendance (employee_id, date, check_in, check_out, status, work_hours, late_minutes, notes) VALUES
(3, CURRENT_DATE, CURRENT_DATE || ' 08:50:00', NULL, 'incomplete', 0.0, 0, 'Active shift in progress'),
(4, CURRENT_DATE, CURRENT_DATE || ' 09:00:00', CURRENT_DATE || ' 13:15:00', 'half_day', 4.25, 0, 'Medical appointment in afternoon'),
(5, CURRENT_DATE, NULL, NULL, 'leave', 0.0, 0, 'Approved Sick Leave'),
(6, CURRENT_DATE, CURRENT_DATE || ' 09:48:00', NULL, 'incomplete', 0.0, 18, 'Client commute delay'),
(7, CURRENT_DATE, CURRENT_DATE || ' 08:55:00', NULL, 'incomplete', 0.0, 0, 'Active shift');
