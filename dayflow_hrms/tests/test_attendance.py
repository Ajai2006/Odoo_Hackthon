# -*- coding: utf-8 -*-
from odoo.tests.common import TransactionCase
from odoo.exceptions import ValidationError

class TestDayflowAttendance(TransactionCase):

    def setUp(self):
        super(TestDayflowAttendance, self).setUp()
        self.employee = self.env['hr.employee'].create({
            'name': 'Test Employee',
            'work_email': 'test.employee@dayflow.io',
        })

    def test_punctuality_on_time(self):
        attendance = self.env['hr.attendance'].create({
            'employee_id': self.employee.id,
            'check_in': '2026-08-22 09:00:00',
            'check_out': '2026-08-22 17:30:00',
        })
        self.assertEqual(attendance.punctuality_status, 'on_time')
        self.assertEqual(attendance.late_minutes, 0)

    def test_punctuality_late(self):
        attendance = self.env['hr.attendance'].create({
            'employee_id': self.employee.id,
            'check_in': '2026-08-22 09:45:00',
            'check_out': '2026-08-22 17:30:00',
        })
        self.assertEqual(attendance.punctuality_status, 'late')
        self.assertEqual(attendance.late_minutes, 15)

    def test_invalid_checkout(self):
        with self.assertRaises(ValidationError):
            self.env['hr.attendance'].create({
                'employee_id': self.employee.id,
                'check_in': '2026-08-22 09:00:00',
                'check_out': '2026-08-22 08:30:00',
            })
